import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
	ServicesMaintenance,
	ServicesMaintenanceAccountSetupMode,
	ServicesMaintenanceStatus,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const ServicesMaintenanceHref = MODULE_ROUTE_MAP.SM;
export const ServicesMaintenanceApiPath =
	"/maintenance/financial-management/services-maintenance";
export const ServicesMaintenanceParentLabel = "Accounting master data";
export const ServicesMaintenanceTitle = "Services Maintenance";
export const ServicesMaintenanceDescription =
	"Maintain sellable services and their revenue account setup.";
export const ServicesMaintenanceDrawerFormId =
	"services-maintenance-drawer-form";
export const ServicesMaintenanceFieldClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.03] disabled:text-darknavy/70 disabled:placeholder:text-darknavy/32 read-only:bg-darknavy/[0.03] read-only:text-darknavy/70";
export const ServicesMaintenanceReadOnlyFieldClassName = `${ServicesMaintenanceFieldClassName} bg-darknavy/[0.03] font-semibold text-darknavy/80`;

export const ServicesMaintenanceStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly ServicesMaintenanceStatus[];
export const ServicesMaintenanceAccountSetupModeOptions = [
	"Auto",
	"Existing",
] as const satisfies readonly ServicesMaintenanceAccountSetupMode[];

export const ServicesMaintenanceTablePaginationStorageKey =
	"maintenance:financial-management:services-maintenance";
export const ServicesMaintenanceTablePreferencesStorageKey =
	"gr8booksneo:services-maintenance:table-preferences";
export const ServicesMaintenanceTablePreferencesModuleKey =
	"maintenance:services-maintenance";

export const ServicesMaintenanceTableColumns = [
	{ key: "serviceName", label: "Name", className: "w-[18%]" },
	{ key: "description", label: "Description", className: "w-[22%]" },
	{ key: "revenueAccountCode", label: "Account Code", className: "w-[12%]" },
	{ key: "revenueAccountTitle", label: "Account Title", className: "w-[24%]" },
	{ key: "status", label: "Status", className: "w-[11%] text-center" },
	{ key: "createdBy", label: "Created By", className: "w-[14%]" },
	{ key: "createdAt", label: "Date Created", className: "w-[16%]" },
	{ key: "updatedBy", label: "Updated By", className: "w-[14%]" },
	{ key: "updatedAt", label: "Date Modified", className: "w-[16%]" },
	{ label: "Action", className: "w-[16%] text-center" },
] as const;

export const ServicesMaintenanceDefaultColumnOrder =
	ServicesMaintenanceTableColumns.map((column) =>
		"key" in column ? column.key : "actions",
	);
export const ServicesMaintenanceDefaultColumnVisibility: VisibilityState = {
	description: false,
	revenueAccountCode: false,
	createdBy: false,
	createdAt: false,
	updatedBy: false,
	updatedAt: false,
};
export const ServicesMaintenanceDefaultSorting: SortingState = [
	{ id: "serviceName", desc: false },
];

export const ServicesMaintenanceExportColumns: ModuleTableExportColumn<ServicesMaintenance>[] =
	ServicesMaintenanceTableColumns.flatMap((column) =>
		"key" in column
			? [{ header: column.label, id: column.key, value: column.key }]
			: [],
	);

export const ServicesMaintenanceActionCopy = {
	add: {
		title: "Add Service",
		description:
			"Create a service and resolve its revenue account setup.",
	},
	edit: {
		title: "Edit Service",
		description:
			"Update service details and keep its generated revenue account synchronized.",
	},
	view: {
		title: "View Service",
		description: "Review service details and accounting setup.",
	},
} as const;
