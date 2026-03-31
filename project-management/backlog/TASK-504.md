# TASK-504: Branch Generate Phase on Generation Mode

**Story:** US-102 — Dual-Mode Pipeline — SDC & Code Component Branching
**Priority:** P0
**Effort:** L
**Milestone:** M26 — Code Component Generation

## Description

Branch the Generate phase in the pipeline based on `generationMode`. When mode is `code_components`, call the Designer Agent per section and produce Code Component config entities instead of SDC component trees. The SDC path must remain completely unchanged.

## Technical Approach

### 1. Mode Branch in `generate.ts`

Add a single branch at the top of the existing `runGeneratePhase()`:

```typescript
// platform-app/src/lib/pipeline/phases/generate.ts
export async function runGeneratePhase(
  siteId: string,
  data: OnboardingData,
  research: ResearchBrief,
  plan: ContentPlan,
  onProgress?: GenerateProgressCallback
): Promise<GeneratePhaseResult> {
  if (data.generationMode === "code_components") {
    return runCodeComponentGeneratePhase(siteId, data, research, plan, onProgress);
  }
  // ... existing SDC code unchanged
}
```

### 2. New File: `generate-code-components.ts`

**Core loop** — mirrors the SDC generate phase structure but calls the Designer Agent instead of `buildPageGenerationPrompt` + `generateValidatedJSON<PageLayout>`:

```typescript
export async function runCodeComponentGeneratePhase(
  siteId: string,
  data: OnboardingData,
  research: ResearchBrief,
  plan: ContentPlan,
  onProgress?: GenerateProgressCallback
): Promise<GeneratePhaseResult> {
  const startTime = Date.now();
  const pages: PageLayout[] = [];
  const codeComponentConfigs: Record<string, string> = {};
  const codeComponentMetadata: Array<{...}> = [];

  const genPages = process.env.GENERATE_HOMEPAGE_ONLY === "true"
    ? plan.pages.slice(0, 1)
    : plan.pages;

  for (let i = 0; i < genPages.length; i++) {
    const planPage = genPages[i];
    if (onProgress) await onProgress(planPage.title, i, genPages.length);

    const pageSections: PageSection[] = [];
    const pageTreeItems: ComponentTreeItem[] = [];
    const previousSections: Array<{ machineName: string; sectionType: string }> = [];

    for (const planSection of planPage.sections) {
      const brief = buildSectionDesignBrief(planSection, data, research);
      const result = await generateCodeComponent(brief, previousSections);

      // Accumulate config YAMLs and tree nodes
      codeComponentConfigs[result.output.machineName] = result.configYaml;
      pageTreeItems.push(result.treeNode);
      previousSections.push({
        machineName: result.output.machineName,
        sectionType: planSection.type,
      });

      // Build PageSection for blueprint compatibility
      pageSections.push({
        component_id: `js.${result.output.machineName}`,
        props: Object.fromEntries(
          result.output.props.map(p => [p.name, p.default ?? ""])
        ),
        _meta: {
          contentBrief: planSection.contentBrief,
          targetKeywords: planPage.targetKeywords,
          codeComponent: {
            machineName: result.output.machineName,
            generatedAt: new Date().toISOString(),
            validationPassed: result.validationResult.valid,
            retryCount: result.retryCount,
          },
        },
      });
    }

    pages.push({
      slug: planPage.slug,
      title: planPage.title,
      seo: { meta_title: planPage.title, meta_description: planPage.purpose },
      sections: pageSections,
      component_tree: pageTreeItems,
    });
  }

  // Generate header + footer as code components
  const headerResult = await generateCodeComponent(
    buildHeaderBrief(data, research, plan)
  );
  codeComponentConfigs[headerResult.output.machineName] = headerResult.configYaml;

  const footerResult = await generateCodeComponent(
    buildFooterBrief(data, research, plan)
  );
  codeComponentConfigs[footerResult.output.machineName] = footerResult.configYaml;

  // Assemble BlueprintBundle
  const blueprint: BlueprintBundle = {
    site: { name: data.name || plan.siteName, /* ... same as SDC */ },
    brand: { colors: data.colors || {}, fonts: data.fonts || { heading: "Inter", body: "Inter" }, logo_url: data.logo_url },
    pages,
    content: { services: [...], team_members: [...], testimonials: [...] },
    forms: { contact: { fields: defaultFormFields } },
    header: { region: "header", component_tree: [headerResult.treeNode] },
    footer: { region: "footer", component_tree: [footerResult.treeNode] },
    _codeComponents: {
      configs: codeComponentConfigs,
      metadata: codeComponentMetadata,
    },
  };

  // Save to database (same pattern as SDC path)
  await prisma.blueprint.update({
    where: { siteId },
    data: { payload: blueprint, status: "ready", generationStep: "ready" },
  });

  return { blueprint, durationMs: Date.now() - startTime, pagesGenerated: pages.length };
}
```

