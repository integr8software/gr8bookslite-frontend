"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const ProgressStart = 18;
const ProgressStepOne = 58;
const ProgressStepTwo = 82;
const ProgressStepThree = 92;
const CompleteDelay = 220;
const FallbackDelay = 8000;

export function MainNavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const hasPendingNavigationRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const queueTimer = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  }, []);

  const startProgress = useCallback(() => {
    clearTimers();
    hasPendingNavigationRef.current = true;
    setIsVisible(true);
    setProgress(ProgressStart);

    queueTimer(() => setProgress(ProgressStepOne), 140);
    queueTimer(() => setProgress(ProgressStepTwo), 520);
    queueTimer(() => setProgress(ProgressStepThree), 1400);
    queueTimer(() => {
      hasPendingNavigationRef.current = false;
      setProgress(100);
      queueTimer(() => {
        setIsVisible(false);
        setProgress(0);
      }, CompleteDelay);
    }, FallbackDelay);
  }, [clearTimers, queueTimer]);

  const requestProgressStart = useCallback(() => {
    window.requestAnimationFrame(() => {
      startProgress();
    });
  }, [startProgress]);

  const completeProgress = useCallback(() => {
    if (!hasPendingNavigationRef.current) {
      return;
    }

    clearTimers();
    hasPendingNavigationRef.current = false;
    setProgress(100);
    queueTimer(() => {
      setIsVisible(false);
      setProgress(0);
    }, CompleteDelay);
  }, [clearTimers, queueTimer]);

  useEffect(() => {
    completeProgress();
  }, [completeProgress, pathname]);

  useEffect(() => {
    const shouldStartForUrl = (href: string) => {
      const nextUrl = new URL(href, window.location.href);
      const currentUrl = new URL(window.location.href);

      return (
        nextUrl.origin === currentUrl.origin &&
        `${nextUrl.pathname}${nextUrl.search}` !==
          `${currentUrl.pathname}${currentUrl.search}`
      );
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a[href]");

      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.target ||
        anchor.hasAttribute("download") ||
        !shouldStartForUrl(anchor.href)
      ) {
        return;
      }

      requestProgressStart();
    };

    const startForHistoryChange = (href?: string | URL | null) => {
      if (href && shouldStartForUrl(String(href))) {
        requestProgressStart();
      }
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function patchedPushState(...args) {
      startForHistoryChange(args[2]);
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function patchedReplaceState(...args) {
      startForHistoryChange(args[2]);
      return originalReplaceState.apply(this, args);
    };

    window.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", requestProgressStart);
    window.addEventListener("gr8books:navigation-start", requestProgressStart);

    return () => {
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", requestProgressStart);
      window.removeEventListener(
        "gr8books:navigation-start",
        requestProgressStart,
      );
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      clearTimers();
    };
  }, [clearTimers, requestProgressStart]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 top-0 z-80 h-1 overflow-hidden bg-transparent"
    >
      <div
        className="h-full origin-left bg-skyblue shadow-[0_0_10px_rgba(42,169,224,0.75)] transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `scaleX(${progress / 100})`,
        }}
      />
    </div>
  );
}
