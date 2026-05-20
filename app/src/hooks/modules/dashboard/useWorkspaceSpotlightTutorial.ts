"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  WorkspaceSpotlightTutorialAccountWindowDays,
  WorkspaceSpotlightTutorialOpenEvent,
  WorkspaceSpotlightTutorialStorageVersion,
} from "@/app/src/data/modules/dashboard/WorkspaceSpotlightTutorialData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";

const SpotlightStoragePrefix = "gr8bookslite.workspaceSpotlightTutorial";

type SpotlightStorageValue = {
  status: "completed" | "skipped";
  updatedAt: string;
};

export function useWorkspaceSpotlightTutorial() {
  const pathname = usePathname();
  const accessToken = useAppStore((state) => state.accessToken);
  const { data: authProfile, isLoading: isProfileLoading } = useAuthProfileQuery({
    accessToken,
  });
  const [isOpen, setIsOpen] = useState(false);
  const storageKey = useMemo(() => {
    const userId = authProfile?.user.id;

    if (!userId) {
      return null;
    }

    return `${SpotlightStoragePrefix}.${WorkspaceSpotlightTutorialStorageVersion}.${userId}`;
  }, [authProfile?.user.id]);
  const shouldCheckTutorial =
    pathname === "/workspace/dashboard" &&
    Boolean(accessToken) &&
    Boolean(authProfile) &&
    !authProfile?.onboarding.requiresCompanySetup &&
    IsRecentAccount(authProfile?.user.createdAt);

  useEffect(() => {
    let frameId: number | null = null;

    function scheduleVisibilityChange(nextIsOpen: boolean) {
      frameId = window.requestAnimationFrame(() => {
        setIsOpen(nextIsOpen);
      });
    }

    if (
      pathname !== "/workspace/dashboard" ||
      !accessToken ||
      isProfileLoading ||
      !authProfile
    ) {
      scheduleVisibilityChange(false);
      return () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    if (!shouldCheckTutorial || !storageKey) {
      scheduleVisibilityChange(false);
      return () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    const storedValue = window.localStorage.getItem(storageKey);

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
      window.localStorage.removeItem(storageKey);
      scheduleVisibilityChange(true);
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [
    accessToken,
    authProfile,
    isProfileLoading,
    pathname,
    shouldCheckTutorial,
    storageKey,
  ]);

  useEffect(() => {
    if (pathname !== "/workspace/dashboard") {
      return;
    }

    function handleOpenTutorial() {
      setIsOpen(true);
    }

    window.addEventListener(
      WorkspaceSpotlightTutorialOpenEvent,
      handleOpenTutorial,
    );

    return () => {
      window.removeEventListener(
        WorkspaceSpotlightTutorialOpenEvent,
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
    if (!storageKey) {
      return;
    }

    const value: SpotlightStorageValue = {
      status,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }
}

function IsRecentAccount(createdAt: string | undefined) {
  if (!createdAt) {
    return false;
  }

  const createdAtValue = new Date(createdAt).getTime();

  if (Number.isNaN(createdAtValue)) {
    return false;
  }

  const maxAgeInMilliseconds =
    WorkspaceSpotlightTutorialAccountWindowDays * 24 * 60 * 60 * 1000;

  return Date.now() - createdAtValue <= maxAgeInMilliseconds;
}
