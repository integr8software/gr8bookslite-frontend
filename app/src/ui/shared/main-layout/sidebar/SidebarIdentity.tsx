import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import { GradientBlurBackground } from "@/app/src/ui/shared/layout/GradientBlurBackground";
import { ImageSwatch } from "@/app/src/ui/shared/main-layout/main-topbar/ImageSwatch";

type SidebarLogoProps = {
  companyBadgeLabel?: string;
  companyLogoUrl?: string;
  companyName: string;
  variant?: "company" | "master-control";
};

export function SidebarLogo({
  companyBadgeLabel,
  companyLogoUrl,
  companyName,
}: SidebarLogoProps) {
  if (companyLogoUrl) {
    return (
      <ImageSwatch
        imageUrl={companyLogoUrl}
        className="h-9 w-9 rounded-md text-sm font-bold ring-1 ring-darknavy/10"
      >
        {companyBadgeLabel ?? buildSidebarBadgeLabel(companyName)}
      </ImageSwatch>
    );
  }

  const badgeLabel = companyBadgeLabel ?? buildSidebarBadgeLabel(companyName);

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-darknavy text-sm font-bold text-offwhite">
      {badgeLabel}
    </span>
  );
}

export function SidebarIdentitySkeleton() {
  return (
    <span className="relative flex min-w-0 items-center gap-3 overflow-hidden rounded-xl px-1 py-1">
      <GradientBlurBackground
        fixed={false}
        height="h-full"
        className="opacity-60"
      />
      <AppSkeleton className="relative h-9 w-9 shrink-0 rounded-md" />
      <span className="relative min-w-0 space-y-2">
        <AppSkeleton className="h-4 w-28 rounded-md" />
        <AppSkeleton className="h-3 w-20 rounded-md" />
      </span>
    </span>
  );
}

function buildSidebarBadgeLabel(companyName: string) {
  const parts = companyName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "WS";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
