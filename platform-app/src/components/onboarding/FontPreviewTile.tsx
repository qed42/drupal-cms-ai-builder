"use client";

interface FontPreviewTileProps {
  bgColor: string;
  textColor: string;
  fontFamily: string;
}

export default function FontPreviewTile({
  bgColor,
  textColor,
  fontFamily,
}: FontPreviewTileProps) {
  return (
    <div
      className="rounded-xl flex items-center justify-center aspect-square"
      style={{ backgroundColor: bgColor }}
    >
      <span
        className="text-4xl font-bold"
        style={{ color: textColor, fontFamily }}
      >
        Aa
      </span>
    </div>
  );
}
