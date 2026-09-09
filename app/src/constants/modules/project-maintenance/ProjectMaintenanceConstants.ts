import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
  ProjectMaintenance,
  ProjectMaintenanceStatus,
} from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const ProjectMaintenanceHref = getModuleRoute("PJM");

export const ProjectMaintenanceApiPath = "/maintenance/project-maintenance";

export const ProjectMaintenanceParentLabel = "Project master data";

export const ProjectMaintenanceTitle = "Project Maintenance";

export const ProjectMaintenanceDescription = "Maintain project records used across company transactions and reports.";

export const ProjectMaintenanceDrawerFormId = "project-maintenance-drawer-form";

export const ProjectMaintenanceTablePaginationStorageKey = "maintenance:project-maintenance";

export const ProjectMaintenanceTableColumns = [
  {
    key: "projectName",
    label: "Project Name",
    className: "w-[24%]",
  },
  {
    key: "projectDescription",
    label: "Project Description",
    className: "w-[30%]",
  },
  {
    key: "createdBy",
    label: "Created By",
    className: "w-[14%]",
  },
  {
    key: "createdAt",
    label: "Date Created",
    className: "w-[16%]",
  },
  {
    key: "updatedBy",
    label: "Updated By",
    className: "w-[14%]",
  },
  {
    key: "updatedAt",
    label: "Date Modified",
    className: "w-[16%]",
  },
  {
    key: "status",
    label: "Status",
    className: "w-[12%] text-center",
  },
  {
    label: "Action",
    className: "w-[16%] text-center",
  },
] as const;

export const ProjectMaintenanceTablePreferencesStorageKey = "gr8booksneo:project-maintenance:table-preferences";
export const ProjectMaintenanceTablePreferencesModuleKey = "maintenance:project-maintenance";
export const ProjectMaintenanceDefaultColumnOrder = ProjectMaintenanceTableColumns.map((column) =>
  "key" in column ? column.key : "actions",
);
export const ProjectMaintenanceDefaultColumnVisibility: VisibilityState = {
  createdBy: false,
  createdAt: false,
  updatedBy: false,
  updatedAt: false,
};
export const ProjectMaintenanceDefaultSorting: SortingState = [{ id: "projectName", desc: false }];

export const ProjectMaintenanceExportColumns: ModuleTableExportColumn<ProjectMaintenance>[] = [
  ...ProjectMaintenanceTableColumns.flatMap((column) =>
    "key" in column
      ? [
          {
            header: column.label,
            id: column.key,
            value: column.key,
          },
        ]
      : [],
  ),
];

export const ProjectMaintenanceStatuses = {
  Active: "Active",
  Inactive: "Inactive",
} as const satisfies Record<string, ProjectMaintenanceStatus>;

export const ProjectMaintenanceStatusOptions = [
  ProjectMaintenanceStatuses.Active,
  ProjectMaintenanceStatuses.Inactive,
] as const satisfies readonly ProjectMaintenanceStatus[];

export const ProjectMaintenanceActionCopy = {
  add: {
    title: "Add Project Maintenance",
    description: "Create a project record for company transactions and reporting.",
  },
  edit: {
    title: "Edit Project Maintenance",
    description: "Update the project details used across company operations.",
  },
  view: {
    title: "View Project Maintenance",
    description: "Review the configured project details before making changes.",
  },
} as const;
