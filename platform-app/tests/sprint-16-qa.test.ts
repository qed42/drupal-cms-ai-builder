/**
 * Sprint 16 QA Tests — Provisioning Hardening, Layout Correctness & Auth
 *
 * Covers: TASK-285 (stock images fix), TASK-250/251 (step timing & progress UI),
 * TASK-252 (per-site DB users), TASK-253 (failure detail & resume),
 * TASK-282 (layout wrapper rules), TASK-284 (auth fix)
 */
import { describe, it, expect } from "vitest";
import { buildComponentTree } from "../src/lib/blueprint/component-tree-builder";
import { toCanvasComponentId, getComponentVersion } from "../src/lib/blueprint/canvas-component-versions";

// ============================================================================
// TASK-285: Stock Image Path Fix — Step Ordering
// ============================================================================
describe("TASK-285: Stock image rendering — provisioning step order", () => {
  it("copyStockImages step runs BEFORE importBlueprint in the pipeline", async () => {
    // Read the provisioning orchestrator to verify step order
    const fs = await import("fs/promises");
    const provisionSource = await fs.readFile(
      new URL("../../provisioning/src/provision.ts", import.meta.url),
      "utf-8"
    );

    // Extract step names in order from the steps array
    const stepMatches = [...provisionSource.matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1]);

    const copyIdx = stepMatches.indexOf("Copy stock images");
    const importIdx = stepMatches.indexOf("Import blueprint");
    const brandIdx = stepMatches.indexOf("Apply brand tokens");

    expect(copyIdx).toBeGreaterThan(-1);
    expect(importIdx).toBeGreaterThan(-1);
    expect(brandIdx).toBeGreaterThan(-1);

    // CRITICAL: Copy images must run BEFORE blueprint import
    expect(copyIdx).toBeLessThan(importIdx);
    // Brand tokens should also be applied before import
    expect(brandIdx).toBeLessThan(importIdx);
  });
});

// ============================================================================
// TASK-250/251: Provisioning Step Timing & Progress UI
// ============================================================================
describe("TASK-250/251: Provisioning step labels & progress callbacks", () => {
  it("all 12 provisioning steps have user-friendly labels", async () => {
    const fs = await import("fs/promises");
    const provisionSource = await fs.readFile(
      new URL("../../provisioning/src/provision.ts", import.meta.url),
      "utf-8"
    );

    // Extract labels from the steps array
    const labelMatches = [...provisionSource.matchAll(/label:\s*"([^"]+)"/g)].map(m => m[1]);

    expect(labelMatches.length).toBe(12);

    // Labels should be user-friendly (no technical jargon)
    const technicalTerms = ["drush", "mysql", "php", "npm", "docker", "settings.php", "sites.php"];
    for (const label of labelMatches) {
      for (const term of technicalTerms) {
        expect(label.toLowerCase()).not.toContain(term);
      }
    }
  });

  it("sendProgressCallback is called within the step loop", async () => {
    const fs = await import("fs/promises");
    const provisionSource = await fs.readFile(
      new URL("../../provisioning/src/provision.ts", import.meta.url),
      "utf-8"
    );

    // Verify sendProgressCallback is imported and used
    expect(provisionSource).toContain("sendProgressCallback");
    expect(provisionSource).toContain("await sendProgressCallback(config, stepNum, totalSteps, step.label, logger)");
  });

  it("step timing is tracked with Date.now()", async () => {
    const fs = await import("fs/promises");
    const provisionSource = await fs.readFile(
      new URL("../../provisioning/src/provision.ts", import.meta.url),
      "utf-8"
    );

    // Verify per-step timing
    expect(provisionSource).toContain("const stepStart = Date.now()");
    expect(provisionSource).toContain("stepElapsed");
  });

  it("callback route handles progress status updates", async () => {
    const fs = await import("fs/promises");
    const callbackSource = await fs.readFile(
      new URL("../src/app/api/provision/callback/route.ts", import.meta.url),
      "utf-8"
    );

    // Verify progress handling branch exists
    expect(callbackSource).toContain('status === "progress"');
    expect(callbackSource).toContain("current_step");
    expect(callbackSource).toContain("total_steps");
    expect(callbackSource).toContain("step_label");

    // Verify pipelinePhase format
    expect(callbackSource).toContain("provision:${current_step}/${total_steps}:${step_label}");
  });

  it("status API maps provisioning steps to 70-99% range", async () => {
    const fs = await import("fs/promises");
    const statusSource = await fs.readFile(
      new URL("../src/app/api/provision/status/route.ts", import.meta.url),
      "utf-8"
    );

    // Verify provisioning progress parsing
    expect(statusSource).toContain('pipelinePhase?.startsWith("provision:")');
    expect(statusSource).toContain("provisioningProgress");
    // Maps to 70-99 range
    expect(statusSource).toContain("70 + Math.round((current / total) * 29)");
  });
});

