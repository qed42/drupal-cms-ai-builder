/**
 * TASK-516: Build preview HTML (srcdoc constructor).
 *
 * Constructs the full HTML document used as the iframe's srcdoc.
 * Assembles brand tokens, Tailwind CDN, Google Fonts, React UMD,
 * section renderers, and security policies into a single HTML string.
 *
 * SECURITY NOTE: The iframe runs with sandbox="allow-scripts" (no allow-same-origin).
 * AI-generated JSX is pre-sanitized (TASK-519) and CSP blocks all network access.
 * The architecture (section 3.2) requires dynamic code execution for transpiled
 * JSX — this is safe because the iframe has no access to the parent page's
 * DOM, cookies, storage, or network. See architecture-live-blueprint-preview.md.
 */

import type { PreviewPayload } from "./types";
import { brandTokensToCss, googleFontsLink } from "./brand-tokens-css";
import { CSP_META_TAG, sanitizeJsx } from "./sanitize";
import { getSDCRendererSource } from "./sdc-renderers";

/**
 * React 18.3.1 UMD — last version with browser UMD builds.
 * React 19 dropped UMD, so the preview iframe uses 18.3.1 which is
 * API-compatible for the JSX patterns our Designer Agent produces.
 */
const REACT_UMD = "https://unpkg.com/react@18.3.1/umd/react.production.min.js";
const REACT_DOM_UMD = "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js";

/**
 * Babel standalone for in-browser JSX transpilation.
 * Sucrase has no browser bundle, so we use Babel standalone which
 * provides window.Babel with full JSX/TSX support.
 */
const BABEL_STANDALONE = "https://unpkg.com/@babel/standalone@7.26.10/babel.min.js";

/** Tailwind CDN URL. */
const TAILWIND_CDN = "https://cdn.tailwindcss.com";

/**
 * Escape a string for safe embedding inside a JS string literal.
 * This avoids HTML entity encoding — we embed the data directly
 * as a JS string assigned to a variable.
 */
function escapeForJsString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/<\//g, "<\\/");  // Prevent </script> from closing our script tag
}

/**
 * Build the complete HTML document for the preview iframe.
 */
