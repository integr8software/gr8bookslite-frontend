import type { LucideIcon } from "lucide-react";
import type { MainCompany } from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import { ImageSwatch } from "./ImageSwatch";
import { joinClasses } from "./utils";

type SwitcherButtonProps = {
  description?: string;
  icon: LucideIcon;
  imageUrl?: string;
  isActive: boolean;
  label: string;
  status?: MainCompany["status"];
  onClick: () => void;
};

export function SwitcherButton({
  description,
  icon: Icon,
  imageUrl,
  isActive,
  label,
  status,
  onClick,
}: SwitcherButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={joinClasses(
        "flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
        isActive
          ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
          : "text-darknavy hover:bg-blue-50/70",
      )}
    >
      <span
        className={joinClasses(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white shadow-sm",
          isActive ? "text-blue-600" : "text-darknavy",
        )}
      >
        {imageUrl ? (
          <ImageSwatch imageUrl={imageUrl} className="h-5 w-5 rounded" />
        ) : (
          <Icon className="h-4 w-4" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-darknavy">
          {label}
        </span>
        {description ? (
          <span className="mt-1 block truncate text-xs text-darknavy/50">
            {description}
          </span>
        ) : null}
      </span>
      {isActive ? (
        <span className="mt-1 inline-flex min-h-6 items-center rounded-full bg-blue-600 px-3 text-xs font-semibold text-white">
          Current
        </span>
      ) : status ? (
        <span className="mt-1 inline-flex min-h-6 items-center rounded-full bg-citron/35 px-3 text-xs font-semibold text-darknavy">
          {status}
        </span>
      ) : null}
    </button>
  );
}
