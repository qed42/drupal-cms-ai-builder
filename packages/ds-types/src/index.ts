export type {
  ComponentRole,
  RequiredRole,
  StandardRole,
  ExtendedRole,
  ComponentDefinition,
  PropDefinition,
  SlotDefinition,
  CompositionPattern,
  PageDesignRule,
  SectionRule,
  ColorPalette,
  ImagePropMapping,
  BrandTokens,
  BrandPayload,
  ComponentTreeItem,
  HeaderData,
  FooterData,
  SectionChildData,
  SectionBuildOptions,
  DesignSystemAdapter,
} from "./types";

export {
  registerAdapter,
  getAdapter,
  getDefaultAdapter,
  setActiveAdapter,
  listAdapters,
} from "./registry";

export { resolveWithFallback } from "./fallbacks";
