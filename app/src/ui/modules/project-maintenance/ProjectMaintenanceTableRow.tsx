import { ProjectMaintenanceStatuses } from "@/app/src/constants/modules/project-maintenance/ProjectMaintenanceConstants";
import type {
  ProjectMaintenance,
  ProjectMaintenancePermissions,
  ProjectMaintenanceTableRowProps,
} from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTableActionButton, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";
import { formatDateTime } from "@/app/src/utils/date.util";

export function ProjectMaintenanceTableRow({
  row,
  permissions,
  onEditProject,
  onToggleStatus,
  onViewProject,
}: ProjectMaintenanceTableRowProps) {
  return (
    <tr className="module-table-row">
      {row.getVisibleCells().map((cell) => (
        <ProjectMaintenanceTableCell key={cell.id} className={getColumnMetaClassName(cell.column.columnDef.meta)}>
          <ProjectMaintenanceCellContent
            columnId={cell.column.id}
            project={row.original}
            permissions={permissions}
            onEditProject={onEditProject}
            onToggleStatus={onToggleStatus}
            onViewProject={onViewProject}
          />
        </ProjectMaintenanceTableCell>
      ))}
    </tr>
  );
}

function ProjectMaintenanceCellContent({
  columnId,
  project,
  permissions,
  onEditProject,
  onToggleStatus,
  onViewProject,
}: {
  columnId: string;
  project: ProjectMaintenance;
  permissions: ProjectMaintenancePermissions;
  onEditProject: (project: ProjectMaintenance) => void;
  onToggleStatus: (project: ProjectMaintenance) => void;
  onViewProject: (project: ProjectMaintenance) => void;
}) {
  const nextStatus =
    project.status === ProjectMaintenanceStatuses.Active ? ProjectMaintenanceStatuses.Inactive : ProjectMaintenanceStatuses.Active;
  const statusActionLabel = project.status === ProjectMaintenanceStatuses.Active ? "Deactivate" : "Activate";

  switch (columnId) {
    case "projectCode":
      return <span className="font-semibold text-darknavy/85">{project.projectCode}</span>;
    case "projectName":
      return <span className="font-medium text-darknavy">{project.projectName}</span>;
    case "type":
      return <span className="text-darknavy/75">{project.type}</span>;
    case "description":
      return (
        <span className="block truncate text-darknavy/75" title={project.description}>
          {project.description || ""}
        </span>
      );
    case "status":
      return <ModuleStatusBadge status={project.status} />;
    case "createdBy":
      return <span>{project.createdBy ?? ""}</span>;
    case "createdAt":
      return <span>{formatDateTime(project.createdAt, { emptyValue: "", locale: "en-US" })}</span>;
    case "updatedBy":
      return <span>{project.updatedBy ?? ""}</span>;
    case "updatedAt":
      return <span>{formatDateTime(project.updatedAt, { emptyValue: "", locale: "en-US" })}</span>;
    case "actions":
      return (
        <ModuleTableActions data-spotlight-id="maintenance-record-actions" className="w-full !justify-center">
          <ModuleTableActionButton
            variant="view"
            onClick={() => onViewProject(project)}
            data-spotlight-id="maintenance-record-view"
            label={`View ${project.projectName}`}
          />
          {permissions.canUpdate ? (
            <>
              <ModuleTableActionButton
                variant="edit"
                onClick={() => onEditProject(project)}
                data-spotlight-id="maintenance-record-edit"
                label={`Edit ${project.projectName}`}
              />
              <ModuleTableActionButton
                variant={nextStatus === ProjectMaintenanceStatuses.Inactive ? "inactive" : "active"}
                onClick={() => onToggleStatus(project)}
                data-spotlight-id="maintenance-record-status"
                label={`${statusActionLabel} ${project.projectName}`}
              />
            </>
          ) : null}
        </ModuleTableActions>
      );
    default:
      return null;
  }
}

function ProjectMaintenanceTableCell({ className = "text-left", children }: { className?: string; children: React.ReactNode }) {
  return <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>{children}</td>;
}
