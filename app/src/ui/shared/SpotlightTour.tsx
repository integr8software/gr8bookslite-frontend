"use client";

import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { SpotlightTourStep } from "@/app/src/types/shared/SpotlightTourTypes";

const SpotlightPadding = 12;
const SpotlightCardWidth = 360;
const SpotlightViewportGap = 20;
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

type SpotlightTourProps = {
  appearance?: "dark" | "light";
  ariaLabel: string;
  badge?: ReactNode;
  isOpen: boolean;
  steps: readonly SpotlightTourStep[];
  onComplete: () => void;
  onSkip: () => void;
};

export function SpotlightTour({
  appearance = "dark",
  ariaLabel,
  badge,
  isOpen,
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
      onComplete={onComplete}
      onSkip={onSkip}
      steps={steps}
    />
  );
}

type SpotlightTourContentProps = Omit<SpotlightTourProps, "isOpen">;

function SpotlightTourContent({
  appearance,
  ariaLabel,
  badge,
  onComplete,
  onSkip,
  steps,
}: SpotlightTourContentProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [cardPosition, setCardPosition] = useState<SpotlightCardPosition>({
    top: SpotlightViewportGap,
    left: SpotlightViewportGap,
  });
  const activeStep = steps[activeStepIndex] ?? null;
  const totalSteps = steps.length;
  const canGoBack = activeStepIndex > 0;

  useEffect(() => {
    if (!activeStep) {
      return;
    }

    const targetElement = getSpotlightTarget(activeStep);

    targetElement?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [activeStep]);

  useEffect(() => {
    if (!activeStep) {
      return;
    }

    function updateMeasurements() {
      const targetElement = getSpotlightTarget(activeStep);

      if (!targetElement) {
        setSpotlightRect(null);
        setCardPosition({
          top: Math.max(SpotlightViewportGap, window.innerHeight / 2 - 160),
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
      setCardPosition(getCardPosition(nextRect));
    }

    updateMeasurements();
    window.addEventListener("resize", updateMeasurements);
    window.addEventListener("scroll", updateMeasurements, true);

    return () => {
      window.removeEventListener("resize", updateMeasurements);
      window.removeEventListener("scroll", updateMeasurements, true);
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

  const isLightAppearance = appearance === "light";

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

      <section
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`pointer-events-auto fixed w-[calc(100vw-2rem)] max-w-90 rounded-[1.75rem] p-5 ${
          isLightAppearance
            ? "border border-slate-200 bg-white text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
            : "border border-white/15 bg-darknavy text-offwhite shadow-[0_24px_80px_rgba(33,39,56,0.45)]"
        }`}
        style={{
          top: cardPosition.top,
          left: cardPosition.left,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {badge ? badge : null}
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
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

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className={`rounded-2xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 ${
              isLightAppearance
                ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                : "text-offwhite/72 hover:bg-white/10 hover:text-offwhite"
            }`}
          >
            Skip for now
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={!canGoBack}
              className={`inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 disabled:cursor-not-allowed disabled:opacity-40 ${
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
              className={`inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 ${
                isLightAppearance
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-skyblue text-darknavy hover:bg-skyblue/90"
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
  appearance = "dark",
  children,
}: {
  appearance?: "dark" | "light";
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        appearance === "light"
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
  for (const selector of step.selectors) {
    const element = document.querySelector<HTMLElement>(selector);

    if (element) {
      return element;
    }
  }

  return null;
}

function getCardPosition(rect: SpotlightRect): SpotlightCardPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(
    SpotlightCardWidth,
    viewportWidth - SpotlightViewportGap * 2,
  );
  const estimatedCardHeight =
    viewportWidth < 640 ? SpotlightMobileCardHeight : SpotlightDesktopCardHeight;
  const centeredLeft =
    viewportWidth < 768
      ? viewportWidth / 2 - cardWidth / 2
      : rect.left + rect.width / 2 - cardWidth / 2;
  const clampedLeft = clamp(
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
  const top = clamp(
    desiredTop,
    SpotlightViewportGap,
    viewportHeight - estimatedCardHeight - SpotlightViewportGap,
  );

  return {
    top,
    left: clampedLeft,
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
