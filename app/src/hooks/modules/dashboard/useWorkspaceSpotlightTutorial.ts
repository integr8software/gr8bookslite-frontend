"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { usePathname } from "next/navigation";
import {
  WorkspaceSpotlightTutorialAccountWindowDays,
  WorkspaceSpotlightTutorialOpenEvent,
  WorkspaceSpotlightTutorialSteps,
  WorkspaceSpotlightTutorialStorageVersion,
  type WorkspaceSpotlightTutorialStep,
} from "@/app/src/data/modules/dashboard/WorkspaceSpotlightTutorialData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";

const SpotlightPadding = 12;
const SpotlightCardWidth = 360;
const SpotlightViewportGap = 20;
const SpotlightStoragePrefix = "gr8bookslite.workspaceSpotlightTutorial";
const SpotlightDesktopCardHeight = 332;
const SpotlightMobileCardHeight = 388;

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type SpotlightCardPosition = {
  top: number;
  left: number;
};

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
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(
    null,
  );
  const [cardPosition, setCardPosition] = useState<SpotlightCardPosition>({
    top: SpotlightViewportGap,
    left: SpotlightViewportGap,
  });
  const activeStep = WorkspaceSpotlightTutorialSteps[activeStepIndex] ?? null;
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

    function scheduleVisibilityChange(nextIsOpen: boolean, resetIndex = false) {
      frameId = window.requestAnimationFrame(() => {
        if (resetIndex) {
          setActiveStepIndex(0);
        }

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
      scheduleVisibilityChange(true, true);
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
      scheduleVisibilityChange(true, true);
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
    if (!isOpen || !activeStep) {
      return;
    }

    const targetElement = GetSpotlightTarget(activeStep);

    targetElement?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [activeStep, isOpen]);

  useEffect(() => {
    if (!isOpen || !activeStep) {
      return;
    }

    function updateMeasurements() {
      const targetElement = GetSpotlightTarget(activeStep);

      if (!targetElement) {
        setSpotlightRect(null);
        setCardPosition({
          top: Math.max(
            SpotlightViewportGap,
            window.innerHeight / 2 - 160,
          ),
          left: Math.max(
            SpotlightViewportGap,
            window.innerWidth / 2 - SpotlightCardWidth / 2,
          ),
        });
        return;
      }

      const targetBounds = targetElement.getBoundingClientRect();
      const nextRect = {
        top: Math.max(0, targetBounds.top - SpotlightPadding),
        left: Math.max(0, targetBounds.left - SpotlightPadding),
        width: Math.min(
          window.innerWidth,
          targetBounds.width + SpotlightPadding * 2,
        ),
        height: Math.min(
          window.innerHeight,
          targetBounds.height + SpotlightPadding * 2,
        ),
      };

      setSpotlightRect(nextRect);
      setCardPosition(GetCardPosition(nextRect));
    }

    updateMeasurements();
    window.addEventListener("resize", updateMeasurements);
    window.addEventListener("scroll", updateMeasurements, true);

    return () => {
      window.removeEventListener("resize", updateMeasurements);
      window.removeEventListener("scroll", updateMeasurements, true);
    };
  }, [activeStep, isOpen]);

  useEffect(() => {
    if (pathname !== "/workspace/dashboard") {
      return;
    }

    function handleOpenTutorial() {
      setActiveStepIndex(0);
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

  function goToPreviousStep() {
    setActiveStepIndex((currentIndex) => Math.max(0, currentIndex - 1));
  }

  function goToNextStep() {
    setActiveStepIndex((currentIndex) => {
      if (currentIndex >= WorkspaceSpotlightTutorialSteps.length - 1) {
        persistStatus("completed");
        setIsOpen(false);
        return currentIndex;
      }

      return currentIndex + 1;
    });
  }

  function skipTutorial() {
    persistStatus("skipped");
    setIsOpen(false);
  }

  const overlayStyles = useMemo(() => {
    if (!spotlightRect) {
      return null;
    }

    return CreateOverlayStyles(spotlightRect);
  }, [spotlightRect]);

  return {
    activeStep,
    activeStepIndex,
    cardPosition,
    isOpen,
    overlayStyles,
    spotlightRect,
    totalSteps: WorkspaceSpotlightTutorialSteps.length,
    canGoBack: activeStepIndex > 0,
    goToNextStep,
    goToPreviousStep,
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

function GetSpotlightTarget(step: WorkspaceSpotlightTutorialStep) {
  for (const selector of step.selectors) {
    const element = document.querySelector<HTMLElement>(selector);

    if (element) {
      return element;
    }
  }

  return null;
}

function GetCardPosition(rect: SpotlightRect): SpotlightCardPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(
    SpotlightCardWidth,
    viewportWidth - SpotlightViewportGap * 2,
  );
  const estimatedCardHeight =
    viewportWidth < 640
      ? SpotlightMobileCardHeight
      : SpotlightDesktopCardHeight;
  const centeredLeft =
    viewportWidth < 768
      ? viewportWidth / 2 - cardWidth / 2
      : rect.left + rect.width / 2 - cardWidth / 2;
  const clampedLeft = Clamp(
    centeredLeft,
    SpotlightViewportGap,
    viewportWidth - cardWidth - SpotlightViewportGap,
  );
  const spaceBelow = viewportHeight - (rect.top + rect.height);
  const spaceAbove = rect.top;
  const prefersBelow =
    viewportWidth < 768
      ? spaceBelow >= estimatedCardHeight || spaceBelow >= spaceAbove
      : spaceBelow >= estimatedCardHeight || rect.top < 260;
  const desiredTop = prefersBelow
    ? rect.top + rect.height + SpotlightViewportGap
    : rect.top - estimatedCardHeight - SpotlightViewportGap;
  const top = Clamp(
    desiredTop,
    SpotlightViewportGap,
    viewportHeight - estimatedCardHeight - SpotlightViewportGap,
  );

  return {
    top,
    left: clampedLeft,
  };
}

function CreateOverlayStyles(rect: SpotlightRect) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return {
    top: {
      top: 0,
      left: 0,
      width: viewportWidth,
      height: rect.top,
    },
    left: {
      top: rect.top,
      left: 0,
      width: rect.left,
      height: rect.height,
    },
    right: {
      top: rect.top,
      left: rect.left + rect.width,
      width: Math.max(0, viewportWidth - (rect.left + rect.width)),
      height: rect.height,
    },
    bottom: {
      top: rect.top + rect.height,
      left: 0,
      width: viewportWidth,
      height: Math.max(0, viewportHeight - (rect.top + rect.height)),
    },
  } satisfies Record<"top" | "left" | "right" | "bottom", CSSProperties>;
}

function Clamp(value: number, minimum: number, maximum: number) {
  if (maximum <= minimum) {
    return minimum;
  }

  return Math.min(Math.max(value, minimum), maximum);
}
