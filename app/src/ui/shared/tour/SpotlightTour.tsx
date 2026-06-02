"use client";

import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

const SpotlightPadding = 12;
const SpotlightCardWidth = 360;
const SpotlightViewportGap = 20;
const SpotlightMobileViewportGap = 16;
const SpotlightDesktopCardHeight = 332;
const SpotlightMobileCardHeight = 420;
const SpotlightMascotImagePaths = [
  "/img/spotlight-tutorial/neo-gesture-1.png",
  "/img/spotlight-tutorial/neo-gesture-2.png",
  "/img/spotlight-tutorial/neo-gesture-3.png",
  "/img/spotlight-tutorial/neo-gesture-4.png",
  "/img/spotlight-tutorial/neo-gesture-5.png",
  "/img/spotlight-tutorial/neo-gesture-6.png",
] as const;

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

type SpotlightTourProps = {
  appearance?: "auto" | "dark" | "light";
  ariaLabel: string;
  badge?: ReactNode;
  initialStepIndex?: number;
  isOpen: boolean;
  onStepEnter?: (step: SpotlightTourStep, index: number) => void;
  steps: readonly SpotlightTourStep[];
  onComplete: () => void;
  onSkip: () => void;
};

export function SpotlightTour({
  appearance = "auto",
  ariaLabel,
  badge,
  initialStepIndex = 0,
  isOpen,
  onStepEnter,
  steps,
  onComplete,
  onSkip,
}: SpotlightTourProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <SpotlightTourContent
      appearance={appearance}
      ariaLabel={ariaLabel}
      badge={badge}
      initialStepIndex={initialStepIndex}
      onComplete={onComplete}
      onStepEnter={onStepEnter}
      onSkip={onSkip}
      steps={steps}
    />
  );
}

type SpotlightTourContentProps = Omit<SpotlightTourProps, "isOpen">;

