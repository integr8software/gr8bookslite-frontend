import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleOff, Edit3, Save, X } from "lucide-react";
import { ItemsHref } from "@/app/src/constants/modules/item-management/items/ItemManagementConstants";
import type {
  ItemActionMode,
  ItemRecord,
  ItemStatus,
} from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ItemActionButtonsProps = {
  isReadonly: boolean;
  item?: ItemRecord;
  mode: ItemActionMode;
  nextStatus?: ItemStatus;
  onSave: () => void;
  onStatusChange: () => void;
};

export function ItemActionButtons({
  isReadonly,
  item,
  mode,
  nextStatus,
  onSave,
  onStatusChange,
}: ItemActionButtonsProps) {
  const StatusIcon = nextStatus === "Inactive" ? CircleOff : CheckCircle2;
  const statusLabel = nextStatus === "Inactive" ? "Set Inactive" : "Reactivate";

  return (
    <>
      <Link
        href={ItemsHref}
        className={joinClasses(responsiveActionClassName, moduleHeaderActionClassNames.secondary)}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
      {mode === "view" && item ? (
        <Link
          href={`${ItemsHref}/edit/${item.id}`}
          className={joinClasses(responsiveActionClassName, moduleHeaderActionClassNames.secondary)}
        >
          <Edit3 className="h-4 w-4" aria-hidden="true" />
          Edit
        </Link>
      ) : null}
      {item && nextStatus ? (
        <button
          type="button"
          onClick={onStatusChange}
          className={
            nextStatus === "Inactive"
              ? joinClasses(responsiveActionClassName, moduleHeaderActionClassNames.danger)
              : joinClasses(responsiveActionClassName, moduleHeaderActionClassNames.secondary)
          }
        >
          <StatusIcon className="h-4 w-4" aria-hidden="true" />
          {statusLabel}
        </button>
      ) : null}
      {mode === "edit" && item ? (
        <Link
          href={`${ItemsHref}/view/${item.id}`}
          className={joinClasses(responsiveActionClassName, moduleHeaderActionClassNames.secondary)}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Cancel
        </Link>
      ) : null}
      {!isReadonly ? (
        <button
          type="button"
          onClick={onSave}
          className={joinClasses(responsiveActionClassName, moduleHeaderActionClassNames.primary)}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save Item
        </button>
      ) : null}
    </>
  );
}

const responsiveActionClassName = "w-full sm:w-auto";
