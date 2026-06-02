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
      className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-skyblue/35 bg-cyan-100/20 text-darknavy shadow-[0_0_18px_rgba(56,189,248,0.18),inset_0_1px_0_rgba(255,255,255,0.55)] transition-all duration-200 ease-out hover:border-cyan-300/80 hover:bg-cyan-100/35 hover:shadow-[0_0_24px_rgba(34,211,238,0.35),inset_0_1px_0_rgba(255,255,255,0.75)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100 md:rounded-md"
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.72)_45%,transparent_62%)] opacity-0 transition-opacity duration-200 group-hover:opacity-70" />
      <span className="pointer-events-none absolute inset-x-2 top-1 h-px bg-cyan-200/80 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
      <Sparkles
        className="relative h-5 w-5 drop-shadow-[0_0_8px_rgba(14,165,233,0.72)] transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      />
    </button>
  );
}