function SpotlightTourContent({
  appearance = "auto",
  ariaLabel,
  badge,
  initialStepIndex = 0,
  onComplete,
  onStepEnter,
  onSkip,
  steps,
}: SpotlightTourContentProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(initialStepIndex);
  const [resolvedAppearance, setResolvedAppearance] = useState<"dark" | "light">(
    () => getResolvedAppearance(appearance),
  );
  const [viewportSize, setViewportSize] = useState(() => getViewportSize());
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [cardPosition, setCardPosition] = useState<SpotlightCardPosition>({
    top: SpotlightViewportGap,
    left: SpotlightViewportGap,
  });
  const activeStep = steps[activeStepIndex] ?? null;
  const totalSteps = steps.length;
  const canGoBack = activeStepIndex > 0;
  const isMobileViewport = viewportSize.width < 640;
  const mascotImagePath =
    SpotlightMascotImagePaths[
      activeStepIndex % SpotlightMascotImagePaths.length
    ];
  const mascotPosition = getMascotPosition(cardPosition, viewportSize);

  useEffect(() => {
    function updateViewportSize() {
      setViewportSize(getViewportSize());
    }

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);

    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, []);

  useEffect(() => {
    let frameId: number | null = null;

    if (appearance !== "auto") {
      frameId = window.requestAnimationFrame(() => {
        setResolvedAppearance(appearance);
      });

      return;
    }

    const rootElement = document.documentElement;

    function updateAppearance() {
      setResolvedAppearance(getResolvedAppearance("auto"));
    }

    frameId = window.requestAnimationFrame(updateAppearance);

    const observer = new MutationObserver(updateAppearance);
    observer.observe(rootElement, {
      attributeFilter: ["data-app-theme"],
      attributes: true,
    });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      observer.disconnect();
    };
  }, [appearance]);

  useEffect(() => {
    if (!activeStep) {
      return;
    }

    onStepEnter?.(activeStep, activeStepIndex);

    const targetElement = getSpotlightTarget(activeStep);

    targetElement?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [activeStep, activeStepIndex, onStepEnter]);

  useEffect(() => {
    if (!activeStep) {
      return;
    }

    let frameId: number | null = null;
    let observedTargetElement: HTMLElement | null = null;

    function updateMeasurements() {
      const currentTargetElement = getSpotlightTarget(activeStep);

      if (!currentTargetElement) {
        frameId = window.requestAnimationFrame(updateMeasurements);
        return;
      }

      if (observedTargetElement !== currentTargetElement) {
        observedTargetElement = currentTargetElement;
        resizeObserver.observe(currentTargetElement);
      }

      const nextRect = getMeasuredSpotlightRect(currentTargetElement);

      setSpotlightRect(nextRect);
      setCardPosition(getCardPosition(nextRect));
    }

    window.addEventListener("resize", updateMeasurements);
    window.addEventListener("scroll", updateMeasurements, true);

    const resizeObserver = new ResizeObserver(updateMeasurements);
    resizeObserver.observe(document.documentElement);
    frameId = window.requestAnimationFrame(updateMeasurements);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("resize", updateMeasurements);
      window.removeEventListener("scroll", updateMeasurements, true);
      resizeObserver.disconnect();
    };
  }, [activeStep]);

  const overlayStyles = useMemo(() => {
    if (!spotlightRect) {
      return null;
    }

    return createOverlayStyles(spotlightRect);
  }, [spotlightRect]);

  if (!activeStep) {
    return null;
  }

  function goToPreviousStep() {
    setActiveStepIndex((currentIndex) => Math.max(0, currentIndex - 1));
  }

  function goToNextStep() {
    if (activeStepIndex >= totalSteps - 1) {
      onComplete();
      return;
    }

    setActiveStepIndex((currentIndex) => currentIndex + 1);
  }

  const isLightAppearance = resolvedAppearance === "light";

  return (
    <div className="pointer-events-none fixed inset-0 z-120" aria-live="polite">
      {overlayStyles ? (
        <>
          <div
            className="fixed bg-transparent backdrop-blur-sm"
            style={overlayStyles.top}
          />
          <div
            className="fixed bg-transparent backdrop-blur-sm"
            style={overlayStyles.left}
          />
          <div
            className="fixed bg-transparent backdrop-blur-sm"
            style={overlayStyles.right}
          />
          <div
            className="fixed bg-transparent backdrop-blur-sm"
            style={overlayStyles.bottom}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm" />
      )}

      <Image
        src={mascotImagePath}
        alt=""
        width={512}
        height={640}
        quality={95}
        sizes="(min-width: 640px) 256px, 142px"
        aria-hidden="true"
        className="pointer-events-none fixed h-44 w-auto select-none object-contain drop-shadow-[0_16px_18px_rgba(15,23,42,0.2)] sm:h-80"
        style={mascotPosition}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`pointer-events-auto fixed w-[calc(100vw-2rem)] max-w-90 overflow-y-auto rounded-[1.75rem] p-4 sm:p-5 ${
          isLightAppearance
            ? "border border-slate-200 bg-white text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
            : "border border-white/15 bg-darknavy text-offwhite shadow-[0_24px_80px_rgba(33,39,56,0.45)]"
        }`}
        style={{
          top: cardPosition.top,
          left: cardPosition.left,
          maxHeight: isMobileViewport
            ? "calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))"
            : "calc(100dvh - 2rem)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {badge ? badge : null}
            <h2
              className={`mt-4 text-xl font-semibold tracking-tight ${
                isLightAppearance ? "text-slate-950" : "text-offwhite"
              }`}
            >
              {activeStep.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className={`rounded-full p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 ${
              isLightAppearance
                ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                : "text-offwhite/70 hover:bg-white/10 hover:text-offwhite"
            }`}
            aria-label="Skip tutorial"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p
          className={`mt-3 text-sm leading-6 ${
            isLightAppearance ? "text-slate-600" : "text-offwhite/75"
          }`}
        >
          {activeStep.description}
        </p>

        <div className="mt-5 flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <span
              key={steps[index]?.key ?? index}
              className={`h-1.5 rounded-full transition-all ${
                index === activeStepIndex
                  ? `w-8 ${isLightAppearance ? "bg-blue-600" : "bg-skyblue"}`
                  : `w-3 ${isLightAppearance ? "bg-slate-200" : "bg-white/20"}`
              }`}
            />
          ))}
          <span
            className={`ml-auto text-xs font-medium uppercase tracking-[0.16em] ${
              isLightAppearance ? "text-slate-400" : "text-offwhite/45"
            }`}
          >
            {activeStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onSkip}
            className={`min-h-11 rounded-2xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 sm:min-h-0 ${
              isLightAppearance
                ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                : "text-offwhite/72 hover:bg-white/10 hover:text-offwhite"
            }`}
          >
            Skip for now
          </button>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={!canGoBack}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-24 ${
                isLightAppearance
                  ? "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  : "border-white/12 text-offwhite hover:bg-white/8"
              }`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
            <button
              type="button"
              onClick={goToNextStep}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 sm:min-w-24 ${
                isLightAppearance
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "theme-accent-contrast-text bg-skyblue hover:bg-skyblue/90"
              }`}
            >
              {activeStepIndex === totalSteps - 1 ? "Finish" : "Next"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function SpotlightTourBadge({
  appearance = "auto",
  children,
}: {
  appearance?: "auto" | "dark" | "light";
  children: ReactNode;
}) {
  const resolvedAppearance = getResolvedAppearance(appearance);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        resolvedAppearance === "light"
          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
          : "bg-white/10 text-skyblue"
      }`}
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

function getSpotlightTarget(step: SpotlightTourStep) {
  let fallbackElement: HTMLElement | null = null;

  for (const selector of step.selectors) {
    const element = document.querySelector<HTMLElement>(selector);

    if (!element) {
      continue;
    }

    if (!fallbackElement) {
      fallbackElement = element;
    }

    if (isElementVisibleForSpotlight(element)) {
      return element;
    }
  }

  return fallbackElement;
}

function getCardPosition(rect: SpotlightRect): SpotlightCardPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobileViewport = viewportWidth < 640;
  const viewportGap = getViewportGap(viewportWidth);
  const cardWidth = Math.min(
    SpotlightCardWidth,
    viewportWidth - viewportGap * 2,
  );
  const estimatedCardHeight = isMobileViewport
    ? SpotlightMobileCardHeight
    : SpotlightDesktopCardHeight;
  const centeredLeft = isMobileViewport
    ? viewportWidth / 2 - cardWidth / 2
    : viewportWidth < 768
      ? viewportWidth / 2 - cardWidth / 2
      : rect.left + rect.width / 2 - cardWidth / 2;
  const clampedLeft = clamp(
    centeredLeft,
    viewportGap,
    viewportWidth - cardWidth - viewportGap,
  );
  const spaceBelow = viewportHeight - (rect.top + rect.height);
  const spaceAbove = rect.top;
  const bottomSheetTop = Math.max(
    viewportGap,
    viewportHeight - estimatedCardHeight - viewportGap,
  );
  const desiredTop = isMobileViewport
    ? bottomSheetTop
    : (viewportWidth < 768
        ? spaceBelow >= estimatedCardHeight || spaceBelow >= spaceAbove
        : spaceBelow >= estimatedCardHeight || rect.top < 260)
      ? rect.top + rect.height + SpotlightViewportGap
      : rect.top - estimatedCardHeight - SpotlightViewportGap;
  const top = clamp(
    desiredTop,
    viewportGap,
    viewportHeight - estimatedCardHeight - viewportGap,
  );

  return {
    top,
    left: clampedLeft,
  };
}

function getMascotPosition(
  cardPosition: SpotlightCardPosition,
  viewportSize: { height: number; width: number },
): CSSProperties {
  const mascotWidth = viewportSize.width < 640 ? 142 : 256;
  const mascotHeight = viewportSize.width < 640 ? 176 : 320;
  const mascotCardOverlap = viewportSize.width < 640 ? 28 : 42;
  const cardWidth = Math.min(
    SpotlightCardWidth,
    viewportSize.width - getViewportGap(viewportSize.width) * 2,
  );
  const cardRight = cardPosition.left + cardWidth;
  const viewportGap = getViewportGap(viewportSize.width);
  const canFitOnRight =
    viewportSize.width - cardRight >= mascotWidth - mascotCardOverlap;
  const canFitOnLeft =
    cardPosition.left >= mascotWidth - mascotCardOverlap;

  if (canFitOnLeft) {
    return {
      left: cardPosition.left - mascotWidth + mascotCardOverlap,
      top: cardPosition.top + 4,
    };
  }

  if (canFitOnRight) {
    return {
      left: cardRight - mascotCardOverlap,
      top: cardPosition.top + 4,
    };
  }

  return {
    left: clamp(
      cardRight - mascotWidth - 12,
      viewportGap,
      viewportSize.width - mascotWidth - viewportGap,
    ),
    top: clamp(
      cardPosition.top - mascotHeight + 42,
      viewportGap,
      Math.max(viewportGap, viewportSize.height - mascotHeight - viewportGap),
    ),
  };
}

function createOverlayStyles(rect: SpotlightRect) {
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

function clamp(value: number, minimum: number, maximum: number) {
  if (maximum <= minimum) {
    return minimum;
  }

  return Math.min(Math.max(value, minimum), maximum);
}

function getResolvedAppearance(appearance: "auto" | "dark" | "light") {
  if (appearance !== "auto") {
    return appearance;
  }

  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.getAttribute("data-app-theme") ===
    "midnight-dark"
    ? "dark"
    : "light";
}

function getViewportGap(viewportWidth: number) {
  return viewportWidth < 640 ? SpotlightMobileViewportGap : SpotlightViewportGap;
}

function getViewportSize() {
  if (typeof window === "undefined") {
    return {
      width: 1024,
      height: 768,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function getMeasuredSpotlightRect(element: HTMLElement): SpotlightRect {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const bounds = element.getBoundingClientRect();
  const top = clamp(bounds.top - SpotlightPadding, 0, viewportHeight);
  const left = clamp(bounds.left - SpotlightPadding, 0, viewportWidth);
  const right = clamp(
    bounds.right + SpotlightPadding,
    0,
    viewportWidth,
  );
  const bottom = clamp(
    bounds.bottom + SpotlightPadding,
    0,
    viewportHeight,
  );

  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function isElementVisibleForSpotlight(element: HTMLElement) {
  const computedStyle = window.getComputedStyle(element);

  if (
    computedStyle.display === "none" ||
    computedStyle.visibility === "hidden" ||
    computedStyle.opacity === "0"
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();

  if (rect.width <= 1 || rect.height <= 1) {
    return false;
  }

  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
}
