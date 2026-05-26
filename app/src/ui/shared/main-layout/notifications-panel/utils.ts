import { useCallback, useEffect, useState } from "react";
import type { MainNotificationTab } from "@/app/src/types/shared/main-layout/MainLayoutTypes";

export function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function getEmptyNotificationText(tab: MainNotificationTab) {
  if (tab === "all") {
    return "Notifications will appear here.";
  }

  return tab === "unread"
    ? "Unread notifications will appear here."
    : "Read notifications will appear here.";
}

export function useIncrementalVisibleCount(
  totalItems: number,
  initialCount: number,
  batchSize: number,
) {
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(totalItems, initialCount),
  );
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelNode(node);
  }, []);
  const clampedVisibleCount = Math.min(visibleCount, totalItems);

  useEffect(() => {
    if (clampedVisibleCount >= totalItems || !sentinelNode) {
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
      { rootMargin: "120px 0px" },
    );

    observer.observe(sentinelNode);

    return () => {
      observer.disconnect();
    };
  }, [batchSize, clampedVisibleCount, sentinelNode, totalItems]);

  return [
    clampedVisibleCount,
    clampedVisibleCount < totalItems,
    sentinelRef,
  ] as const;
}
