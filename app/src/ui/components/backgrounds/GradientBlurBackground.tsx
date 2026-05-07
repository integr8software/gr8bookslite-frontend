type GradientBlurBackgroundProps = {
  height?: string;
  fixed?: boolean;
  className?: string;
};

const BackgroundClipPath =
  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)";

export function GradientBlurBackground({
  height = "h-screen",
  fixed = true,
  className = "",
}: GradientBlurBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`${height} pointer-events-none inset-0 -z-10 bg-cover bg-white bg-center ${fixed ? "fixed" : "absolute"
        } ${className}`}
    >
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-skyblue via-[#38bdf8] to-[#6366f1] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{ clipPath: BackgroundClipPath }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-gradient-to-tr from-[#06b6d4] via-skyblue to-[#2563eb] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{ clipPath: BackgroundClipPath }}
        />
      </div>
    </div>
  );
}
