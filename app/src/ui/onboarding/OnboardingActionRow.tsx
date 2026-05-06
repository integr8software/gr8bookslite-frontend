import { ArrowLeft, ArrowRight } from "lucide-react";

type OnboardingActionRowProps = {
  showBack: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  onBack: () => void;
};

export function OnboardingActionRow({
  showBack,
  primaryLabel,
  onPrimary,
  onBack,
}: OnboardingActionRowProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-14 items-center justify-center gap-2 rounded-sm border border-darknavy/20 bg-white px-5 text-sm font-semibold text-darknavy transition hover:bg-offwhite"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={onPrimary}
        className="flex h-14 items-center justify-center gap-2 rounded-sm bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/90"
      >
        <span>{primaryLabel}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
