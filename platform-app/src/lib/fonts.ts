export interface FontOption {
  name: string;
  family: string;
  category: string;
}

export const GOOGLE_FONTS: FontOption[] = [
  { name: "Nunito Sans", family: "'Nunito Sans', sans-serif", category: "sans-serif" },
  { name: "Montserrat", family: "'Montserrat', sans-serif", category: "sans-serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif", category: "serif" },
  { name: "Inter", family: "'Inter', sans-serif", category: "sans-serif" },
  { name: "Roboto", family: "'Roboto', sans-serif", category: "sans-serif" },
  { name: "Lato", family: "'Lato', sans-serif", category: "sans-serif" },
  { name: "Poppins", family: "'Poppins', sans-serif", category: "sans-serif" },
  { name: "Raleway", family: "'Raleway', sans-serif", category: "sans-serif" },
];

export function getGoogleFontsUrl(fonts: string[]): string {
  const families = fonts
    .map((f) => f.replace(/\s+/g, "+"))
    .map((f) => `family=${f}:wght@400;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
