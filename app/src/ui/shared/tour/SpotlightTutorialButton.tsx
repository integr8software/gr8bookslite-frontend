"use client";

import { Sparkles } from "lucide-react";
import { getSpotlightTutorialOpenEvent } from "@/app/src/data/shared/tour/SpotlightTutorialRegistry";

type SpotlightTutorialButtonProps = {
  activeHref: string;
};

export function SpotlightTutorialButton({
  activeHref,
}: SpotlightTutorialButtonProps) {
  const openEvent = getSpotlightTutorialOpenEvent(activeHref);

  if (!openEvent) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(openEvent))}
      aria-label="Start spotlight tutorial"
      title="Spotlight tutorial"
      className="flex h-10 w-10 items-center justify-center rounded-full text-darknavy transition-all duration-200 ease-out hover:bg-darknavy/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100 md:rounded-md"
    >
      <Sparkles className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
