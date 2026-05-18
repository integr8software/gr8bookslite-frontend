import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function MenuSeparator() {
  return <div className="my-1 border-t border-darknavy/10" />;
}

type ProfileMenuLinkProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

type ProfileMenuButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

export function ProfileMenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: ProfileMenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-darknavy/72 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
    >
      <Icon className="h-4 w-4 shrink-0 text-darknavy/50" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function ProfileMenuButton({
  icon: Icon,
  label,
  onClick,
}: ProfileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-darknavy/72 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
    >
      <Icon className="h-4 w-4 shrink-0 text-darknavy/50" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </button>
  );
}
