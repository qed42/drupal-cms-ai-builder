/**
 * TASK-506: Import Code Component config entities into Drupal.
 *
 * Reads _codeComponents.configs from the blueprint payload, compiles JSX→JS
 * via SWC and CSS via Lightning CSS (matching Canvas's compilation pipeline),
 * imports each as a canvas.js_component config entity, then queries the real
 * version hashes and rewrites the blueprint JSON so component_tree entries
 * use correct versions (instead of the placeholder "0000000000000000").
 *
 * Must run BEFORE import-blueprint so the blueprint has correct versions.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "js-yaml";
import { drush } from "../utils/drush.js";
import { compileComponentJs, compileComponentCss } from "../utils/canvas-compiler.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

const execFileAsync = promisify(execFile);

interface BlueprintPayload {
  _codeComponents?: {
    configs: Record<string, string>;
    metadata: Array<{
      machineName: string;
      name: string;
      sectionType: string;
      pageSlug: string;
    }>;
  };
  pages?: Array<{
    component_tree?: Array<{
      component_id: string;
      component_version: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }>;
  header?: {
    component_tree?: Array<{
      component_id: string;
      component_version: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  footer?: {
    component_tree?: Array<{
      component_id: string;
      component_version: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
}

export async function importCodeComponentsStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  // Read the blueprint file to check for code components
  const blueprintRaw = readFileSync(config.blueprintPath, "utf-8");
  const blueprint: BlueprintPayload = JSON.parse(blueprintRaw);

  if (!blueprint._codeComponents || Object.keys(blueprint._codeComponents.configs).length === 0) {
    logger.info("No code components in blueprint — skipping.", {
      step: "import-code-components",
    });
    return {
      success: true,
      message: "No code components to import",
    };
  }

  const configs = blueprint._codeComponents.configs;
  const componentCount = Object.keys(configs).length;
  logger.info(`Found ${componentCount} code component(s) to import.`, {
    step: "import-code-components",
  });

  const ddevWebContainer =
    process.env.DDEV_WEB_CONTAINER || "ddev-ai-site-builder-web";

  // Write YAML files to a local temp dir, then docker cp into the DDEV container.
  const localStagingDir = join("/tmp", `code-components-${config.siteId}`);
  if (!existsSync(localStagingDir)) {
    mkdirSync(localStagingDir, { recursive: true });
  }

  // Canvas requires fully-qualified URLs for image examples.
  // The enhance phase writes local paths (/uploads/stock/...) — rewrite
  // them to use the site's domain before importing.
  const siteBaseUrl = `https://${config.domain}`;

  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  for (const [machineName, yamlContent] of Object.entries(configs)) {
    // Replace relative image paths with fully-qualified URLs
    let fixedYaml = yamlContent.replace(
      /src: '(\/[^']+)'/g,
      `src: '${siteBaseUrl}$1'`
    );

    // Parse the YAML, add UUID, compile JS/CSS, and re-serialize
    try {
      const configData = yaml.load(fixedYaml) as Record<string, unknown>;

      // Canvas entities require a UUID for HMAC-based asset file paths.
      // Config imports via configFactory don't auto-generate UUIDs.
      if (!configData.uuid) {
        configData.uuid = crypto.randomUUID();
      }
      const jsField = configData.js as { original?: string; compiled?: string } | undefined;
      const cssField = configData.css as { original?: string; compiled?: string } | undefined;

      // Compile JS: JSX → ES2015 via SWC (same as Canvas CLI)
      if (jsField?.original) {
        const compiledJs = compileComponentJs(jsField.original);
        jsField.compiled = compiledJs;
        logger.info(`Compiled JS for ${machineName} (${compiledJs.length} bytes)`, {
          step: "import-code-components",
        });
      }

      // Compile CSS: Lightning CSS for browser compat (same as Canvas CLI)
      if (cssField?.original) {
        const compiledCss = compileComponentCss(cssField.original);
        cssField.compiled = compiledCss;
        logger.info(`Compiled CSS for ${machineName} (${compiledCss.length} bytes)`, {
          step: "import-code-components",
        });
      } else if (cssField) {
        // No original CSS — set compiled to empty string
        cssField.compiled = "";
      }

      fixedYaml = yaml.dump(configData, {
        lineWidth: -1, // Don't wrap lines
        noRefs: true,
        quotingType: "'",
        forceQuotes: false,
      });
    } catch (compileErr) {
      const msg = compileErr instanceof Error ? compileErr.message : String(compileErr);
      logger.warn(`Compilation failed for ${machineName}: ${msg} — importing without compiled output`, {
        step: "import-code-components",
      });
    }

    const filename = `canvas.js_component.${machineName}.yml`;
    const filepath = join(localStagingDir, filename);
    writeFileSync(filepath, fixedYaml, "utf-8");
    logger.info(`Wrote ${filename}`, { step: "import-code-components" });
  }

  // Copy files into the DDEV container
  const containerStagingDir = `/tmp/code-components-${config.siteId}`;

  await execFileAsync("docker", [
    "exec", ddevWebContainer, "mkdir", "-p", containerStagingDir,
  ]);

  await execFileAsync("docker", [
    "cp", `${localStagingDir}/.`, `${ddevWebContainer}:${containerStagingDir}/`,
  ]);

  logger.info(`Copied ${componentCount} config(s) to DDEV container`, {
    step: "import-code-components",
  });

  // Import each config entity individually via Drupal's Config API
  for (const [machineName] of Object.entries(configs)) {
    const configName = `canvas.js_component.${machineName}`;
    const containerPath = `${containerStagingDir}/canvas.js_component.${machineName}.yml`;

    await drush(
      "php:eval",
      [
        `$yaml = file_get_contents('${containerPath}'); ` +
        `$data = \\Symfony\\Component\\Yaml\\Yaml::parse($yaml); ` +
        `\\Drupal::configFactory()->getEditable('${configName}')->setData($data)->save();`,
      ],
      drushOptions
    );

    logger.info(`Imported ${configName}`, { step: "import-code-components" });
  }

  const machineNames = Object.keys(configs);

  // Clear caches so Canvas sees the new config entities
  await drush("cache:rebuild", [], drushOptions);

  // Generate Component entities for each js_component.
  // Canvas normally does this in JavascriptComponentStorage::doPostSave(),
  // but it's skipped when configInstaller->isSyncing() is true (which it is
  // during config imports). We must call generateComponents explicitly.
  const machineNamesList = machineNames.map((n) => `'${n}'`).join(", ");
  await drush(
    "php:eval",
    [
      `$manager = \\Drupal::service('Drupal\\\\canvas\\\\ComponentSource\\\\ComponentSourceManager'); ` +
      `$manager->generateComponents('js', [${machineNamesList}]);`,
    ],
    drushOptions
  );

  logger.info("Generated Component entities for all code components", {
    step: "import-code-components",
  });

  // Query the real version hashes from Canvas component entities.
  // Canvas creates `component` entities (ID: js.{machineName}) with an
  // `active_version` hash when JS component configs are saved.
  const versionMap: Record<string, string> = {};

  const versionPhp = machineNames
    .map((name) => `'js.${name}'`)
    .join(", ");

  const versionOutput = await drush(
    "php:eval",
    [
      `$storage = \\Drupal::entityTypeManager()->getStorage('component'); ` +
      `$ids = [${versionPhp}]; ` +
      `$components = $storage->loadMultiple($ids); ` +
      `$result = []; ` +
      `foreach ($components as $id => $c) { ` +
      `  $result[$id] = $c->getActiveVersion(); ` +
      `} ` +
      `echo json_encode($result);`,
    ],
    drushOptions
  );

  try {
    const versions = JSON.parse(versionOutput.trim());
    for (const [componentId, version] of Object.entries(versions)) {
      versionMap[componentId] = version as string;
    }
    logger.info(`Got ${Object.keys(versionMap).length} version hash(es)`, {
      step: "import-code-components",
    });
  } catch (err) {
    logger.warn(`Failed to parse version hashes: ${versionOutput}`, {
      step: "import-code-components",
    });
  }

  // Rewrite the blueprint JSON to replace placeholder versions with real hashes
  if (Object.keys(versionMap).length > 0) {
    const PLACEHOLDER_VERSION = "0000000000000000";

    function updateTreeVersions(
      tree: Array<{ component_id: string; component_version: string; [key: string]: unknown }> | undefined
    ): void {
      if (!tree) return;
      for (const node of tree) {
        if (
          node.component_version === PLACEHOLDER_VERSION &&
          versionMap[node.component_id]
        ) {
          node.component_version = versionMap[node.component_id];
        }
      }
    }

    // Update page component trees
    if (blueprint.pages) {
      for (const page of blueprint.pages) {
        updateTreeVersions(page.component_tree);
      }
    }

    // Update header/footer component trees
    updateTreeVersions(blueprint.header?.component_tree);
    updateTreeVersions(blueprint.footer?.component_tree);

    // Write the updated blueprint back
    writeFileSync(config.blueprintPath, JSON.stringify(blueprint, null, 2), "utf-8");

    // Also fix placeholder versions in already-imported Canvas page region
    // configs (header/footer). These are imported by the blueprint import step
    // and may contain placeholders that need real version hashes.
    const versionMapJson = JSON.stringify(versionMap).replace(/'/g, "\\'");
    await drush(
      "php:eval",
      [
        `$vmap = json_decode('${versionMapJson}', TRUE); ` +
        `$regions = \\Drupal::configFactory()->listAll('canvas.page_region.'); ` +
        `$fixed = 0; ` +
        `foreach ($regions as $name) { ` +
        `  $config = \\Drupal::configFactory()->getEditable($name); ` +
        `  $tree = $config->get('component_tree'); ` +
        `  if (!$tree) continue; ` +
        `  $changed = false; ` +
        `  foreach ($tree as &$node) { ` +
        `    if (($node['component_version'] ?? '') === '0000000000000000' && isset($vmap[$node['component_id']])) { ` +
        `      $node['component_version'] = $vmap[$node['component_id']]; ` +
        `      $changed = true; ` +
        `    } ` +
        `  } ` +
        `  if ($changed) { $config->set('component_tree', $tree)->save(); $fixed++; } ` +
        `} ` +
        `echo $fixed;`,
      ],
      drushOptions
    );

    logger.info("Updated blueprint with real component version hashes", {
      step: "import-code-components",
    });
  }

  return {
    success: true,
    message: `${componentCount} code component(s) compiled and imported into Drupal`,
    data: {
      componentCount,
      components: machineNames,
      versionMap,
    },
  };
}
