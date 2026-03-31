/**
 * Design Rules Engine — Public API (M27).
 *
 * Enabled by default for code_components mode.
 * Set ENABLE_DESIGN_RULES=false to explicitly opt out.
 */

import { inferPersona } from "./persona-inferrer";
import { resolveDesignRules } from "./resolver";
import { compileRulesToPromptFragment } from "./prompt-compiler";
import type { DesignRuleSet } from "./types";

export type { DesignRuleSet } from "./types";

interface DesignRulesInput {
  generationMode?: string;
  industry?: string;
  audience?: string;
  tone?: string;
}

interface DesignRulesResult {
  fragment: string;
  ruleset: DesignRuleSet;
}

/**
 * Resolve design rules and compile to a prompt fragment.
 *
 * Returns null when:
 * - ENABLE_DESIGN_RULES is explicitly "false"
 * - Generation mode is not "code_components"
 * - No rules resolve (empty ruleset)
 */
export function getDesignRules(data: DesignRulesInput): DesignRulesResult | null {
  if (process.env.ENABLE_DESIGN_RULES === "false") return null;
  if (data.generationMode !== "code_components") return null;

  const industry = data.industry || "";
  if (!industry) return null;

  const persona = inferPersona(industry, data.audience, data.tone);
  const ruleset = resolveDesignRules(industry, persona);
  const fragment = compileRulesToPromptFragment(ruleset);

  if (!fragment) return null;

  return { fragment, ruleset };
}
