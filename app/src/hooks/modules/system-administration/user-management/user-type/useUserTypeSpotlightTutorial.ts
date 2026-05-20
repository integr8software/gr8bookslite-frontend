"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserTypeHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
  UserTypeSpotlightTutorialOpenEvent,
  UserTypeSpotlightTutorialStorageKey,
} from "@/app/src/data/modules/system-administration/user-management/user-type/UserTypeSpotlightTutorialData";

type SpotlightStorageValue = {
  status: "completed" | "skipped";
  updatedAt: string;
};

export function useUserTypeSpotlightTutorial() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let frameId: number | null = null;

    function scheduleVisibilityChange(nextIsOpen: boolean) {
      frameId = window.requestAnimationFrame(() => {
        setIsOpen(nextIsOpen);
      });
    }

    if (pathname !== UserTypeHref) {
      scheduleVisibilityChange(false);
      return () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    const storedValue = window.localStorage.getItem(
      UserTypeSpotlightTutorialStorageKey,
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
      window.localStorage.removeItem(UserTypeSpotlightTutorialStorageKey);
      scheduleVisibilityChange(true);
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== UserTypeHref) {
      return;
    }

    function handleOpenTutorial() {
      setIsOpen(true);
    }

    window.addEventListener(UserTypeSpotlightTutorialOpenEvent, handleOpenTutorial);

    return () => {
      window.removeEventListener(
        UserTypeSpotlightTutorialOpenEvent,
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
      UserTypeSpotlightTutorialStorageKey,
      JSON.stringify(value),
    );
  }
}
