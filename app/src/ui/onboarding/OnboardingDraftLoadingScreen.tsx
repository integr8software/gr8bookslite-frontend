"use client";

import { Check, FileStack } from "lucide-react";

type OnboardingDraftLoadingScreenProps = {
  isFullScreen?: boolean;
};

export function OnboardingDraftLoadingScreen({
  isFullScreen = false,
}: OnboardingDraftLoadingScreenProps) {
  const content = (
    <section
      className="mx-auto flex w-full max-w-md flex-col items-center text-center text-darknavy"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="relative aspect-square w-[min(70vw,260px)]">
        <div className="absolute inset-x-[18%] bottom-[10%] h-[5%] rounded-full bg-darknavy/10 blur-lg" />

        <div className="draft-stack-card draft-stack-card-back absolute left-1/2 top-1/2 h-[58%] w-[58%] rounded-lg border border-darknavy/10 bg-offwhite shadow-sm" />
        <div className="draft-stack-card draft-stack-card-mid absolute left-1/2 top-1/2 h-[62%] w-[62%] rounded-lg border border-darknavy/10 bg-white shadow-[0_18px_45px_rgba(33,39,56,0.10)]" />

        <div className="draft-stack-card draft-stack-card-front absolute left-1/2 top-1/2 h-[66%] w-[66%] overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_24px_70px_rgba(33,39,56,0.14)]">
          <div className="absolute right-0 top-0 h-[24%] w-[24%] overflow-hidden">
            <div className="absolute right-[-18%] top-[-18%] h-full w-full origin-bottom-left rotate-45 border border-darknavy/10 bg-offwhite" />
          </div>

          <div className="absolute left-[13%] top-[15%] flex w-[68%] items-center gap-[6%]">
            <div className="flex aspect-square w-[22%] min-w-8 items-center justify-center rounded-md bg-skyblue/15 text-skyblue">
              <FileStack className="h-[56%] w-[56%]" aria-hidden="true" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-2 w-full rounded-full bg-darknavy/18" />
              <div className="h-1.5 w-[58%] rounded-full bg-darknavy/10" />
            </div>
          </div>

          <div className="absolute left-[13%] right-[13%] top-[50%] space-y-[5%]">
            <div className="h-2 rounded-full bg-coralpink/75" />
            <div className="h-2 w-[78%] rounded-full bg-skyblue/55" />
            <div className="h-2 w-[62%] rounded-full bg-citron/80" />
          </div>

          <div className="absolute bottom-[12%] left-[13%] right-[13%] h-[8%] overflow-hidden rounded-full bg-darknavy/8">
            <div className="draft-restore-bar h-full rounded-full bg-skyblue" />
          </div>
        </div>

        <div className="draft-restore-check absolute bottom-[19%] right-[20%] flex h-8 w-8 items-center justify-center rounded-full bg-citron text-darknavy shadow-sm">
          <Check className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold text-darknavy">
        Restoring your unfinished onboarding draft
        <span className="draft-loader-dots" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
      <p className="mt-2 max-w-xs text-xs leading-5 text-darknavy/55">
        Filling in the details you already started.
      </p>
    </section>
  );

  if (!isFullScreen) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-8">
        {content}
      </div>
    );
  }

  return (
    <main className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-offwhite px-6 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(209,214,70,0.10),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(87,196,229,0.16),transparent_28%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(33,39,56,0.12)_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />
      <div className="relative">{content}</div>
    </main>
  );
}
