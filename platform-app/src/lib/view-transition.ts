import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Navigate with CSS View Transition API.
 * Falls back to instant navigation on unsupported browsers.
 */
export function navigateWithTransition(
  router: AppRouterInstance,
  path: string,
  direction: "forward" | "back" = "forward"
) {
  if (
    typeof document === "undefined" ||
    !("startViewTransition" in document)
  ) {
    router.push(path);
    return;
  }

  document.documentElement.dataset.transitionDir = direction;
  (document as unknown as { startViewTransition: (cb: () => void) => void })
    .startViewTransition(() => {
      router.push(path);
    });
}
