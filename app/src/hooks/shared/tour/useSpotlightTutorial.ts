"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type SpotlightStorageValue = {
  status: "completed" | "skipped";
  updatedAt: string;
};

type UseSpotlightTutorialOptions = {
  href: string;
  isEnabled?: boolean;
  openEvent: string;
  pathnamePrefixes?: readonly string[];
  storageKey: string;
};

export function useSpotlightTutorial({
  href,
  isEnabled = true,
  openEvent,
  pathnamePrefixes = [],
  storageKey,
}: UseSpotlightTutorialOptions) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isActivePathname =
    pathname === href ||
    pathnamePrefixes.some((pathnamePrefix) => pathname.startsWith(pathnamePrefix));
  const isActive = isEnabled && isActivePathname;

  useEffect(() => {
    let frameId: number | null = null;

    function scheduleVisibilityChange(nextIsOpen: boolean) {
      frameId = window.requestAnimationFrame(() => {
        setIsOpen(nextIsOpen);
      });
    }

    if (!isActive) {
      scheduleVisibilityChange(false);
      return () => cancelScheduledFrame(frameId);
    }

    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      scheduleVisibilityChange(true);
      return () => cancelScheduledFrame(frameId);
    }

    try {
      const parsedValue = JSON.parse(storedValue) as SpotlightStorageValue;
      const hasFinished =
        parsedValue.status === "completed" || parsedValue.status === "skipped";

      scheduleVisibilityChange(!hasFinished);
    } catch {
      window.localStorage.removeItem(storageKey);
      scheduleVisibilityChange(true);
    }

    return () => cancelScheduledFrame(frameId);
  }, [isActive, storageKey]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    function handleOpenTutorial() {
      setIsOpen(true);
    }

    window.addEventListener(openEvent, handleOpenTutorial);

    return () => {
      window.removeEventListener(openEvent, handleOpenTutorial);
    };
  }, [isActive, openEvent]);

  function persistStatus(status: SpotlightStorageValue["status"]) {
    const value: SpotlightStorageValue = {
      status,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(storageKey, JSON.stringify(value));
    setIsOpen(false);
  }

  return {
    completeTutorial: () => persistStatus("completed"),
    isOpen,
    skipTutorial: () => persistStatus("skipped"),
  };
}

function cancelScheduledFrame(frameId: number | null) {
  if (frameId !== null) {
    window.cancelAnimationFrame(frameId);
  }
}
