"use client";

import type { StepTip } from "@/lib/onboarding-steps";
import {
  Lightbulb,
  Users,
  RefreshCw,
  Target,
  MapPin,
  Sparkles,
  LayoutGrid,
  Plus,
  Palette,
  Upload,
  FileText,
  Type,
  AlignLeft,
  Image,
  Hash,
  MessageSquare,
  SkipForward,
  Mic,
  Star,
  Link,
  Search,
  Paintbrush,
  PenTool,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb,
  Users,
  RefreshCw,
  Target,
  MapPin,
  Sparkles,
  LayoutGrid,
  Plus,
  Palette,
  Upload,
  FileText,
  Type,
  AlignLeft,
  Image,
  Hash,
  MessageSquare,
  SkipForward,
  Mic,
  Star,
  Link,
  Search,
  Figma: PenTool,
  Paintbrush,
};

interface TipsRendererProps {
  tips: StepTip[];
}

export default function TipsRenderer({ tips }: TipsRendererProps) {
  return (
    <div className="flex flex-col gap-4">
      <style>{`
        .tip-item {
          animation: tip-fade-in 300ms ease both;
        }
        .tip-item:nth-child(1) { animation-delay: 0ms; }
        .tip-item:nth-child(2) { animation-delay: 100ms; }
        .tip-item:nth-child(3) { animation-delay: 200ms; }
        @keyframes tip-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tip-item { animation: none; opacity: 1; }
        }
      `}</style>

      {tips.map((tip, i) => {
        const IconComponent = ICON_MAP[tip.icon] || Sparkles;
        return (
          <div key={i} className="tip-item flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <IconComponent className="w-4 h-4 text-brand-400/70" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">{tip.title}</p>
              <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{tip.body}</p>
            </div>
          </div>
        );
      })}

      <p className="text-xs text-white/25 mt-2">
        You can always come back and change this.
      </p>
    </div>
  );
}
