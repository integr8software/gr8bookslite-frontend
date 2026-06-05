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
const SpotlightCardWidth = 480;
const SpotlightViewportGap = 20;
const SpotlightMobileViewportGap = 16;
const SpotlightDesktopCardHeight = 390;
const SpotlightMobileCardHeight = 436;
const SpotlightMobileMascotWidth = 142;
const SpotlightCompactMobileMascotWidth = 112;
const SpotlightDesktopMascotWidth = 256;
const SpotlightMascotAspectRatio = 640 / 512;
const SpotlightTargetTrackingFrames = 60;
const SpotlightHologramTexturePath =
  "/img/spotlight-tutorial/hologram-panel-texture.png";
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
  avoidLeftOf?: number;
  hideFrame?: boolean;
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
  const mascotSize = getMascotSize(viewportSize.width);
  const mascotPosition = getMascotPosition(
    cardPosition,
    viewportSize,
    mascotSize,
  );

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
    let remainingTrackingFrames = SpotlightTargetTrackingFrames;

    function scheduleMeasurement() {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateMeasurements();
      });
    }

    function updateMeasurements() {
      const currentTargetElement = getSpotlightTarget(activeStep);

      if (!currentTargetElement) {
        scheduleMeasurement();
        return;
      }

      if (observedTargetElement !== currentTargetElement) {
        observedTargetElement = currentTargetElement;
        resizeObserver.observe(currentTargetElement);
      }

      const nextRect = getMeasuredSpotlightRect(currentTargetElement);

      setSpotlightRect(nextRect);
      setCardPosition(getCardPosition(nextRect));

      if (remainingTrackingFrames > 0) {
        remainingTrackingFrames -= 1;
        scheduleMeasurement();
      }
    }

    function restartMeasurements() {
      remainingTrackingFrames = SpotlightTargetTrackingFrames;
      scheduleMeasurement();
    }

    window.addEventListener("resize", restartMeasurements);
    window.addEventListener("scroll", restartMeasurements, true);

    const resizeObserver = new ResizeObserver(restartMeasurements);
    resizeObserver.observe(document.documentElement);
    scheduleMeasurement();

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("resize", restartMeasurements);
      window.removeEventListener("scroll", restartMeasurements, true);
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
    <div className="pointer-events-auto fixed inset-0 z-120" aria-live="polite">
      <style>{`
        @keyframes spotlight-hologram-scan {
          0% { transform: translateY(-120%); opacity: 0; }
          12% { opacity: 0.34; }
          45% { opacity: 0.18; }
          100% { transform: translateY(220%); opacity: 0; }
        }

        @keyframes spotlight-hologram-glitch {
          0%, 88%, 100% {
            opacity: 0;
            transform: translate3d(0, 0, 0);
            clip-path: inset(0 0 0 0);
          }
          90% {
            opacity: 0.32;
            transform: translate3d(-2px, 0, 0);
            clip-path: inset(12% 0 73% 0);
          }
          92% {
            opacity: 0.24;
            transform: translate3d(2px, 0, 0);
            clip-path: inset(45% 0 39% 0);
          }
          94% {
            opacity: 0.28;
            transform: translate3d(-2px, 0, 0);
            clip-path: inset(72% 0 14% 0);
          }
          96% {
            opacity: 0.16;
            transform: translate3d(2px, 0, 0);
            clip-path: inset(28% 0 58% 0);
          }
        }

        @keyframes spotlight-hologram-flicker {
          0%, 100% { opacity: 0.56; filter: hue-rotate(0deg); }
          48% { opacity: 0.48; filter: hue-rotate(-4deg); }
          50% { opacity: 0.66; filter: hue-rotate(8deg); }
          53% { opacity: 0.5; filter: hue-rotate(0deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .spotlight-hologram-animated {
            animation: none !important;
          }
        }
      `}</style>
      {overlayStyles ? (
        <>
          <div
            className="fixed bg-slate-950/[0.36] backdrop-blur-[3px]"
            style={overlayStyles.top}
          />
          <div
            className="fixed bg-slate-950/[0.36] backdrop-blur-[3px]"
            style={overlayStyles.left}
          />
          <div
            className="fixed bg-slate-950/[0.36] backdrop-blur-[3px]"
            style={overlayStyles.right}
          />
          <div
            className="fixed bg-slate-950/[0.36] backdrop-blur-[3px]"
            style={overlayStyles.bottom}
          />
          {overlayStyles.hideFrame ? null : (
            <div
              className="pointer-events-none fixed rounded-[1.15rem] border border-cyan-200/25 shadow-[0_0_14px_rgba(34,211,238,0.16),inset_0_0_14px_rgba(125,211,252,0.1)]"
              style={overlayStyles.frame}
            />
          )}
        </>
      ) : (
        <div className="fixed inset-0 bg-slate-950/[0.36] backdrop-blur-[3px]" />
      )}

      <Image
        src={mascotImagePath}
        alt=""
        width={512}
        height={640}
        quality={95}
        sizes="(min-width: 640px) 256px, (min-width: 380px) 142px, 112px"
        aria-hidden="true"
        className="pointer-events-none fixed h-auto select-none object-contain drop-shadow-[0_18px_22px_rgba(14,165,233,0.26)]"
        style={{
          ...mascotPosition,
          width: mascotSize.width,
        }}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`pointer-events-auto fixed w-[min(calc(100vw-2rem),480px)] overflow-hidden rounded-[1.35rem] p-px sm:rounded-[1.85rem] ${
          isLightAppearance
            ? "bg-[linear-gradient(135deg,rgba(103,232,249,0.48),rgba(167,139,250,0.24),rgba(34,211,238,0.38))] text-white shadow-[0_24px_64px_rgba(15,23,42,0.34),0_0_22px_rgba(103,232,249,0.12)]"
            : "bg-[linear-gradient(135deg,rgba(103,232,249,0.46),rgba(167,139,250,0.22),rgba(34,211,238,0.38))] text-offwhite shadow-[0_24px_64px_rgba(15,23,42,0.42),0_0_24px_rgba(103,232,249,0.14)]"
        }`}
        style={{
          top: cardPosition.top,
          left: cardPosition.left,
          maxHeight: isMobileViewport
            ? "calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))"
            : "calc(100dvh - 2rem)",
        }}
      >
        <div
          className={`relative max-h-full overflow-x-hidden overflow-y-auto rounded-[1.3rem] border p-4 backdrop-blur-xl [contain:paint] sm:rounded-[1.8rem] sm:p-6 ${
            isLightAppearance
              ? "border-white/[0.24] bg-slate-950/[0.82] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_34px_rgba(56,189,248,0.08)]"
              : "border-white/[0.14] bg-slate-950/[0.8] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_34px_rgba(56,189,248,0.1)]"
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-0 rounded-[1.3rem] bg-cover bg-center sm:rounded-[1.8rem] ${
              isLightAppearance
                ? "opacity-24 mix-blend-screen"
                : "opacity-26 mix-blend-screen"
            }`}
            style={{
              backgroundImage: `url(${SpotlightHologramTexturePath})`,
            }}
          />
          <div
            className={`pointer-events-none absolute inset-0 rounded-[1.8rem] ${
              isLightAppearance
                ? "bg-[linear-gradient(180deg,rgba(2,6,23,0.5),rgba(2,6,23,0.7)),radial-gradient(circle_at_18%_18%,rgba(125,211,252,0.08),transparent_34%),radial-gradient(circle_at_82%_74%,rgba(216,180,254,0.06),transparent_38%)]"
                : "bg-[linear-gradient(180deg,rgba(2,6,23,0.42),rgba(2,6,23,0.64)),radial-gradient(circle_at_22%_18%,rgba(125,211,252,0.08),transparent_34%),radial-gradient(circle_at_78%_78%,rgba(216,180,254,0.06),transparent_38%)]"
            }`}
          />
          <div className="pointer-events-none absolute inset-0 rounded-[1.3rem] bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.18)_42%,transparent_49%),repeating-linear-gradient(0deg,rgba(125,211,252,0.1)_0px,rgba(125,211,252,0.1)_1px,transparent_3px,transparent_8px)] opacity-48 sm:rounded-[1.8rem]" />
          <div className="pointer-events-none absolute inset-0 rounded-[1.3rem] bg-[linear-gradient(rgba(125,211,252,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.05)_1px,transparent_1px)] bg-[length:28px_28px] opacity-45 sm:rounded-[1.8rem]" />
          <div className="spotlight-hologram-animated pointer-events-none absolute inset-0 rounded-[1.3rem] bg-[linear-gradient(90deg,rgba(34,211,238,0.16),transparent_24%,rgba(216,180,254,0.14)_54%,transparent_72%,rgba(125,211,252,0.12))] mix-blend-screen blur-[0.5px] [animation:spotlight-hologram-flicker_4.8s_ease-in-out_infinite] sm:rounded-[1.8rem]" />
          <div className="spotlight-hologram-animated pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-[1.3rem] bg-[linear-gradient(180deg,transparent,rgba(103,232,249,0.34),transparent)] mix-blend-screen [animation:spotlight-hologram-scan_3.8s_linear_infinite] sm:rounded-t-[1.8rem]" />
          <div className="spotlight-hologram-animated pointer-events-none absolute inset-0 rounded-[1.3rem] bg-[linear-gradient(90deg,rgba(34,211,238,0.42),transparent_38%,rgba(216,180,254,0.28))] mix-blend-screen [animation:spotlight-hologram-glitch_5.6s_steps(1,end)_infinite] sm:rounded-[1.8rem]" />
          <div className="spotlight-hologram-animated pointer-events-none absolute inset-0 rounded-[1.3rem] bg-[linear-gradient(90deg,rgba(248,113,113,0.18),transparent_34%,rgba(59,130,246,0.22))] mix-blend-screen [animation:spotlight-hologram-glitch_7.2s_steps(1,end)_infinite_reverse] sm:rounded-[1.8rem]" />
          <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-cyan-200/55 shadow-[0_0_12px_rgba(103,232,249,0.62)]" />
          <div className="pointer-events-none absolute inset-x-10 bottom-4 h-px bg-cyan-200/30 shadow-[0_0_10px_rgba(103,232,249,0.44)]" />
          <div className="pointer-events-none absolute bottom-3 left-5 h-5 w-12 border-b border-l border-cyan-200/45" />
          <div className="pointer-events-none absolute right-5 top-3 h-5 w-12 border-r border-t border-fuchsia-200/38" />
          <div className="pointer-events-none absolute left-0 top-16 h-24 w-px bg-gradient-to-b from-transparent via-cyan-200/55 to-transparent shadow-[0_0_12px_rgba(103,232,249,0.5)]" />
          <div className="pointer-events-none absolute right-0 bottom-16 h-24 w-px bg-gradient-to-b from-transparent via-fuchsia-200/40 to-transparent shadow-[0_0_10px_rgba(216,180,254,0.36)]" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                {badge ? badge : null}
                <h2
                  className={`mt-4 text-xl font-semibold leading-tight tracking-tight sm:mt-5 sm:text-2xl ${
                    isLightAppearance
                      ? "text-white drop-shadow-[0_0_12px_rgba(125,211,252,0.46)]"
                      : "text-white drop-shadow-[0_0_12px_rgba(125,211,252,0.4)]"
                  }`}
                >
                  {activeStep.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onSkip}
                className={`rounded-full border p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 ${
                  isLightAppearance
                    ? "border-cyan-100/28 bg-cyan-50/10 text-cyan-50 shadow-[0_0_12px_rgba(56,189,248,0.14)] hover:bg-white/16 hover:text-white"
                    : "border-white/14 bg-white/[0.07] text-cyan-100 shadow-[0_0_12px_rgba(56,189,248,0.12)] hover:bg-white/[0.12] hover:text-white"
                }`}
                aria-label="Skip tutorial"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p
              className={`mt-4 text-sm leading-7 ${
                isLightAppearance
                  ? "text-cyan-50/86 drop-shadow-[0_0_8px_rgba(103,232,249,0.2)]"
                  : "text-cyan-50/[0.84]"
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
                      ? "w-8 bg-cyan-300 shadow-[0_0_9px_rgba(34,211,238,0.62)]"
                      : isLightAppearance
                        ? "w-3 bg-sky-200/70"
                        : "w-3 bg-cyan-100/[0.22]"
                  }`}
                />
              ))}
              <span
                className={`ml-auto text-xs font-medium uppercase tracking-[0.16em] ${
                  isLightAppearance
                    ? "text-cyan-50/66 drop-shadow-[0_0_8px_rgba(103,232,249,0.34)]"
                    : "text-cyan-100/[0.62] drop-shadow-[0_0_8px_rgba(103,232,249,0.34)]"
                }`}
              >
                {activeStepIndex + 1} / {totalSteps}
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onSkip}
                className={`min-h-11 rounded-2xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 sm:min-h-0 ${
                  isLightAppearance
                    ? "text-cyan-50/78 hover:bg-white/15 hover:text-white"
                    : "text-cyan-100/[0.78] hover:bg-white/10 hover:text-white"
                }`}
              >
                Skip for now
              </button>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={!canGoBack}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-24 ${
                    isLightAppearance
                      ? "border-cyan-100/25 bg-white/[0.1] text-cyan-50 shadow-[inset_0_0_20px_rgba(56,189,248,0.16)] hover:bg-white/[0.18] hover:text-white"
                      : "border-cyan-100/25 bg-white/[0.08] text-cyan-50 shadow-[inset_0_0_20px_rgba(56,189,248,0.12)] hover:bg-white/[0.14]"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 sm:min-w-24 ${
                    isLightAppearance
                      ? "border-cyan-200/80 bg-cyan-300 text-slate-950 shadow-[0_0_14px_rgba(34,211,238,0.3),inset_0_1px_0_rgba(255,255,255,0.55)] hover:bg-cyan-200"
                      : "border-cyan-100/45 bg-cyan-300 text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.36),inset_0_1px_0_rgba(255,255,255,0.58)] hover:bg-cyan-200"
                  }`}
                >
                  {activeStepIndex === totalSteps - 1 ? "Finish" : "Next"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
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
      className={`inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_0_14px_rgba(34,211,238,0.16)] ${
        resolvedAppearance === "light"
          ? "border-cyan-100/35 bg-cyan-50/[0.14] text-cyan-50 drop-shadow-[0_0_8px_rgba(103,232,249,0.42)]"
          : "border-cyan-100/26 bg-cyan-200/[0.1] text-cyan-100 drop-shadow-[0_0_8px_rgba(103,232,249,0.34)]"
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
    ? Math.min(
        SpotlightMobileCardHeight,
        viewportHeight - SpotlightMobileViewportGap * 2,
      )
    : Math.min(
        SpotlightDesktopCardHeight,
        viewportHeight - SpotlightViewportGap * 2,
      );
  const drawerAwareLeft =
    rect.avoidLeftOf && !isMobileViewport
      ? rect.avoidLeftOf - cardWidth - SpotlightViewportGap
      : null;
  const centeredLeft =
    drawerAwareLeft ??
    (isMobileViewport
      ? viewportWidth / 2 - cardWidth / 2
      : viewportWidth < 768
        ? viewportWidth / 2 - cardWidth / 2
        : rect.left + rect.width / 2 - cardWidth / 2);
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
  mascotSize: { height: number; width: number },
): CSSProperties {
  const mascotCardOverlap = viewportSize.width < 640 ? 20 : -10;
  const cardWidth = Math.min(
    SpotlightCardWidth,
    viewportSize.width - getViewportGap(viewportSize.width) * 2,
  );
  const cardRight = cardPosition.left + cardWidth;
  const viewportGap = getViewportGap(viewportSize.width);
  const canFitOnRight =
    viewportSize.width - cardRight >= mascotSize.width - mascotCardOverlap;
  const canFitOnLeft =
    cardPosition.left >= mascotSize.width - mascotCardOverlap;

  if (canFitOnLeft) {
    return {
      left: cardPosition.left - mascotSize.width + mascotCardOverlap,
      top: cardPosition.top + (viewportSize.width < 640 ? 2 : 8),
    };
  }

  if (canFitOnRight) {
    return {
      left: cardRight - mascotCardOverlap,
      top: cardPosition.top + (viewportSize.width < 640 ? 2 : 8),
    };
  }

  return {
    left: clamp(
      cardRight - mascotSize.width - 12,
      viewportGap,
      viewportSize.width - mascotSize.width - viewportGap,
    ),
    top: clamp(
      cardPosition.top - mascotSize.height + 42,
      viewportGap,
      Math.max(viewportGap, viewportSize.height - mascotSize.height - viewportGap),
    ),
  };
}

