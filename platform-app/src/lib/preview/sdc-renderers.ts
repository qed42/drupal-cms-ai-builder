/**
 * TASK-518: SDC approximate renderer registry.
 *
 * Lightweight React-as-string renderers that approximate the visual output
 * of the top ~15 SDC component types for the design_system preview mode.
 *
 * These are serialized into the iframe srcdoc as inline JS —
 * they return React.createElement calls using Tailwind classes and
 * CSS custom properties (brand tokens).
 */

export interface SDCRendererProps {
  props: Record<string, unknown>;
  children?: Array<{ component_id: string; props: Record<string, unknown> }>;
}

/**
 * Returns the inline JavaScript source for all SDC approximate renderers.
 * This code runs inside the iframe with React available as a global.
 */
export function getSDCRendererSource(): string {
  return `
// SDC Approximate Renderer Registry
var SDC_RENDERERS = {};

// Utility: get prop with fallback
function p(props, key, fallback) {
  return props && props[key] != null ? props[key] : fallback;
}

// Utility: render slot children
function renderSlotChildren(children, slotName) {
  if (!children || !Array.isArray(children)) return null;
  return children
    .filter(function(c) { return c.slot === slotName; })
    .map(function(c, i) { return renderSDCComponent(c.component_id, c.props, null, i); });
}

// --- Hero ---
SDC_RENDERERS["hero"] = function HeroApprox(props, children) {
  var bgImage = p(props, "background_image", p(props, "image", ""));
  var bgUrl = typeof bgImage === "object" ? (bgImage.src || bgImage.url || "") : bgImage;
  var bgStyle = bgUrl ? { backgroundImage: "url(" + bgUrl + ")", backgroundSize: "cover", backgroundPosition: "center" } : {};
  return React.createElement("section", { className: "relative py-24 px-4 text-center", style: bgStyle },
    bgUrl ? React.createElement("div", { className: "absolute inset-0 bg-black/50" }) : null,
    React.createElement("div", { className: "relative max-w-4xl mx-auto" },
      React.createElement("h1", { className: "text-5xl font-bold mb-4", style: { fontFamily: "var(--font-heading)", color: bgUrl ? "white" : "var(--color-text, #1e293b)" } },
        p(props, "heading", p(props, "title", "Hero Title"))
      ),
      p(props, "subheading", p(props, "subtitle", "")) ?
        React.createElement("p", { className: "text-xl mb-8 opacity-80", style: { color: bgUrl ? "white" : "var(--color-text, #1e293b)" } },
          p(props, "subheading", p(props, "subtitle", ""))
        ) : null,
      p(props, "cta_text", "") ?
        React.createElement("a", {
          href: p(props, "cta_url", "#"),
          className: "inline-block px-8 py-3 rounded-lg font-semibold text-white",
          style: { backgroundColor: "var(--color-primary, #2563eb)" }
        }, p(props, "cta_text", "Get Started")) : null
    )
  );
};

// --- Section Heading ---
SDC_RENDERERS["section-heading"] = function SectionHeadingApprox(props) {
  return React.createElement("div", { className: "text-center py-8" },
    React.createElement("h2", { className: "text-3xl font-semibold mb-2", style: { fontFamily: "var(--font-heading)", color: "var(--color-text, #1e293b)" } },
      p(props, "heading", p(props, "title", "Section Title"))
    ),
    p(props, "subheading", p(props, "description", "")) ?
      React.createElement("p", { className: "text-lg opacity-70 max-w-2xl mx-auto" },
        p(props, "subheading", p(props, "description", ""))
      ) : null
  );
};

// --- Card ---
SDC_RENDERERS["card"] = function CardApprox(props) {
  var image = p(props, "image", "");
  var imgUrl = typeof image === "object" ? (image.src || image.url || "") : image;
  return React.createElement("div", { className: "rounded-xl shadow-md overflow-hidden bg-white" },
    imgUrl ? React.createElement("img", { src: imgUrl, alt: p(props, "title", ""), className: "w-full h-48 object-cover" }) : null,
    React.createElement("div", { className: "p-6" },
      React.createElement("h3", { className: "text-lg font-semibold mb-2", style: { color: "var(--color-text, #1e293b)" } },
        p(props, "title", p(props, "heading", "Card Title"))
      ),
      p(props, "body", p(props, "description", "")) ?
        React.createElement("p", { className: "text-sm opacity-70" }, p(props, "body", p(props, "description", ""))) : null,
      p(props, "link_text", p(props, "cta_text", "")) ?
        React.createElement("a", {
          href: p(props, "link_url", p(props, "cta_url", "#")),
          className: "inline-block mt-4 text-sm font-medium",
          style: { color: "var(--color-primary, #2563eb)" }
        }, p(props, "link_text", p(props, "cta_text", ""))) : null
    )
  );
};

// --- Button ---
SDC_RENDERERS["button"] = function ButtonApprox(props) {
  var variant = p(props, "variant", "primary");
  var isPrimary = variant === "primary";
  return React.createElement("a", {
    href: p(props, "url", p(props, "link", "#")),
    className: "inline-block px-6 py-3 rounded-lg font-semibold text-sm " + (isPrimary ? "text-white" : "border-2"),
    style: isPrimary
      ? { backgroundColor: "var(--color-primary, #2563eb)" }
      : { borderColor: "var(--color-primary, #2563eb)", color: "var(--color-primary, #2563eb)" }
  }, p(props, "text", p(props, "label", "Button")));
};

// --- Container / Flexi ---
SDC_RENDERERS["container"] = SDC_RENDERERS["flexi"] = function ContainerApprox(props, children) {
  var cols = p(props, "columns", p(props, "cols", 3));
  return React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 py-12 grid gap-8",
    style: { gridTemplateColumns: "repeat(" + cols + ", minmax(0, 1fr))" }
  }, renderSlotChildren(children, "content") || renderSlotChildren(children, "items"));
};

// --- Accordion ---
SDC_RENDERERS["accordion"] = function AccordionApprox(props) {
  var items = p(props, "items", p(props, "panels", []));
  if (!Array.isArray(items)) items = [];
  return React.createElement("div", { className: "max-w-3xl mx-auto py-8 space-y-2" },
    items.map(function(item, i) {
      return React.createElement("details", { key: i, className: "border rounded-lg p-4", open: i === 0 },
        React.createElement("summary", { className: "font-semibold cursor-pointer", style: { color: "var(--color-text, #1e293b)" } },
          item.title || item.heading || "Item " + (i + 1)
        ),
        React.createElement("p", { className: "mt-2 text-sm opacity-70" },
          item.body || item.content || item.description || ""
        )
      );
    })
  );
};

// --- Slider ---
SDC_RENDERERS["slider"] = function SliderApprox(props) {
  var items = p(props, "items", p(props, "slides", []));
  if (!Array.isArray(items)) items = [];
  return React.createElement("div", { className: "overflow-x-auto py-8" },
    React.createElement("div", { className: "flex gap-6 px-4", style: { minWidth: "max-content" } },
      items.map(function(item, i) {
        var imgUrl = typeof item.image === "object" ? (item.image.src || item.image.url || "") : (item.image || "");
        return React.createElement("div", { key: i, className: "w-72 shrink-0 rounded-xl shadow-md overflow-hidden bg-white" },
          imgUrl ? React.createElement("img", { src: imgUrl, alt: item.title || "", className: "w-full h-40 object-cover" }) : null,
          React.createElement("div", { className: "p-4" },
            React.createElement("h3", { className: "font-semibold" }, item.title || "Slide " + (i + 1)),
            item.description ? React.createElement("p", { className: "text-sm opacity-70 mt-1" }, item.description) : null
          )
        );
      })
    )
  );
};

// --- Contact Card ---
SDC_RENDERERS["contact-card"] = function ContactCardApprox(props) {
  return React.createElement("div", { className: "rounded-xl shadow-md p-6 bg-white max-w-md" },
    React.createElement("h3", { className: "text-lg font-semibold mb-4", style: { color: "var(--color-text, #1e293b)" } },
      p(props, "name", p(props, "title", "Contact"))
    ),
    p(props, "phone", "") ? React.createElement("p", { className: "text-sm mb-1" }, "Phone: " + p(props, "phone", "")) : null,
    p(props, "email", "") ? React.createElement("p", { className: "text-sm mb-1" }, "Email: " + p(props, "email", "")) : null,
    p(props, "address", "") ? React.createElement("p", { className: "text-sm opacity-70" }, p(props, "address", "")) : null
  );
};

// --- Logo ---
SDC_RENDERERS["logo"] = function LogoApprox(props) {
  var src = p(props, "src", p(props, "url", p(props, "image", "")));
  if (typeof src === "object") src = src.src || src.url || "";
  return React.createElement("div", { className: "py-4" },
    src
      ? React.createElement("img", { src: src, alt: p(props, "alt", "Logo"), className: "h-12 object-contain" })
      : React.createElement("span", { className: "text-xl font-bold", style: { color: "var(--color-primary, #2563eb)" } }, p(props, "alt", "Logo"))
  );
};

// --- Tabs ---
SDC_RENDERERS["tabs"] = function TabsApprox(props) {
  var items = p(props, "tabs", p(props, "items", []));
  if (!Array.isArray(items)) items = [];
  return React.createElement("div", { className: "max-w-3xl mx-auto py-8" },
    React.createElement("div", { className: "flex border-b gap-4 mb-4" },
      items.map(function(tab, i) {
        return React.createElement("button", {
          key: i,
          className: "pb-2 text-sm font-medium " + (i === 0 ? "border-b-2" : "opacity-50"),
          style: i === 0 ? { borderColor: "var(--color-primary, #2563eb)", color: "var(--color-primary, #2563eb)" } : {}
        }, tab.title || tab.label || "Tab " + (i + 1));
      })
    ),
    items.length > 0
      ? React.createElement("div", { className: "text-sm opacity-70" }, items[0].content || items[0].body || "")
      : null
  );
};

// --- List ---
SDC_RENDERERS["list"] = function ListApprox(props) {
  var items = p(props, "items", []);
  if (!Array.isArray(items)) items = [];
  var ordered = p(props, "ordered", false);
  var Tag = ordered ? "ol" : "ul";
  return React.createElement(Tag, { className: "max-w-2xl mx-auto py-4 space-y-2 " + (ordered ? "list-decimal" : "list-disc") + " list-inside" },
    items.map(function(item, i) {
      var text = typeof item === "string" ? item : (item.text || item.title || item.label || "");
      return React.createElement("li", { key: i, className: "text-sm", style: { color: "var(--color-text, #1e293b)" } }, text);
    })
  );
};

// --- Text Block ---
SDC_RENDERERS["text-block"] = function TextBlockApprox(props) {
  var content = p(props, "content", p(props, "body", p(props, "text", "")));
  // Split by double newlines to create paragraphs (avoids innerHTML)
  var paragraphs = typeof content === "string" ? content.split(/\\n\\n|<br\\s*\\/?>/) : [String(content)];
  return React.createElement("div", { className: "max-w-3xl mx-auto py-8 space-y-4", style: { fontFamily: "var(--font-body)", color: "var(--color-text, #1e293b)" } },
    paragraphs.map(function(para, i) {
      return React.createElement("p", { key: i, className: "text-base leading-relaxed" }, para.trim());
    })
  );
};

// --- Image ---
SDC_RENDERERS["image"] = function ImageApprox(props) {
  var src = p(props, "src", p(props, "url", p(props, "image", "")));
  if (typeof src === "object") src = src.src || src.url || "";
  return React.createElement("figure", { className: "py-4" },
    src ? React.createElement("img", { src: src, alt: p(props, "alt", ""), className: "w-full rounded-lg" }) : null,
    p(props, "caption", "") ? React.createElement("figcaption", { className: "text-sm text-center mt-2 opacity-60" }, p(props, "caption", "")) : null
  );
};

// --- Footer ---
SDC_RENDERERS["footer"] = function FooterApprox(props) {
  return React.createElement("footer", {
    className: "py-12 px-4",
    style: { backgroundColor: "var(--color-surface, #f8fafc)", color: "var(--color-text, #1e293b)" }
  },
    React.createElement("div", { className: "max-w-7xl mx-auto grid grid-cols-3 gap-8" },
      React.createElement("div", null,
        React.createElement("h4", { className: "font-semibold mb-2" }, p(props, "brand_name", "Brand")),
        React.createElement("p", { className: "text-sm opacity-70" }, p(props, "description", p(props, "brand_description", "")))
      ),
      React.createElement("div", null,
        React.createElement("h4", { className: "font-semibold mb-2" }, "Links"),
        React.createElement("p", { className: "text-sm opacity-50" }, "Navigation links")
      ),
      React.createElement("div", null,
        React.createElement("h4", { className: "font-semibold mb-2" }, "Contact"),
        React.createElement("p", { className: "text-sm opacity-50" }, p(props, "email", p(props, "contact", "")))
      )
    ),
    p(props, "disclaimer", p(props, "copyright", "")) ?
      React.createElement("div", { className: "max-w-7xl mx-auto mt-8 pt-4 border-t text-xs opacity-50" },
        p(props, "disclaimer", p(props, "copyright", ""))
      ) : null
  );
};

// --- Header (bonus) ---
SDC_RENDERERS["header"] = function HeaderApprox(props) {
  return React.createElement("header", {
    className: "py-4 px-6 flex items-center justify-between border-b",
    style: { backgroundColor: "var(--color-surface, #f8fafc)" }
  },
    React.createElement("span", { className: "text-xl font-bold", style: { fontFamily: "var(--font-heading)", color: "var(--color-primary, #2563eb)" } },
      p(props, "site_name", p(props, "logo_text", "Site"))
    ),
    React.createElement("nav", { className: "flex gap-6 text-sm" },
      React.createElement("span", { className: "opacity-60" }, "Home"),
      React.createElement("span", { className: "opacity-60" }, "About"),
      React.createElement("span", { className: "opacity-60" }, "Contact")
    ),
    p(props, "cta_text", "") ?
      React.createElement("a", {
        className: "px-4 py-2 rounded-lg text-sm text-white font-medium",
        style: { backgroundColor: "var(--color-primary, #2563eb)" }
      }, p(props, "cta_text", "")) : null
  );
};

// --- Unsupported Component Placeholder ---
function UnsupportedComponent(componentId, props) {
  var propKeys = props ? Object.keys(props).filter(function(k) { return !k.startsWith("_"); }).join(", ") : "none";
  return React.createElement("div", {
    className: "border-2 border-dashed border-gray-300 rounded-lg p-6 my-4 text-center"
  },
    React.createElement("p", { className: "text-sm font-medium text-gray-500" },
      "Component: " + componentId
    ),
    React.createElement("p", { className: "text-xs text-gray-400 mt-1" },
      "Props: " + propKeys
    )
  );
}

// --- Renderer lookup ---
function renderSDCComponent(componentId, props, children, key) {
  // Strip "sdc." or design system prefix to get base component type
  var baseId = componentId.replace(/^sdc\\.[^.]+\\.space-/, "").replace(/^sdc\\.[^.]+\\./, "");
  var renderer = SDC_RENDERERS[baseId];
  if (renderer) {
    return React.createElement("div", { key: key }, renderer(props || {}, children));
  }
  return React.createElement("div", { key: key }, UnsupportedComponent(componentId, props));
}

window.__renderSDCComponent = renderSDCComponent;
window.__SDC_RENDERERS = SDC_RENDERERS;
`;
}

/** List of supported SDC component types. */
export const SUPPORTED_SDC_TYPES = [
  "hero",
  "section-heading",
  "card",
  "button",
  "container",
  "flexi",
  "accordion",
  "slider",
  "contact-card",
  "logo",
  "tabs",
  "list",
  "text-block",
  "image",
  "footer",
  "header",
] as const;
