import { useCallback, useEffect, useState } from "react";
import type { MainNavigationItem } from "@/app/src/data/shared/MainLayout/ModuleShellTypes";

export function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function pathMatches(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
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

function itemMatchesActiveHref(
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

export function useIncrementalVisibleCount(
  totalItems: number,
  initialCount: number,
  batchSize: number,
  isEnabled: boolean,
) {
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(totalItems, initialCount),
  );
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelNode(node);
  }, []);
  const clampedVisibleCount = Math.min(
    Math.max(visibleCount, initialCount),
    totalItems,
  );

  useEffect(() => {
    if (!isEnabled || clampedVisibleCount >= totalItems || !sentinelNode) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setVisibleCount((current) =>
          Math.min(totalItems, current + batchSize),
        );
      },
      { rootMargin: "160px 0px" },
    );

    observer.observe(sentinelNode);

    return () => {
      observer.disconnect();
    };
  }, [
    batchSize,
    clampedVisibleCount,
    isEnabled,
    sentinelNode,
    totalItems,
  ]);

  return [
    clampedVisibleCount,
    clampedVisibleCount < totalItems,
    sentinelRef,
  ] as const;
}
