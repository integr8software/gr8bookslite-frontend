import type { MainNavigationItem } from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";

export function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function pathMatches(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Resolves one canonical navigation href for the current path.
 *
 * Custom sidebars can contain a parent group and a child with the same href.
 * Prefer the deepest matching leaf so only one child receives active styling.
 */
export function getActiveNavigationHref(
  items: MainNavigationItem[],
  activeHref: string,
) {
  let bestHref: string | undefined;
  let bestScore = -1;

  function visit(item: MainNavigationItem) {
    if (pathMatches(item.href, activeHref)) {
      const isLeaf = !item.children?.length;
      const score = item.href.length * 2 + (isLeaf ? 1 : 0);

      if (score > bestScore) {
        bestHref = item.href;
        bestScore = score;
      }
    }

    item.children?.forEach(visit);
  }

  items.forEach(visit);
  return bestHref ?? activeHref;
}

export function getVisibleCountToActiveItem(
  items: MainNavigationItem[],
  activeHref: string,
) {
  const activeIndex = items.findIndex((item) =>
    itemMatchesActiveHref(item, activeHref),
  );

  return activeIndex >= 0 ? activeIndex + 1 : 0;
}

export function itemMatchesActiveHref(
  item: MainNavigationItem,
  activeHref: string,
): boolean {
  if (pathMatches(item.href, activeHref)) {
    return true;
  }

  return Boolean(
    item.children?.some((child) => itemMatchesActiveHref(child, activeHref)),
  );
}
