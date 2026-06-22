type OnboardingProgressHeaderProps = {
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  title: string;
  description: string;
};

export function OnboardingProgressHeader({
  currentStep,
  progressPercent,
  title,
  description,
}: OnboardingProgressHeaderProps) {
  const steps = ["Plan", "Company", "Billing", "Review"];

  return (
    <header>
      <div className="rounded-2xl border border-darknavy/10 bg-white/80 p-5 shadow-[0_14px_40px_rgba(33,39,56,0.07)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-darknavy lg:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-darknavy/55">
            {description}
          </p>
          </div>

          <div className="w-full lg:max-w-xl">
          <div className="flex items-start justify-between">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isComplete = stepNumber < currentStep;

              return (
                <div
                  key={step}
                  className="relative flex flex-col items-center gap-2"
                >
                  <span
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                      isActive
                        ? "bg-darknavy text-white shadow-md"
                        : isComplete
                          ? "bg-citron text-darknavy"
                          : "border border-darknavy/10 bg-white text-darknavy/35"
                    }`}
                  >
                    {stepNumber}
                  </span>
                  <span
                    className={`hidden text-[10px] font-semibold sm:block ${
                      isActive ? "text-darknavy" : "text-darknavy/40"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-darknavy/10">
            <div
              className="h-full rounded-full bg-skyblue transition-[width] duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          </div>
        </div>
      </div>
    </header>
  );
}
