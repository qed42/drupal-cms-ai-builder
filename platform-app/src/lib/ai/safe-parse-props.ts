/**
 * Safely parse a props_json string from AI output.
 * Handles malformed JSON by attempting progressive recovery:
 * 1. Direct parse after stripping control characters
 * 2. Extract first valid JSON object via brace matching
 * 3. Attempt to close truncated JSON
 * 4. Fallback to empty object
 */
export function safeParsePropsJson(raw: string, componentId: string): Record<string, unknown> {
  const sanitized = raw.replace(/[\x00-\x1F\x7F]/g, " ");

  // Attempt 1: direct parse
  try {
    return JSON.parse(sanitized) as Record<string, unknown>;
  } catch {
    // continue to recovery
  }

  // Attempt 2: extract first JSON object via brace matching
  const startIdx = sanitized.indexOf("{");
  if (startIdx !== -1) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = startIdx; i < sanitized.length; i++) {
      const ch = sanitized[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(sanitized.slice(startIdx, i + 1)) as Record<string, unknown>;
          } catch {
            break;
          }
        }
      }
    }
    // Attempt 3: truncated JSON — try closing it
    if (depth > 0) {
      const truncated = sanitized.slice(startIdx) + "}".repeat(depth);
      try {
        return JSON.parse(truncated) as Record<string, unknown>;
      } catch {
        // fall through
      }
    }
  }

  // Attempt 4: give up, return empty props
  console.error(
    `[generate] Failed to parse props_json for component "${componentId}". Raw (first 200 chars): ${raw.slice(0, 200)}`
  );
  return {};
}
