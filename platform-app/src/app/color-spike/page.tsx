/**
 * TASK-339: Tailwind v4 Color System Spike
 *
 * Tests three approaches for defining custom colors in Tailwind v4:
 * - Option A: :root CSS vars referenced via @theme inline
 * - Option B: @theme (without inline) with direct hex values
 * - Option C: @theme inline with direct hex values (current approach, new colors)
 *
 * The current globals.css uses Option C with teal colors.
 * Sprint 23 found that changing those teal values didn't render correctly.
 * This spike tests with completely new color hues to rule out caching.
 *
 * HOW TO VERIFY:
 * 1. Run `npm run dev` (Turbopack)
 * 2. Visit /color-spike
 * 3. Inspect each colored element → computed style should match the hex shown
 * 4. Test in Chrome, Firefox, Safari
 */

export default function ColorSpikePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">Tailwind v4 Color System Spike</h1>
      <p className="text-white/50 mb-8">
        TASK-339 — Inspect computed styles to verify colors render correctly.
      </p>

      {/* ============================================ */}
      {/* SECTION 1: Brand Primary Scale (indigo)      */}
      {/* Uses @theme inline with direct hex — Option C */}
      {/* ============================================ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-1">1. Brand Primary Scale</h2>
        <p className="text-white/40 text-sm mb-4">
          Defined via <code className="text-cyan-400">@theme inline</code> with direct hex values.
          Expected: indigo hue (#4F46E5 at 500).
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { shade: "50", cls: "bg-brand-50", hex: "#EEF2FF", textCls: "text-slate-900" },
            { shade: "100", cls: "bg-brand-100", hex: "#E0E7FF", textCls: "text-slate-900" },
            { shade: "200", cls: "bg-brand-200", hex: "#C7D2FE", textCls: "text-slate-900" },
            { shade: "300", cls: "bg-brand-300", hex: "#A5B4FC", textCls: "text-slate-900" },
            { shade: "400", cls: "bg-brand-400", hex: "#818CF8", textCls: "text-white" },
            { shade: "500", cls: "bg-brand-500", hex: "#4F46E5", textCls: "text-white" },
            { shade: "600", cls: "bg-brand-600", hex: "#4338CA", textCls: "text-white" },
            { shade: "700", cls: "bg-brand-700", hex: "#3730A3", textCls: "text-white" },
            { shade: "800", cls: "bg-brand-800", hex: "#312E81", textCls: "text-white" },
            { shade: "900", cls: "bg-brand-900", hex: "#1E1B4B", textCls: "text-white" },
            { shade: "950", cls: "bg-brand-950", hex: "#0F0D2E", textCls: "text-white" },
          ].map((c) => (
            <div
              key={c.shade}
              className={`${c.cls} ${c.textCls} rounded-lg px-4 py-3 text-sm font-mono min-w-[100px]`}
            >
              <div className="font-bold">{c.shade}</div>
              <div className="text-xs opacity-80">{c.hex}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: Accent Scale (cyan)               */}
      {/* Uses @theme inline with direct hex — Option C */}
      {/* ============================================ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-1">2. Accent Scale</h2>
        <p className="text-white/40 text-sm mb-4">
          Defined via <code className="text-cyan-400">@theme inline</code> with direct hex values.
          Expected: cyan hue (#06B6D4 at 500).
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { shade: "50", cls: "bg-accent-50", hex: "#ECFEFF", textCls: "text-slate-900" },
            { shade: "100", cls: "bg-accent-100", hex: "#CFFAFE", textCls: "text-slate-900" },
            { shade: "200", cls: "bg-accent-200", hex: "#A5F3FC", textCls: "text-slate-900" },
            { shade: "300", cls: "bg-accent-300", hex: "#67E8F9", textCls: "text-slate-900" },
            { shade: "400", cls: "bg-accent-400", hex: "#22D3EE", textCls: "text-slate-900" },
            { shade: "500", cls: "bg-accent-500", hex: "#06B6D4", textCls: "text-white" },
            { shade: "600", cls: "bg-accent-600", hex: "#0891B2", textCls: "text-white" },
            { shade: "700", cls: "bg-accent-700", hex: "#0E7490", textCls: "text-white" },
            { shade: "800", cls: "bg-accent-800", hex: "#155E75", textCls: "text-white" },
            { shade: "900", cls: "bg-accent-900", hex: "#164E63", textCls: "text-white" },
            { shade: "950", cls: "bg-accent-950", hex: "#083344", textCls: "text-white" },
          ].map((c) => (
            <div
              key={c.shade}
              className={`${c.cls} ${c.textCls} rounded-lg px-4 py-3 text-sm font-mono min-w-[100px]`}
            >
              <div className="font-bold">{c.shade}</div>
              <div className="text-xs opacity-80">{c.hex}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: Option A — :root vars + @theme    */}
      {/* ============================================ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-1">3. Option A Test — :root vars + @theme inline</h2>
        <p className="text-white/40 text-sm mb-4">
          Uses <code className="text-cyan-400">:root</code> CSS vars referenced via{" "}
          <code className="text-cyan-400">var()</code> inside{" "}
          <code className="text-cyan-400">@theme inline</code>.
          Expected: test-a color = coral (#FF6B6B).
        </p>
        <div className="flex gap-3">
          <div className="bg-test-a rounded-lg px-6 py-4 text-white font-mono">
            <div className="font-bold">bg-test-a</div>
            <div className="text-xs opacity-80">Expected: #FF6B6B</div>
          </div>
          <div className="rounded-lg px-6 py-4 border-2 border-test-a text-test-a font-mono">
            <div className="font-bold">border-test-a / text-test-a</div>
            <div className="text-xs opacity-80">Expected: #FF6B6B</div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: Semantic Colors (built-in)        */}
      {/* ============================================ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-1">4. Semantic Colors (Tailwind built-ins)</h2>
        <p className="text-white/40 text-sm mb-4">
          Using Tailwind&apos;s built-in color utilities. Should always work.
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="bg-green-600 text-white rounded-lg px-6 py-3 font-mono text-sm">
            Success (green-600)
          </div>
          <div className="bg-amber-500 text-slate-900 rounded-lg px-6 py-3 font-mono text-sm">
            Warning (amber-500)
          </div>
          <div className="bg-red-600 text-white rounded-lg px-6 py-3 font-mono text-sm">
            Error (red-600)
          </div>
          <div className="bg-blue-500 text-white rounded-lg px-6 py-3 font-mono text-sm">
            Info (blue-500)
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: Interactive States                */}
      {/* ============================================ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-1">5. Interactive States</h2>
        <p className="text-white/40 text-sm mb-4">
          Buttons, focus rings, hover states using custom brand + accent colors.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="rounded-full bg-brand-500 px-8 py-3 text-white font-medium hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/25">
            Brand Primary Button
          </button>
          <button className="rounded-full bg-accent-500 px-8 py-3 text-white font-medium hover:bg-accent-400 transition-colors shadow-lg shadow-accent-500/25">
            Accent CTA Button
          </button>
          <button className="rounded-full border-2 border-brand-500 px-8 py-3 text-brand-400 font-medium hover:bg-brand-500/10 transition-colors">
            Brand Outline Button
          </button>
          <input
            type="text"
            placeholder="Focus ring test (click me)"
            className="rounded-xl bg-white/10 px-6 py-3 text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: Gradients                         */}
      {/* ============================================ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-1">6. Gradients</h2>
        <p className="text-white/40 text-sm mb-4">
          Gradient utilities matching StepIcon.tsx patterns.
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-lg">
            A
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold shadow-lg">
            B
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-600 flex items-center justify-center text-white font-bold shadow-lg">
            C
          </div>
          <div className="h-16 flex-1 rounded-2xl bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500 flex items-center justify-center text-white font-bold shadow-lg">
            Brand → Accent → Brand gradient
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: Contrast Check                    */}
      {/* ============================================ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-1">7. WCAG AA Contrast on Dark Backgrounds</h2>
        <p className="text-white/40 text-sm mb-4">
          Text legibility on the onboarding dark background (slate-950 / #0f172a).
        </p>
        <div className="bg-[#0f172a] rounded-xl p-6 space-y-3 border border-white/10">
          <p className="text-brand-400 text-lg">Brand-400 on dark bg — #818CF8 (expected: ≥4.5:1)</p>
          <p className="text-brand-300 text-lg">Brand-300 on dark bg — #A5B4FC (expected: ≥4.5:1)</p>
          <p className="text-accent-400 text-lg">Accent-400 on dark bg — #22D3EE (expected: ≥4.5:1)</p>
          <p className="text-accent-300 text-lg">Accent-300 on dark bg — #67E8F9 (expected: ≥4.5:1)</p>
          <p className="text-white/60 text-lg">White/60 on dark bg (expected: ≥4.5:1)</p>
          <p className="text-white/40 text-lg">White/40 on dark bg (expected: may fail — decorative only)</p>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 8: Summary / Verification Notes      */}
      {/* ============================================ */}
      <section className="mb-12 bg-white/5 rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Verification Checklist</h2>
        <ul className="space-y-2 text-white/70 text-sm">
          <li>□ Brand-500 computed bg = <code className="text-brand-400">#4F46E5</code> (indigo)</li>
          <li>□ Accent-500 computed bg = <code className="text-accent-400">#06B6D4</code> (cyan)</li>
          <li>□ Test-a computed bg = <code className="text-test-a">#FF6B6B</code> (coral — Option A test)</li>
          <li>□ Gradients render smooth brand→accent transitions</li>
          <li>□ Hover states work on buttons</li>
          <li>□ Focus ring uses brand-500 color</li>
          <li>□ Shadow utilities (shadow-brand-500/25) render colored shadow</li>
          <li>□ All above verified in Chrome, Firefox, Safari</li>
          <li>□ Turbopack dev server (not production build)</li>
        </ul>
      </section>
    </div>
  );
}
