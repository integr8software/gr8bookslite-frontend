"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const INITIAL_PROGRESS = 8;
const MAX_PROGRESS_BEFORE_COMPLETE = 92;
const PROGRESS_INCREMENT = 12;
const COMPLETE_ANIMATION_MS = 220;

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);
  const currentUrlRef = useRef("");

  useEffect(() => {
    currentUrlRef.current = buildRelativeUrl(pathname, searchParams);
  }, [pathname, searchParams]);

  useEffect(() => {
    const completeProgress = () => {
      if (!isNavigatingRef.current) {
        return;
      }

      isNavigatingRef.current = false;
      stopTimer(timerRef.current);
      timerRef.current = null;
      setProgress(100);

      window.setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, COMPLETE_ANIMATION_MS);
    };

    completeProgress();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
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

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a");
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const href = link.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const nextUrl = new URL(link.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) {
        return;
      }

      const nextRelativeUrl = `${nextUrl.pathname}${nextUrl.search}`;
      if (nextRelativeUrl === currentUrlRef.current) {
        return;
      }

      startProgress(setIsVisible, setProgress, timerRef, isNavigatingRef);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      stopTimer(timerRef.current);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 shadow-[0_0_18px_rgba(59,130,246,0.45)] transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function startProgress(
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  timerRef: React.MutableRefObject<number | null>,
  isNavigatingRef: React.MutableRefObject<boolean>,
) {
  if (isNavigatingRef.current) {
    return;
  }

  isNavigatingRef.current = true;
  setIsVisible(true);
  setProgress(INITIAL_PROGRESS);

  stopTimer(timerRef.current);
  timerRef.current = window.setInterval(() => {
    setProgress((current) =>
      current >= MAX_PROGRESS_BEFORE_COMPLETE
        ? current
        : Math.min(
            current + Math.max((100 - current) / PROGRESS_INCREMENT, 2),
            MAX_PROGRESS_BEFORE_COMPLETE,
          ),
    );
  }, 160);
}

function stopTimer(timer: number | null) {
  if (timer !== null) {
    window.clearInterval(timer);
  }
}

function buildRelativeUrl(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
) {
  const search = searchParams.toString();
  return search ? `${pathname}?${search}` : pathname;
}
