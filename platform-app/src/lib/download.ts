export async function downloadBlueprint(
  siteId: string,
  siteName: string
): Promise<void> {
  const res = await fetch(`/api/blueprint/${siteId}?download=true`);
  if (!res.ok) {
    throw new Error("Failed to download blueprint");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    res.headers
      .get("Content-Disposition")
      ?.match(/filename="(.+)"/)?.[1] ||
    `${siteName}-blueprint.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
