import { Folder, Plus } from "lucide-react";
import {
  ProjectMaintenanceDescription,
  ProjectMaintenanceParentLabel,
  ProjectMaintenanceTitle,
} from "@/app/src/constants/modules/project-maintenance/ProjectMaintenanceConstants";
import type { ProjectMaintenancePermissions } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function ProjectMaintenanceHeader({
  onAdd,
  permissions,
}: {
  onAdd: () => void;
  permissions: ProjectMaintenancePermissions;
}) {
  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={ProjectMaintenanceTitle}
      description={ProjectMaintenanceDescription}
      actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
      eyebrow={
        <>
          <Folder className="h-3.5 w-3.5" aria-hidden="true" />
          {ProjectMaintenanceParentLabel}
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
            Add Project
          </button>
        ) : null
      }
    />
  );
}
