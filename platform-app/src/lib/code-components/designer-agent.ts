/**
 * Designer Agent — AI-powered code component generator (M26 TASK-508).
 *
 * Calls the AI provider with a specialized prompt, validates the output
 * via the Code Component Validator, and retries with error feedback on failure.
 */

import { getAIProvider } from "@/lib/ai/factory";
import { generateValidatedJSON } from "@/lib/ai/validation";
import {
  buildCodeComponentPrompt,
  formatValidationFeedbackForRetry,
  CodeComponentResponseSchema,
} from "@/lib/ai/prompts/code-component-generation";
import type { CodeComponentResponse } from "@/lib/ai/prompts/code-component-generation";
import { validateCodeComponent } from "./validator";
import { buildConfigYaml, wrapAsCanvasTreeNode } from "./config-builder";
import type { ComponentTreeItem } from "@/lib/blueprint/types";
import type {
  SectionDesignBrief,
  CodeComponentOutput,
  ValidationResult,
} from "./types";
import { selectCuratedComponent } from "@/lib/curated-components/loader";
import { getApplicableTrends } from "@/lib/curated-components/trends-loader";
import type { CuratedPromptContext } from "@/lib/ai/prompts/code-component-generation";

const MAX_VALIDATION_RETRIES = 2;
const CODE_COMPONENT_MAX_TOKENS = 6000;

export class DesignerAgentError extends Error {
  constructor(
    message: string,
    public readonly sectionType: string,
    public readonly lastValidation?: ValidationResult
  ) {
    super(message);
    this.name = "DesignerAgentError";
  }
}

export interface DesignerAgentResult {
  output: CodeComponentOutput;
  configYaml: string;
  treeNode: ComponentTreeItem;
  validationResult: ValidationResult;
  retryCount: number;
}

/**
 * Generate a unique Drupal machine name for a code component.
 */
function generateMachineName(sectionType: string, pageSlug?: string): string {
  const hash = crypto.randomUUID().slice(0, 6);
  const sanitizedType = sectionType.replace(/[^a-z0-9]/g, "_").slice(0, 30);
  const sanitizedSlug = pageSlug
    ? `_${pageSlug.replace(/[^a-z0-9]/g, "_").slice(0, 20)}`
    : "";
  return `${sanitizedType}${sanitizedSlug}_${hash}`;
}

/**
 * Map an AI response to our internal CodeComponentOutput type.
 */
function mapResponseToOutput(
  response: CodeComponentResponse,
  brief: SectionDesignBrief,
  pageSlug?: string
): CodeComponentOutput {
  return {
    machineName:
      response.machineName || generateMachineName(brief.sectionType, pageSlug),
    name: response.name,
    jsx: response.jsx,
    css: response.css,
    props: response.props.map((p) => ({
      name: p.name,
      type: p.type,
      required: p.required,
      default: p.default,
      description: p.description,
    })),
    slots: response.slots,
  };
}

/**
 * Generate a single code component from a section design brief.
 *
 * Flow:
 * 1. Build prompt from brief
 * 2. Call AI provider with Zod-validated JSON generation (handles malformed JSON retries)
 * 3. Map response to CodeComponentOutput
 * 4. Run custom validator (a11y, security, motion-safety)
 * 5. If validation fails, retry with error feedback (max 2 retries)
 * 6. Build config YAML and Canvas tree node
 * 7. Return bundled result
 */
export async function generateCodeComponent(
  brief: SectionDesignBrief,
  previousSections?: Array<{ machineName: string; sectionType: string }>,
  pageSlug?: string,
  designRulesFragment?: string
): Promise<DesignerAgentResult> {
  const provider = await getAIProvider("generate");

  // Select curated reference component and applicable trends
  const curatedComponent = selectCuratedComponent(
    brief.sectionType,
    brief.visualStyle,
    brief.animationLevel
  );
  const trendSuggestions = getApplicableTrends(
    brief.sectionType,
    brief.visualStyle,
    3
  );

  const curatedContext: CuratedPromptContext = {
    selectedComponent: curatedComponent ?? undefined,
    trendSuggestions: trendSuggestions.length > 0 ? trendSuggestions : undefined,
  };

  const basePrompt = buildCodeComponentPrompt(brief, previousSections, designRulesFragment, curatedContext);

  let lastValidation: ValidationResult | undefined;

  for (let attempt = 0; attempt <= MAX_VALIDATION_RETRIES; attempt++) {
    // Build prompt — append validation feedback on retries
    const prompt =
      attempt === 0 || !lastValidation
        ? basePrompt
        : `${basePrompt}\n\n${formatValidationFeedbackForRetry(lastValidation.errors)}`;

    // Level 1: Zod validation + self-correction (handled by generateValidatedJSON)
    const response = await generateValidatedJSON<CodeComponentResponse>(
      provider,
      prompt,
      CodeComponentResponseSchema,
      {
        phase: "generate",
        maxTokens: CODE_COMPONENT_MAX_TOKENS,
        temperature: 0.65,
      }
    );

    // Map AI response to internal type
    const output = mapResponseToOutput(response, brief, pageSlug);

    // Level 2: Custom validation (a11y, security, motion-reduce)
    const validationResult = validateCodeComponent(output);
    lastValidation = validationResult;

    if (validationResult.valid) {
      // Build downstream artifacts
      const configYaml = buildConfigYaml(output);
      const propValues = Object.fromEntries(
        output.props.map((p) => {
          let val = p.default ?? "";
          // Canvas validates URL-typed inputs with strict RFC 3986 URI
          // validation (format: uri). Only absolute URIs pass — bare "#",
          // relative paths, and description text all fail.
          if (p.type === "link" && typeof val === "string") {
            const isUrl = /^(https?:\/\/|mailto:|tel:)/.test(val);
            if (!isUrl) val = "https://example.com";
          }
          return [p.name, val];
        })
      );
      const treeNode = wrapAsCanvasTreeNode(output.machineName, propValues);

      return {
        output,
        configYaml,
        treeNode,
        validationResult,
        retryCount: attempt,
      };
    }

    // Log validation issues
    const errorSummary = validationResult.errors
      .map((e) => `[${e.rule}] ${e.message}`)
      .join("; ");
    console.warn(
      `[designer-agent] Validation failed for ${brief.sectionType} (attempt ${attempt + 1}/${MAX_VALIDATION_RETRIES + 1}): ${errorSummary}`
    );
  }

  // All retries exhausted — throw with context
  throw new DesignerAgentError(
    `Code component generation failed for "${brief.sectionType}" after ${MAX_VALIDATION_RETRIES + 1} attempts. ` +
      `Last errors: ${lastValidation?.errors.map((e) => e.message).join("; ") ?? "unknown"}`,
    brief.sectionType,
    lastValidation
  );
}
