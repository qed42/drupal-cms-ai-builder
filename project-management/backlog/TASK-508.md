# TASK-508: Designer Agent — Generation Function with Validation Loop

**Story:** US-101 — Designer Agent — AI-Generated Custom Sections
**Priority:** P0
**Effort:** L
**Milestone:** M26 — Code Component Generation

## Description

Implement the `generateCodeComponent()` function — the core Designer Agent that calls the AI provider, validates output via the Code Component Validator, and retries with error feedback on failure. This is the execution half of US-101; TASK-503 provides the prompt and schema.

## Technical Approach

### 1. Core Function (`designer-agent.ts`)

```typescript
import { getAIProvider, resolveModel } from "@/lib/ai/factory";
import { generateValidatedJSON } from "@/lib/ai/validation";
import { buildCodeComponentPrompt, CodeComponentResponseSchema } from "@/lib/ai/prompts/code-component-generation";
import { validateCodeComponent } from "./validator";
import { buildConfigYaml, wrapAsCanvasTreeNode } from "./config-builder";
import type { SectionDesignBrief, CodeComponentOutput, ValidationResult } from "./types";

export interface DesignerAgentResult {
  output: CodeComponentOutput;
  configYaml: string;
  treeNode: ComponentTreeItem;
  validationResult: ValidationResult;
  retryCount: number;
}

export async function generateCodeComponent(
  brief: SectionDesignBrief,
  previousSections?: Array<{ machineName: string; sectionType: string }>
): Promise<DesignerAgentResult>;
```

### 2. Execution Flow

```
1. Build prompt via buildCodeComponentPrompt(brief, previousSections)
2. Call generateValidatedJSON(provider, prompt, CodeComponentResponseSchema)
   ← Zod validation + self-correction handled by validation.ts (up to 2 retries)
3. Map CodeComponentResponse → CodeComponentOutput
4. Run validateCodeComponent(output) ← TASK-502 validator
5. If validation errors:
   a. Append error feedback to prompt
   b. Re-call generateValidatedJSON with augmented prompt
   c. Re-validate (max 2 total validation retries)
6. Build config YAML: buildConfigYaml(output)
7. Build tree node: wrapAsCanvasTreeNode(output.machineName, propValues)
8. Return DesignerAgentResult
```

**Two-level retry:**
- **Level 1 (Zod):** `generateValidatedJSON` handles malformed JSON / schema violations (built-in, up to 2 retries)
- **Level 2 (Validator):** Our custom validation (a11y, security, motion-reduce) triggers a full re-generation with error context

### 3. Error Feedback Format

When validator fails, append to prompt:

```
--- CODE COMPONENT VALIDATION ERRORS ---
[structure] Missing default export — component must use "export default function"
[a11y] Image on line 15 missing alt attribute
[security] Detected "fetch" call on line 23 — external requests not allowed

Please fix these issues and regenerate the component.
```

### 4. Machine Name Generation

Each component needs a unique machine name for Drupal config entity ID:

```typescript
function generateMachineName(sectionType: string, pageSlug: string): string {
  const hash = crypto.randomUUID().slice(0, 6);
  const sanitized = sectionType.replace(/[^a-z0-9]/g, '_');
  return `${sanitized}_${pageSlug.replace(/[^a-z0-9]/g, '_')}_${hash}`;
}
// e.g., "hero_home_a3f7b2", "features_services_c9d1e4"
```

### 5. Provider Configuration

Use the existing `getAIProvider("generate")` pattern. Token budget is higher for code components:

```typescript
const maxTokens = 6000; // vs ~2000 for SDC prop filling
```

Allow model override via `AI_MODEL_CODE_COMPONENT` env var (falls back to `AI_MODEL_GENERATE`).

## Acceptance Criteria

- [ ] `generateCodeComponent(brief)` returns a valid `DesignerAgentResult`
- [ ] Uses `generateValidatedJSON` with `CodeComponentResponseSchema` for Zod-level validation
- [ ] Runs TASK-502 validator on output; retries with feedback on failure (max 2 retries)
- [ ] Machine names are valid Drupal identifiers (lowercase, underscores, ≤63 chars)
- [ ] Config YAML is pre-built and included in result
- [ ] Canvas tree node is pre-built and included in result
- [ ] Graceful failure: throws `DesignerAgentError` with context after all retries exhausted
- [ ] Unit tests with mocked AI provider covering: success path, Zod retry, validator retry, max retries exceeded

## Dependencies
- TASK-501 (config-builder), TASK-502 (validator), TASK-503 (prompt + schema)

## Files to Create

- `platform-app/src/lib/code-components/designer-agent.ts`
- `platform-app/src/lib/code-components/__tests__/designer-agent.test.ts`
