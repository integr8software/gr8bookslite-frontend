"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
  UserListSpotlightTutorialOpenEvent,
  UserListSpotlightTutorialStorageKey,
} from "@/app/src/data/modules/system-administration/user-management/user-list/UserListSpotlightTutorialData";

type SpotlightStorageValue = {
  status: "completed" | "skipped";
  updatedAt: string;
};

export function useUserListSpotlightTutorial() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let frameId: number | null = null;

    function scheduleVisibilityChange(nextIsOpen: boolean) {
      frameId = window.requestAnimationFrame(() => {
        setIsOpen(nextIsOpen);
      });
    }

    if (pathname !== UserListHref) {
      scheduleVisibilityChange(false);
      return () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    const storedValue = window.localStorage.getItem(
      UserListSpotlightTutorialStorageKey,
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
      window.localStorage.removeItem(UserListSpotlightTutorialStorageKey);
      scheduleVisibilityChange(true);
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== UserListHref) {
      return;
    }

    function handleOpenTutorial() {
      setIsOpen(true);
    }

    window.addEventListener(UserListSpotlightTutorialOpenEvent, handleOpenTutorial);

    return () => {
      window.removeEventListener(
        UserListSpotlightTutorialOpenEvent,
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
      UserListSpotlightTutorialStorageKey,
      JSON.stringify(value),
    );
  }
}
