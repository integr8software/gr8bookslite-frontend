type OnboardingProgressHeaderProps = {
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  title: string;
  description: string;
};

export function OnboardingProgressHeader({
  currentStep,
  totalSteps,
  progressPercent,
  title,
  description,
}: OnboardingProgressHeaderProps) {
  return (
    <>
      <div className="flex items-end justify-between gap-4 text-sm text-darknavy/80">
        <p>
          Step {currentStep} of {totalSteps}
        </p>
        <p>{progressPercent}%</p>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-darknavy/15">
        <div
          className="h-full rounded-full bg-darknavy transition-[width] duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <header className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight text-darknavy">
          {title}
        </h1>
        <p className="mt-3 text-sm text-darknavy/70">{description}</p>
      </header>
    </>
  );
}
