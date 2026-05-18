import { AppSkeleton } from "@/app/src/ui/shared/AppSkeleton";
import { GradientBlurBackground } from "@/app/src/ui/shared/GradientBlurBackground";

type SidebarLogoProps = {
  companyBadgeLabel?: string;
  companyLogoUrl?: string;
  companyName: string;
};

export function SidebarLogo({
  companyBadgeLabel,
  companyLogoUrl,
  companyName,
}: SidebarLogoProps) {
  if (companyLogoUrl) {
    return (
      <span
        aria-hidden="true"
        className="block h-9 w-9 shrink-0 rounded-md bg-cover bg-center ring-1 ring-darknavy/10"
        style={{ backgroundImage: `url("${companyLogoUrl}")` }}
      />
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