// ============================================================================
// TASK-252: Per-Site MariaDB User Creation
// ============================================================================
describe("TASK-252: Per-site database user creation", () => {
  it("config includes siteDatabase with generated credentials", async () => {
    const fs = await import("fs/promises");
    const provisionSource = await fs.readFile(
      new URL("../../provisioning/src/provision.ts", import.meta.url),
      "utf-8"
    );

    // Verify per-site credentials are generated
    expect(provisionSource).toContain("siteDbName");
    expect(provisionSource).toContain("siteDbUser");
    expect(provisionSource).toContain("siteDbPassword");
    expect(provisionSource).toContain("randomBytes(32)");
    expect(provisionSource).toContain("base64url");
  });

  it("siteDatabase user is truncated to 32 chars max", async () => {
    const fs = await import("fs/promises");
    const provisionSource = await fs.readFile(
      new URL("../../provisioning/src/provision.ts", import.meta.url),
      "utf-8"
    );

    expect(provisionSource).toContain('.slice(0, 32)');
  });

  it("database utility creates dedicated user with escaped password", async () => {
    const fs = await import("fs/promises");
    const dbSource = await fs.readFile(
      new URL("../../provisioning/src/utils/database.ts", import.meta.url),
      "utf-8"
    );

    // Password is escaped (DDL statements don't support ? placeholders in mysql2)
    expect(dbSource).toContain("safePassword");
    expect(dbSource).toContain("IDENTIFIED BY '${safePassword}'");
    // Supports retries
    expect(dbSource).toContain("CREATE USER IF NOT EXISTS");
    // Flushes privileges
    expect(dbSource).toContain("FLUSH PRIVILEGES");
  });

  it("settings.php uses per-site credentials, not shared admin user", async () => {
    const fs = await import("fs/promises");
    const settingsSource = await fs.readFile(
      new URL("../../provisioning/src/steps/02-generate-settings.ts", import.meta.url),
      "utf-8"
    );

    // Should use siteDatabase credentials
    expect(settingsSource).toContain("config.siteDatabase");
    expect(settingsSource).toContain("name: dbName, user: dbUser, password: dbPassword");
    // Should NOT use shared admin credentials
    expect(settingsSource).not.toContain("config.database.user");
    expect(settingsSource).not.toContain("config.database.password");
  });

  it("rollback drops both database and per-site user", async () => {
    const fs = await import("fs/promises");
    const dbSource = await fs.readFile(
      new URL("../../provisioning/src/utils/database.ts", import.meta.url),
      "utf-8"
    );

    expect(dbSource).toContain("DROP USER IF EXISTS");
  });
});