function getMascotSize(viewportWidth: number) {
  const width =
    viewportWidth < 380
      ? SpotlightCompactMobileMascotWidth
      : viewportWidth < 640
        ? SpotlightMobileMascotWidth
        : SpotlightDesktopMascotWidth;

  return {
    width,
    height: width * SpotlightMascotAspectRatio,
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
    frame: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
    hideFrame: rect.hideFrame,
  } satisfies Record<
    "top" | "left" | "right" | "bottom" | "frame",
    CSSProperties
  > & { hideFrame?: boolean };
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
  const hideFrame = shouldHideSpotlightFrame(element);
  const containingDialog = getContainingSpotlightDialog(element);
  const containingDialogBounds = containingDialog?.getBoundingClientRect();
  const padding = hideFrame ? 0 : SpotlightPadding;
  const top = clamp(bounds.top - padding, 0, viewportHeight);
  const left = clamp(bounds.left - padding, 0, viewportWidth);
  const right = clamp(
    bounds.right + padding,
    0,
    viewportWidth,
  );
  const bottom = clamp(
    bounds.bottom + padding,
    0,
    viewportHeight,
  );

  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
    avoidLeftOf: containingDialogBounds?.left,
    hideFrame,
  };
}

function shouldHideSpotlightFrame(element: HTMLElement) {
  const spotlightId = element.getAttribute("data-spotlight-id") ?? "";

  return (
    element.getAttribute("role") === "dialog" ||
    spotlightId.endsWith("-drawer") ||
    Boolean(element.closest("[role='dialog']"))
  );
}

function getContainingSpotlightDialog(element: HTMLElement) {
  const ownRole = element.getAttribute("role");

  if (ownRole === "dialog") {
    return element;
  }

  return element.closest<HTMLElement>("[role='dialog']");
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
