"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChartsOfAccountsHref } from "@/app/src/constants/modules/maintenance/charts-of-accounts/ChartsOfAccountsConstants";
import {
  ChartsOfAccountsSpotlightTutorialOpenEvent,
  ChartsOfAccountsSpotlightTutorialStorageKey,
} from "@/app/src/data/modules/maintenance/charts-of-accounts/ChartsOfAccountsSpotlightTutorialData";

type SpotlightStorageValue = {
  status: "completed" | "skipped";
  updatedAt: string;
};

export function useChartsOfAccountsSpotlightTutorial() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let frameId: number | null = null;

    function scheduleVisibilityChange(nextIsOpen: boolean) {
      frameId = window.requestAnimationFrame(() => {
        setIsOpen(nextIsOpen);
      });
    }

    if (pathname !== ChartsOfAccountsHref) {
      scheduleVisibilityChange(false);
      return () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    const storedValue = window.localStorage.getItem(
      ChartsOfAccountsSpotlightTutorialStorageKey,
    );

    if (!storedValue) {
      scheduleVisibilityChange(true);
      return () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    try {
      const parsedValue = JSON.parse(storedValue) as SpotlightStorageValue;

      if (parsedValue.status === "completed" || parsedValue.status === "skipped") {
        scheduleVisibilityChange(false);
      } else {
        scheduleVisibilityChange(false);
      }
    } catch {
      window.localStorage.removeItem(ChartsOfAccountsSpotlightTutorialStorageKey);
      scheduleVisibilityChange(true);
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== ChartsOfAccountsHref) {
      return;
    }

    function handleOpenTutorial() {
      setIsOpen(true);
    }

    window.addEventListener(
      ChartsOfAccountsSpotlightTutorialOpenEvent,
      handleOpenTutorial,
    );

    return () => {
      window.removeEventListener(
        ChartsOfAccountsSpotlightTutorialOpenEvent,
        handleOpenTutorial,
      );
    };
  }, [pathname]);

  function completeTutorial() {
    persistStatus("completed");
    setIsOpen(false);
  }

  function skipTutorial() {
    persistStatus("skipped");
    setIsOpen(false);
  }

  return {
    completeTutorial,
    isOpen,
    skipTutorial,
  };

  function persistStatus(status: SpotlightStorageValue["status"]) {
    const value: SpotlightStorageValue = {
      status,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      ChartsOfAccountsSpotlightTutorialStorageKey,
      JSON.stringify(value),
    );
  }
}