// ============================================================================
// TASK-253: Provisioning Failure Detail & Resume
// ============================================================================
describe("TASK-253: Provisioning failure detail and retry", () => {
  it("failure callback includes step detail", async () => {
    const fs = await import("fs/promises");
    const callbackSource = await fs.readFile(
      new URL("../../provisioning/src/steps/11-callback.ts", import.meta.url),
      "utf-8"
    );

    expect(callbackSource).toContain("failedStep");
    expect(callbackSource).toContain("failedStepName");
    expect(callbackSource).toContain("totalSteps");
    expect(callbackSource).toContain("payload.failed_step");
  });

  it("callback route stores failure step detail in database", async () => {
    const fs = await import("fs/promises");
    const routeSource = await fs.readFile(
      new URL("../src/app/api/provision/callback/route.ts", import.meta.url),
      "utf-8"
    );

    // Error message includes step info
    expect(routeSource).toContain("failed_step");
    expect(routeSource).toContain("failed_step_name");
    expect(routeSource).toContain("pipelineError: errorDetail");
  });

  it("provision start route clears error state on retry", async () => {
    const fs = await import("fs/promises");
    const startSource = await fs.readFile(
      new URL("../src/app/api/provision/start/route.ts", import.meta.url),
      "utf-8"
    );

    expect(startSource).toContain("pipelineError: null");
    expect(startSource).toContain("pipelinePhase: null");
  });

  it("progress page handles provisioning retry differently from generation retry", async () => {
    const fs = await import("fs/promises");
    const progressSource = await fs.readFile(
      new URL("../src/app/onboarding/progress/page.tsx", import.meta.url),
      "utf-8"
    );

    expect(progressSource).toContain("isProvisioningFailure");
    expect(progressSource).toContain('siteStatus === "provisioning_failed"');
    expect(progressSource).toContain("/api/provision/start");
  });
});

