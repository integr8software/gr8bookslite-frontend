"use client";

import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { useWorkspaceSpotlightTutorial } from "@/app/src/hooks/modules/dashboard/useWorkspaceSpotlightTutorial";

export function WorkspaceSpotlightTutorial() {
  const {
    activeStep,
    activeStepIndex,
    canGoBack,
    cardPosition,
    isOpen,
    overlayStyles,
    spotlightRect,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    skipTutorial,
  } = useWorkspaceSpotlightTutorial();

  if (!isOpen || !activeStep) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-120" aria-live="polite">
      {overlayStyles ? (
        <>
          <div
            className="fixed bg-darknavy/58 backdrop-blur-[1px]"
            style={overlayStyles.top}
          />
          <div
            className="fixed bg-darknavy/58 backdrop-blur-[1px]"
            style={overlayStyles.left}
          />
          <div
            className="fixed bg-darknavy/58 backdrop-blur-[1px]"
            style={overlayStyles.right}
          />
          <div
            className="fixed bg-darknavy/58 backdrop-blur-[1px]"
            style={overlayStyles.bottom}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-darknavy/62 backdrop-blur-[1px]" />
      )}

      {spotlightRect ? (
        <div
          className="fixed rounded-[1.75rem] border border-skyblue/80 shadow-[0_0_0_1px_rgba(255,255,255,0.65),0_0_0_9999px_rgba(0,0,0,0)]"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
          }}
        />
      ) : null}

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Workspace tutorial"
        className="pointer-events-auto fixed w-[calc(100vw-2rem)] max-w-90 rounded-[1.75rem] border border-white/15 bg-darknavy p-5 text-offwhite shadow-[0_24px_80px_rgba(33,39,56,0.45)]"
        style={{
          top: cardPosition.top,
          left: cardPosition.left,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-skyblue">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              New account guide
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              {activeStep.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={skipTutorial}
            className="rounded-full p-2 text-offwhite/70 transition hover:bg-white/10 hover:text-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50"
            aria-label="Skip tutorial"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-offwhite/75">
          {activeStep.description}
        </p>

        <div className="mt-5 flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === activeStepIndex ? "w-8 bg-skyblue" : "w-3 bg-white/20"
              }`}
            />
          ))}
          <span className="ml-auto text-xs font-medium uppercase tracking-[0.16em] text-offwhite/45">
            {activeStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={skipTutorial}
            className="rounded-2xl px-3 py-2 text-sm font-semibold text-offwhite/72 transition hover:bg-white/10 hover:text-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50"
          >
            Skip for now
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={!canGoBack}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/12 px-4 text-sm font-semibold text-offwhite transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
            <button
              type="button"
              onClick={goToNextStep}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-skyblue px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50"
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
