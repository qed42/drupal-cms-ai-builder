#!/usr/bin/env tsx
/**
 * Fix existing sites where canvas code components were imported without
 * compiled JS/CSS. Reads all js_component configs from Drupal, compiles
 * them locally via SWC + Lightning CSS, and writes compiled output back.
 *
 * Usage:
 *   npx tsx src/fix-compiled-components.ts --domain pk-r75i.ai-site-builder.ddev.site
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { compileComponentJs, compileComponentCss } from "./utils/canvas-compiler.js";

const execFileAsync = promisify(execFile);

const domain = process.argv.find((_, i) => process.argv[i - 1] === "--domain");
if (!domain) {
  console.error("Usage: npx tsx src/fix-compiled-components.ts --domain <site-domain>");
  process.exit(1);
}

const container = process.env.DDEV_WEB_CONTAINER || "ddev-ai-site-builder-web";
const drushBin = "/var/www/html/vendor/bin/drush";

async function drushEval(php: string): Promise<string> {
  const { stdout } = await execFileAsync("docker", [
    "exec", container, drushBin,
    `--root=/var/www/html`, `--uri=${domain}`,
    "php:eval", php, "-y",
  ], { timeout: 60_000 });
  return stdout.trim();
}

async function main() {
  // 1. List all js_component config names
  const configListRaw = await drushEval(
    `$names = \\Drupal::configFactory()->listAll('canvas.js_component.'); echo json_encode($names);`
  );
  const configNames: string[] = JSON.parse(configListRaw);

  if (configNames.length === 0) {
    console.log("No canvas.js_component configs found.");
    return;
  }

  console.log(`Found ${configNames.length} code component(s): ${configNames.join(", ")}`);

  // 2. For each component, read original, compile, and write back compiled
  let fixed = 0;
  let skipped = 0;
  let failed = 0;

  for (const configName of configNames) {
    try {
      // Read js and css fields
      const raw = await drushEval(
        `$c = \\Drupal::config('${configName}'); ` +
        `echo json_encode(['js' => $c->get('js'), 'css' => $c->get('css')]);`
      );
      const data = JSON.parse(raw) as {
        js: { original?: string; compiled?: string } | null;
        css: { original?: string; compiled?: string } | null;
      };

      const jsOriginal = data.js?.original || "";
      const cssOriginal = data.css?.original || "";
      const jsCompiled = data.js?.compiled || "";
      const cssCompiled = data.css?.compiled || "";

      // Skip if already compiled
      if (jsCompiled.length > 0 && (cssOriginal === "" || cssCompiled.length > 0)) {
        console.log(`  ${configName}: already compiled — skipping`);
        skipped++;
        continue;
      }

      // Compile JS
      let newJsCompiled = jsCompiled;
      if (jsOriginal && !jsCompiled) {
        newJsCompiled = compileComponentJs(jsOriginal);
        console.log(`  ${configName}: compiled JS (${newJsCompiled.length} bytes)`);
      }

      // Compile CSS
      let newCssCompiled = cssCompiled;
      if (cssOriginal && !cssCompiled) {
        newCssCompiled = compileComponentCss(cssOriginal);
        console.log(`  ${configName}: compiled CSS (${newCssCompiled.length} bytes)`);
      }

      // Write back via config API
      // Base64-encode the compiled output to avoid shell escaping issues
      const jsB64 = Buffer.from(newJsCompiled).toString("base64");
      const cssB64 = Buffer.from(newCssCompiled).toString("base64");

      await drushEval(
        `$config = \\Drupal::configFactory()->getEditable('${configName}'); ` +
        `$js = $config->get('js'); ` +
        `$js['compiled'] = base64_decode('${jsB64}'); ` +
        `$config->set('js', $js); ` +
        `$css = $config->get('css'); ` +
        `$css['compiled'] = base64_decode('${cssB64}'); ` +
        `$config->set('css', $css); ` +
        `$config->save();`
      );

      console.log(`  ${configName}: saved ✓`);
      fixed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ${configName}: FAILED — ${msg}`);
      failed++;
    }
  }

  // 3. Ensure UUIDs exist (needed for HMAC-based asset file paths)
  console.log("\nEnsuring UUIDs...");
  await drushEval(
    `$storage = \\Drupal::entityTypeManager()->getStorage('js_component'); ` +
    `$entities = $storage->loadMultiple(); ` +
    `$count = 0; ` +
    `foreach ($entities as $entity) { ` +
    `  if (empty($entity->uuid())) { ` +
    `    $uuid = \\Drupal::service('uuid')->generate(); ` +
    `    $config = \\Drupal::configFactory()->getEditable('canvas.js_component.' . $entity->id()); ` +
    `    $config->set('uuid', $uuid)->save(); ` +
    `    $count++; ` +
    `  } ` +
    `} ` +
    `echo $count . ' UUIDs generated';`
  ).then(console.log);

  // 4. Clear caches
  console.log("Clearing caches...");
  await drushEval(`drupal_flush_all_caches();`);

  // 5. Re-save entities through entity API to write asset files to disk
  console.log("Writing asset files to disk...");
  await drushEval(
    `\\Drupal::entityTypeManager()->getStorage('js_component')->resetCache(); ` +
    `$storage = \\Drupal::entityTypeManager()->getStorage('js_component'); ` +
    `$entities = $storage->loadMultiple(); ` +
    `$saved = 0; ` +
    `foreach ($entities as $entity) { $entity->save(); $saved++; } ` +
    `echo $saved . ' entities re-saved';`
  ).then(console.log);

  // 6. Generate Component entities (skipped during config import)
  console.log("Generating Component entities...");
  await drushEval(
    `$manager = \\Drupal::service('Drupal\\\\canvas\\\\ComponentSource\\\\ComponentSourceManager'); ` +
    `$manager->generateComponents('js'); ` +
    `echo 'done';`
  ).then(console.log);

  // 7. Fix placeholder versions in page region configs (header/footer)
  console.log("Fixing region placeholder versions...");
  await drushEval(
    `$comp_storage = \\Drupal::entityTypeManager()->getStorage('component'); ` +
    `$regions = \\Drupal::configFactory()->listAll('canvas.page_region.'); ` +
    `$fixed = 0; ` +
    `foreach ($regions as $name) { ` +
    `  $config = \\Drupal::configFactory()->getEditable($name); ` +
    `  $tree = $config->get('component_tree'); ` +
    `  if (!$tree) continue; ` +
    `  $changed = false; ` +
    `  foreach ($tree as &$node) { ` +
    `    if (($node['component_version'] ?? '') === '0000000000000000') { ` +
    `      $comp = $comp_storage->load($node['component_id']); ` +
    `      if ($comp) { $node['component_version'] = $comp->getActiveVersion(); $changed = true; } ` +
    `    } ` +
    `  } ` +
    `  if ($changed) { $config->set('component_tree', $tree)->save(); $fixed++; } ` +
    `} ` +
    `echo $fixed . ' regions fixed';`
  ).then(console.log);

  // Final cache rebuild
  await drushEval(`drupal_flush_all_caches();`);

  console.log(`\nDone: ${fixed} fixed, ${skipped} skipped, ${failed} failed`);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