// ============================================================================
// TASK-282: Layout Wrapper Rules — Container Wrapping & Anti-Monotony
// ============================================================================
describe("TASK-282: Layout wrapper rules (v2 — slot-based composition)", () => {
  it("full-width organisms (hero-banner-style-02) render at root without container", () => {
    const sections = [
      {
        component_id: "space_ds:space-hero-banner-style-02",
        props: { title: "Welcome" },
      },
    ];

    const tree = buildComponentTree(sections);

    // Full-width organism: 1 item at root
    expect(tree).toHaveLength(1);
    expect(tree[0].component_id).toBe(toCanvasComponentId("space_ds:space-hero-banner-style-02"));
    expect(tree[0].parent_uuid).toBeNull();
    expect(tree[0].slot).toBeNull();
  });

  it("full-width hero-banner-with-media renders at root without container", () => {
    const sections = [
      { component_id: "space_ds:space-hero-banner-with-media", props: { title: "Welcome" } },
    ];

    const tree = buildComponentTree(sections);
    expect(tree).toHaveLength(1);
    expect(tree[0].parent_uuid).toBeNull();
  });

  it("CTA banner type-1 renders at root (full-width organism)", () => {
    const sections = [
      { component_id: "space_ds:space-cta-banner-type-1", props: { title: "Contact Us" } },
    ];

    const tree = buildComponentTree(sections);

    // CTA banner type-1 is in FULL_WIDTH_ORGANISMS
    expect(tree[0].parent_uuid).toBeNull();
    expect(tree[0].component_id).toBe(toCanvasComponentId("space_ds:space-cta-banner-type-1"));
  });

  it("CTA banner with children nests them correctly", () => {
    const sections = [
      {
        component_id: "space_ds:space-cta-banner-type-1",
        props: { title: "Get Started" },
        children: [
          { component_id: "space_ds:space-button", slot: "content", props: { label: "Sign Up" } },
        ],
      },
    ];

    const tree = buildComponentTree(sections);

    // CTA (1) + button child (1) = 2
    expect(tree).toHaveLength(2);
    expect(tree[0].parent_uuid).toBeNull();
    expect(tree[1].parent_uuid).toBe(tree[0].uuid);
    expect(tree[1].slot).toBe("content");
  });

  it("composed section builds container → flexi → children structure", () => {
    const sections = [
      {
        pattern: "text-image-split-50-50",
        component_id: "space_ds:space-flexi",
        props: {},
        children: [
          { component_id: "space_ds:space-heading", slot: "column_one", props: { text: "Title" } },
          { component_id: "space_ds:space-image", slot: "column_two", props: { src: "/photo.jpg" } },
        ],
      },
    ];

    const tree = buildComponentTree(sections);

    // container (1) + flexi (1) + 2 children = 4
    expect(tree.length).toBeGreaterThanOrEqual(3);

    // First item: container at root
    const container = tree[0];
    expect(container.component_id).toBe(toCanvasComponentId("space_ds:space-container"));
    expect(container.parent_uuid).toBeNull();

    // Flexi parented to container
    const flexi = tree.find(item => item.component_id === toCanvasComponentId("space_ds:space-flexi"));
    expect(flexi).toBeDefined();
    expect(flexi!.parent_uuid).toBe(container.uuid);
    expect(flexi!.slot).toBe("content");
    expect(flexi!.inputs).toHaveProperty("column_width", "50-50");

    // Children parented to flexi
    const children = tree.filter(item =>
      item.parent_uuid === flexi!.uuid
    );
    expect(children).toHaveLength(2);
    expect(children[0].slot).toBe("column_one");
    expect(children[1].slot).toBe("column_two");
  });

  it("mixed page: hero at root, composed section in container, CTA at root", () => {
    const sections = [
      { component_id: "space_ds:space-hero-banner-style-02", props: { title: "Welcome" } },
      {
        pattern: "full-width-text",
        component_id: "space_ds:space-flexi",
        props: {},
        children: [
          { component_id: "space_ds:space-text", slot: "column_one", props: { body: "About us" } },
        ],
      },
      { component_id: "space_ds:space-cta-banner-type-1", props: { title: "Get Started" } },
    ];

    const tree = buildComponentTree(sections);

    // Hero: root level
    expect(tree[0].component_id).toContain("hero-banner");
    expect(tree[0].parent_uuid).toBeNull();

    // Last item: CTA at root level
    const cta = tree[tree.length - 1];
    expect(cta.component_id).toContain("cta-banner");
    expect(cta.parent_uuid).toBeNull();
  });

  it("container uses correct version hash from canvas catalog", () => {
    const sections = [
      {
        pattern: "full-width-text",
        component_id: "space_ds:space-flexi",
        props: {},
        children: [
          { component_id: "space_ds:space-text", slot: "column_one", props: { body: "Test" } },
        ],
      },
    ];

    const tree = buildComponentTree(sections);
    const container = tree[0];

    expect(container.component_version).toBe(
      getComponentVersion("space_ds:space-container")
    );
    // Should not be the fallback "0000000000000000"
    expect(container.component_version).not.toBe("0000000000000000");
  });
});

// ============================================================================
// TASK-284: Auth Fix — One-Time Login
// ============================================================================
describe("TASK-284: Auth replacement — drush uli", () => {
  it("login route uses docker exec + drush instead of JWT", async () => {
    const fs = await import("fs/promises");
    const authSource = await fs.readFile(
      new URL("../src/app/api/auth/create-login-token/route.ts", import.meta.url),
      "utf-8"
    );

    // Should NOT import JWT
    expect(authSource).not.toContain("createAutoLoginToken");
    expect(authSource).not.toContain("jwt");

    // Should use docker exec + drush
    expect(authSource).toContain("execFileAsync");
    expect(authSource).toContain("docker");
    expect(authSource).toContain("user:login");
    expect(authSource).toContain("--uid=1");
    expect(authSource).toContain("--redirect-path=/canvas");
  });

  it("login URL base is rewritten from drush output to actual site URL", async () => {
    const fs = await import("fs/promises");
    const authSource = await fs.readFile(
      new URL("../src/app/api/auth/create-login-token/route.ts", import.meta.url),
      "utf-8"
    );

    // Rewrites the base URL
    expect(authSource).toContain("loginUrl.replace");
    expect(authSource).toContain("site.drupalUrl");
  });

  it("SiteCard has Visit Site button for live sites", async () => {
    const fs = await import("fs/promises");
    const siteCardSource = await fs.readFile(
      new URL("../src/components/dashboard/SiteCard.tsx", import.meta.url),
      "utf-8"
    );

    expect(siteCardSource).toContain("Visit Site");
    expect(siteCardSource).toContain('target="_blank"');
    expect(siteCardSource).toContain('rel="noopener noreferrer"');
    expect(siteCardSource).toContain("site.drupalUrl");
  });
});

