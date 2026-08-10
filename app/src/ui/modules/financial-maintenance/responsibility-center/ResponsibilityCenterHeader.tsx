import { Network, Plus } from "lucide-react";
import {
  ResponsibilityCenterDescription,
  ResponsibilityCenterParentLabel,
  ResponsibilityCenterTitle,
} from "@/app/src/constants/modules/financial-maintenance/responsibility-center/ResponsibilityCenterConstants";
import type { ResponsibilityCenterPermissions } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function ResponsibilityCenterHeader({ onAdd, permissions }: { onAdd: () => void; permissions: ResponsibilityCenterPermissions }) {
  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={ResponsibilityCenterTitle}
      description={ResponsibilityCenterDescription}
      actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
      eyebrow={
        <>
          <Network className="h-3.5 w-3.5" aria-hidden="true" />
          {ResponsibilityCenterParentLabel}
        </>
      }
      actions={
        permissions.canCreate ? (
          <button
            type="button"
            onClick={onAdd}
            data-spotlight-id="maintenance-create-record"
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Responsibility Center
          </button>
        ) : null
      }
    />
  );
}
