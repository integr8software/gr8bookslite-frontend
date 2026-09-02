import type { ReactNode } from "react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function ModuleDataEntryReadonlyCell({
  align = "left",
  title,
  value,
}: {
  align?: "left" | "right";
  title?: string;
  value: ReactNode;
}) {
  return (
    <div
      className={joinClasses(
        "flex h-10 w-full items-center truncate bg-offwhite/45 px-3 text-sm font-medium text-darknavy/70",
        align === "right" && "justify-end text-right tabular-nums",
      )}
      title={title}
    >
      {value}
    </div>
  );
}