// ============================================================================
// TASK-286: Stock Images — Canvas Image Field Entity Resolution
// ============================================================================
describe("TASK-286: BlueprintImportService resolves image props to file entities", () => {
  it("BlueprintImportService has resolveImageInputs method", async () => {
    const fs = await import("fs/promises");
    const importServiceSource = await fs.readFile(
      new URL(
        "../../drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php",
        import.meta.url
      ),
      "utf-8"
    );

    // Core fix: resolveImageInputs converts { src, alt } → media entity ID
    expect(importServiceSource).toContain("function resolveImageInputs");
    expect(importServiceSource).toContain("prop_field_definitions");
    expect(importServiceSource).toContain("entity_reference");
    expect(importServiceSource).toContain("'media'");
    expect(importServiceSource).toContain("createMediaEntityFromImage");
  });

  it("createMediaEntityFromImage creates file + media entities from web paths", async () => {
    const fs = await import("fs/promises");
    const importServiceSource = await fs.readFile(
      new URL(
        "../../drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php",
        import.meta.url
      ),
      "utf-8"
    );

    // Creates both file entity and media entity
    expect(importServiceSource).toContain("function createMediaEntityFromImage");
    expect(importServiceSource).toContain("public://");
    expect(importServiceSource).toContain("/sites/[^/]+/files/");
    expect(importServiceSource).toContain("'bundle' => 'image'");
    expect(importServiceSource).toContain("field_media_image");
    expect(importServiceSource).toContain("$media->save()");
  });

  it("prepareComponentTree calls resolveImageInputs for each component", async () => {
    const fs = await import("fs/promises");
    const importServiceSource = await fs.readFile(
      new URL(
        "../../drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php",
        import.meta.url
      ),
      "utf-8"
    );

    // Verify resolveImageInputs is called in prepareComponentTree
    expect(importServiceSource).toContain("resolveImageInputs($inputs, $componentEntity)");
  });

  it("service definition includes file_system dependency", async () => {
    const fs = await import("fs/promises");
    const servicesSource = await fs.readFile(
      new URL(
        "../../drupal-site/web/modules/custom/ai_site_builder/ai_site_builder.services.yml",
        import.meta.url
      ),
      "utf-8"
    );

    expect(servicesSource).toContain("@file_system");
  });

  it("skips already-resolved inputs with sourceType or target_id", async () => {
    const fs = await import("fs/promises");
    const importServiceSource = await fs.readFile(
      new URL(
        "../../drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php",
        import.meta.url
      ),
      "utf-8"
    );

    // Should skip if already in Canvas format
    expect(importServiceSource).toContain("isset($imageData['sourceType'])");
    expect(importServiceSource).toContain("isset($imageData['target_id'])");
  });
});

// ============================================================================
// Cross-cutting: TypeScript compilation
// ============================================================================
describe("Cross-cutting: Type safety", () => {
  it("ProvisioningConfig includes siteDatabase field", async () => {
    const fs = await import("fs/promises");
    const typesSource = await fs.readFile(
      new URL("../../provisioning/src/types.ts", import.meta.url),
      "utf-8"
    );

    expect(typesSource).toContain("siteDatabase:");
    expect(typesSource).toContain("name: string");
    expect(typesSource).toContain("user: string");
    expect(typesSource).toContain("password: string");
  });
});
