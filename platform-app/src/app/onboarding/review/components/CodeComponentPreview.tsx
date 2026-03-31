"use client";

/**
 * TASK-507: Code Component Preview for the review editor.
 * Renders JSX source with syntax highlighting and CSS in a collapsible panel.
 */

import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";

interface CodeComponentPreviewProps {
  /** The code component machine name (from component_id "js.{name}"). */
  machineName: string;
  /** JSX source code. */
  jsx?: string;
  /** CSS/Tailwind source code. */
  css?: string;
  /** Component props with their current values. */
  props: Record<string, unknown>;
}

/** Syntax-highlighted code block. */
function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className="overflow-x-auto rounded-lg text-xs leading-relaxed p-4"
          style={{ ...style, background: "rgba(255,255,255,0.03)" }}
        >
          {tokens.map((line, i) => {
            const lineProps = getLineProps({ line });
            return (
              <div key={i} {...lineProps}>
                <span className="inline-block w-8 text-right mr-4 text-white/20 select-none">
                  {i + 1}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}

export default function CodeComponentPreview({
  machineName,
  jsx,
  css,
  props,
}: CodeComponentPreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "jsx" | "css">("preview");

  // Format the component name for display
  const displayName = machineName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/5 pb-2">
        <TabButton
          active={activeTab === "preview"}
          onClick={() => setActiveTab("preview")}
          label="Props"
        />
        {jsx && (
          <TabButton
            active={activeTab === "jsx"}
            onClick={() => setActiveTab("jsx")}
            label="View JSX"
          />
        )}
        {css && (
          <TabButton
            active={activeTab === "css"}
            onClick={() => setActiveTab("css")}
            label="View CSS"
          />
        )}
      </div>

      {/* Content */}
      {activeTab === "preview" && (
        <div className="space-y-1.5">
          <PropsList props={props} />
        </div>
      )}

      {activeTab === "jsx" && jsx && (
        <CodeBlock code={jsx} language="tsx" />
      )}

      {activeTab === "css" && css && (
        <CodeBlock code={css} language="css" />
      )}
    </div>
  );
}

/** Tab button component. */
function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1 rounded-md transition-colors ${
        active
          ? "bg-brand-500/20 text-brand-400"
          : "text-white/40 hover:text-white/60 hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );
}

/** Render prop key-value pairs. */
function PropsList({ props }: { props: Record<string, unknown> }) {
  const entries = Object.entries(props).filter(
    ([key, v]) => v !== null && v !== undefined && !key.startsWith("_")
  );

  if (entries.length === 0) {
    return <p className="text-xs text-white/20 italic">No properties</p>;
  }

  return (
    <>
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-2 text-xs py-0.5">
          <span className="text-white/40 shrink-0">
            {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
          <span className="text-white/60 truncate">
            {formatValue(value)}
          </span>
        </div>
      ))}
    </>
  );
}

/** Format a prop value for display. */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value.length > 120 ? value.slice(0, 120) + "..." : value || "—";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (Array.isArray(value)) return `[${value.length} items]`;
    const obj = value as Record<string, unknown>;
    // Image objects
    if ("url" in obj) return obj.url as string;
    if ("src" in obj) return obj.src as string;
    return `{${Object.keys(obj).join(", ")}}`;
  }
  return String(value);
}