export function buildPreviewHtml(payload: PreviewPayload): string {
  const brandCss = brandTokensToCss(payload.brand, payload.designTokens);
  const fontsUrl = googleFontsLink([payload.brand.fonts.heading, payload.brand.fonts.body]);

  // Sanitize all code component sources before embedding
  const sanitizedSources: Record<string, { jsx: string; css: string }> = {};
  for (const [key, source] of Object.entries(payload.codeComponentSources)) {
    sanitizedSources[key] = {
      jsx: sanitizeJsx(source.jsx),
      css: source.css,
    };
  }
  const sanitizedPayload = { ...payload, codeComponentSources: sanitizedSources };

  // Serialize and escape for safe JS string embedding
  const jsonData = escapeForJsString(JSON.stringify(sanitizedPayload));

  const isCodeComponents = payload.generationMode === "code_components";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="${CSP_META_TAG}" />
  <title>Preview</title>
  <script src="${TAILWIND_CDN}"><\/script>
  ${fontsUrl ? `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${fontsUrl}" />` : ""}
  <style>
    ${brandCss}
    * { box-sizing: border-box; }
    body { margin: 0; font-family: var(--font-body, system-ui, sans-serif); color: var(--color-text, #1e293b); }
    [data-section-index] { position: relative; transition: outline 0.15s ease; }
    [data-section-index]:hover { outline: 2px solid rgba(59, 130, 246, 0.5); outline-offset: -2px; cursor: pointer; }
    [data-section-index].section-active { outline: 2px solid rgba(59, 130, 246, 0.8); outline-offset: -2px; }
    .section-error { padding: 2rem; text-align: center; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; margin: 1rem 0; }
    .section-error h3 { color: #991b1b; font-size: 0.875rem; font-weight: 600; }
    .section-error p { color: #b91c1c; font-size: 0.75rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script src="${REACT_UMD}"><\/script>
  <script src="${REACT_DOM_UMD}"><\/script>

  ${isCodeComponents ? `<script src="${BABEL_STANDALONE}"><\/script>` : ""}

  ${!isCodeComponents ? `<script>${getSDCRendererSource()}<\/script>` : ""}

  <script>
    window.__PREVIEW_DATA__ = JSON.parse("${jsonData}");
  <\/script>

  <script>
    (function() {
      var data = window.__PREVIEW_DATA__;
      if (!data) return;

      // --- Error Boundary (class component for componentDidCatch) ---
      function createErrorBoundary() {
        function EB(props) {
          React.Component.call(this, props);
          this.state = { hasError: false, error: null };
        }
        EB.prototype = Object.create(React.Component.prototype);
        EB.prototype.constructor = EB;
        EB.getDerivedStateFromError = function(error) {
          return { hasError: true, error: error };
        };
        EB.prototype.render = function() {
          if (this.state.hasError) {
            return React.createElement("div", { className: "section-error" },
              React.createElement("h3", null, "Section render error"),
              React.createElement("p", null, this.state.error ? this.state.error.message : "Unknown error")
            );
          }
          return this.props.children;
        };
        return EB;
      }
      var ErrorBoundary = createErrorBoundary();

      // --- Section wrapper with click/hover handlers ---
      function SectionWrapper(props) {
        return React.createElement("div", {
          "data-section-index": props.index,
          onClick: function(e) {
            e.stopPropagation();
            window.parent.postMessage({ type: "section-click", sectionIndex: props.index }, "*");
          },
          onMouseEnter: function() {
            window.parent.postMessage({ type: "section-hover", sectionIndex: props.index, hovering: true }, "*");
          },
          onMouseLeave: function() {
            window.parent.postMessage({ type: "section-hover", sectionIndex: props.index, hovering: false }, "*");
          }
        },
          React.createElement(ErrorBoundary, null, props.children)
        );
      }

      // --- Code components: transpile and render via scoped execution ---
      // SECURITY: All JSX is pre-sanitized server-side (TASK-519) before embedding.
      // This iframe has sandbox="allow-scripts" without allow-same-origin,
      // plus CSP connect-src:'none'. See architecture doc section 5.
      function renderCodeComponent(jsx, css, sectionProps) {
        if (!jsx) return React.createElement("div", { className: "section-error" },
          React.createElement("h3", null, "No JSX source"),
          React.createElement("p", null, "Code component source not found")
        );

        try {
          var transpiled = Babel.transform(jsx, {
            presets: [["react", { runtime: "classic" }], "typescript"],
            filename: "component.tsx"
          }).code;

          // Provide React and utility functions in scope
          var scope = {
            React: React,
            cn: function() { return Array.prototype.slice.call(arguments).filter(Boolean).join(" "); },
            clsx: function() { return Array.prototype.slice.call(arguments).filter(Boolean).join(" "); }
          };

          var keys = Object.keys(scope);
          var vals = keys.map(function(k) { return scope[k]; });

          // Strip export statements — not valid inside Function body
          var cleaned = transpiled
            .replace(/export\\s+default\\s+/g, "")
            .replace(/export\\s*\\{[^}]*\\}[^;]*;?/g, "")
            .replace(/exports\\[?"?default"?\\]?\\s*=\\s*/g, "")
            .replace(/Object\\.defineProperty\\(exports[^)]*\\)[^;]*;?/g, "");

          // Find component name: "function Name(" or "var/let/const Name ="
          var match = cleaned.match(/function\\s+([A-Z][a-zA-Z0-9]*)\\s*\\(/)
                  || cleaned.match(/(?:var|let|const)\\s+([A-Z][a-zA-Z0-9]*)\\s*=/);
          var componentName = match ? match[1] : null;

          if (!componentName) {
            return React.createElement("div", { className: "section-error" },
              React.createElement("h3", null, "Component not found"),
              React.createElement("p", null, "Could not resolve component from transpiled code")
            );
          }

          var componentCode = cleaned + "\\nreturn " + componentName + ";";
          // Dynamic code execution is architecturally required here (see section 3.2).
          // The iframe sandbox prevents any access to parent context.
          var createComponent = Function.apply(null, keys.concat([componentCode]));
          var Component = createComponent.apply(null, vals);

          return React.createElement(React.Fragment, null,
            css ? React.createElement("style", null, css) : null,
            React.createElement(Component, sectionProps || {})
          );
        } catch (err) {
          return React.createElement("div", { className: "section-error" },
            React.createElement("h3", null, "Render error"),
            React.createElement("p", null, err.message || "Failed to render component")
          );
        }
      }

      // --- Build section elements ---
      var sections = data.page.sections || [];
      var sectionElements = sections.map(function(section, i) {
        var content;
        if (data.generationMode === "code_components") {
          var machineName = section._meta && section._meta.codeComponent
            ? section._meta.codeComponent.machineName
            : section.component_id.replace("js.", "");
          var source = data.codeComponentSources[machineName];
          content = renderCodeComponent(
            source ? source.jsx : null,
            source ? source.css : null,
            section.props
          );
        } else {
          // design_system mode — use SDC approximate renderers
          content = window.__renderSDCComponent
            ? window.__renderSDCComponent(section.component_id, section.props, section.children, i)
            : React.createElement("div", null, "SDC renderer not loaded");
        }
        return React.createElement(SectionWrapper, { key: i, index: i }, content);
      });

      // --- Mount ---
      try {
        var container = document.getElementById("root");
        if (ReactDOM.createRoot) {
          var root = ReactDOM.createRoot(container);
          root.render(React.createElement(React.Fragment, null, sectionElements));
        } else {
          ReactDOM.render(React.createElement(React.Fragment, null, sectionElements), container);
        }
        // Signal ready
        window.parent.postMessage({ type: "ready" }, "*");
      } catch (mountErr) {
        document.getElementById("root").textContent = "Preview error: " + mountErr.message;
        window.parent.postMessage({ type: "ready" }, "*");
      }

      // --- Listen for parent messages ---
      window.addEventListener("message", function(e) {
        var msg = e.data;
        if (!msg || !msg.type) return;
        var allowed = ["update-props", "replace-section", "update-section"];
        if (allowed.indexOf(msg.type) === -1) return;
        console.log("[preview] received:", msg.type, msg);
      });
    })();
  <\/script>
</body>
</html>`;
}
