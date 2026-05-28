import type { LucideIcon } from "lucide-react";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type BeginningBalanceUploaderActionButtonProps = {
  icon: LucideIcon;
  label: string;
  primary?: boolean;
};

export function BeginningBalanceUploaderActionButton({
  icon: Icon,
  label,
  primary,
}: BeginningBalanceUploaderActionButtonProps) {
  return (
    <button
      type="button"
      className={
        primary
          ? moduleHeaderActionClassNames.primary
          : moduleHeaderActionClassNames.secondary
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </button>
  );
}