### 3. Brief Builder Helper

```typescript
function buildSectionDesignBrief(
  planSection: ContentPlanSection,
  data: OnboardingData,
  research: ResearchBrief
): SectionDesignBrief {
  const prefs = data.designPreferences || {
    animationLevel: "moderate",
    visualStyle: "minimal",
    interactivity: "static",
  };
  return {
    heading: planSection.heading,
    contentBrief: planSection.contentBrief,
    sectionType: planSection.type,
    position: planSection.position ?? 0,
    brandTokens: {
      colors: data.colors || {},
      fonts: data.fonts || { heading: "Inter", body: "Inter" },
    },
    toneGuidance: research.toneGuidance?.primary || "professional",
    animationLevel: prefs.animationLevel,
    visualStyle: prefs.visualStyle,
  };
}
```

### 4. Header/Footer Briefs

Specialized briefs that provide navigation context:

```typescript
function buildHeaderBrief(data, research, plan): SectionDesignBrief {
  const pageLinks = plan.pages.map(p => `${p.title} (/${p.slug})`).join(", ");
  return {
    heading: data.name || plan.siteName,
    contentBrief: `Site header navigation with logo, menu links (${pageLinks}), and CTA button. Include mobile hamburger menu.`,
    sectionType: "header",
    position: 0,
    brandTokens: { colors: data.colors || {}, fonts: data.fonts || { heading: "Inter", body: "Inter" } },
    toneGuidance: research.toneGuidance?.primary || "professional",
    animationLevel: "subtle",  // headers always subtle
    visualStyle: data.designPreferences?.visualStyle || "minimal",
  };
}
```

### 5. BlueprintBundle Type Extension

Add `_codeComponents` to `BlueprintBundle` in `types.ts`:

```typescript
export interface BlueprintBundle {
  // ... existing fields
  _codeComponents?: {
    configs: Record<string, string>;
    metadata: Array<{
      machineName: string;
      name: string;
      sectionType: string;
      pageSlug: string;
      generatedAt: string;
    }>;
  };
}
```

## Acceptance Criteria

- [ ] `generationMode === "design_system"` executes existing SDC path with zero code changes (regression-safe)
- [ ] `generationMode === "code_components"` calls Designer Agent per section, producing JSX/Tailwind components
- [ ] Blueprint payload includes `_codeComponents.configs` with YAML strings keyed by machine name
- [ ] Each page's `component_tree` contains `js.[machineName]` tree items
- [ ] Header and footer generated as code components with navigation context
- [ ] Progress messages emitted per page: `onProgress(pageName, pageIndex, totalPages)`
- [ ] `_meta.codeComponent` attached to each section with generation metadata
- [ ] `GENERATE_HOMEPAGE_ONLY=true` env flag works in code component mode (matching SDC behavior)
- [ ] Unit tests with mocked Designer Agent covering: full pipeline, SDC regression, error handling

## Dependencies
- TASK-500 (generationMode field), TASK-501 (config-builder), TASK-503 (prompt), TASK-508 (designer-agent)

## Files to Create / Modify

- **Create:** `platform-app/src/lib/pipeline/phases/generate-code-components.ts`
- **Modify:** `platform-app/src/lib/pipeline/phases/generate.ts` (add 3-line mode branch)
- **Modify:** `platform-app/src/lib/blueprint/types.ts` (add `_codeComponents` to `BlueprintBundle`)
- **Create:** `platform-app/src/lib/pipeline/phases/__tests__/generate-code-components.test.ts`
