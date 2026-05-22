import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import { GradientBlurBackground } from "@/app/src/ui/shared/layout/GradientBlurBackground";

export function TopbarWorkspaceSkeleton() {
  return (
    <div className="relative h-10 min-w-36 max-w-52 flex-1 basis-0 overflow-hidden rounded-md border border-darknavy/10 bg-white px-3 lg:max-w-56 xl:max-w-60">
      <GradientBlurBackground
        fixed={false}
        height="h-full"
        className="opacity-50"
      />
      <div className="relative flex h-full items-center gap-2">
        <AppSkeleton className="h-4 w-4 shrink-0 rounded-sm" />
        <AppSkeleton className="h-4 w-32 rounded-md" />
      </div>
    </div>
  );
}

export function TopbarProfileSkeleton() {
  return (
    <div className="relative flex h-10 min-w-10 items-center gap-2 overflow-hidden rounded-full border border-darknavy/20 bg-white p-0.5 shadow-sm md:rounded-md xl:pr-2">
      <GradientBlurBackground
        fixed={false}
        height="h-full"
        className="opacity-50"
      />
      <AppSkeleton className="relative h-8 w-8 shrink-0 rounded-full md:rounded-md" />
      <div className="relative hidden min-w-0 max-w-44 space-y-1.5 xl:block 2xl:max-w-56">
        <AppSkeleton className="h-3.5 w-24 rounded-md" />
        <AppSkeleton className="h-3 w-16 rounded-md" />
      </div>
    </div>
  );
}
