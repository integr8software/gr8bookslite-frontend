import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const StorageLocationsHref = MODULE_ROUTE_MAP.WSL;

export const StorageLocationsApiPath = "/maintenance/storage-locations";

export const StorageLocationsTitle = "Storage Locations";

export const StorageLocationsDescription =
	"Maintain physical warehouse locations by zone, aisle, rack, shelf, bin, and status.";

export const StorageLocationsActionLabel = "Add Location";

export const StorageLocationsTableHeaders = [
	"Warehouse",
	"Zone",
	"Aisle",
	"Rack No",
	"Shelf No",
	"Bin No",
	"Location Code",
	"Status",
] as const;

export const StorageLocationsTableColumns = [
	{ id: "warehouse", label: "Warehouse", valueIndex: 0, className: "w-[14rem]" },
	{ id: "zone", label: "Zone", valueIndex: 1, className: "w-[10rem]" },
	{ id: "aisle", label: "Aisle", valueIndex: 2, className: "w-[10rem]" },
	{ id: "rackNo", label: "Rack No", valueIndex: 3, className: "w-[10rem]" },
	{ id: "shelfNo", label: "Shelf No", valueIndex: 4, className: "w-[10rem]" },
	{ id: "binNo", label: "Bin No", valueIndex: 5, className: "w-[10rem]" },
	{
		id: "locationCode",
		label: "Location Code",
		valueIndex: 6,
		className: "w-[16rem]",
	},
	{
		id: "status",
		label: "Status",
		valueIndex: 7,
		className: "w-[10rem] text-center",
	},
	{ id: "actions", label: "Actions", className: "w-[9rem] text-center" },
] as const;

export const StorageLocationsPaginationStorageKey =
	"maintenance.storage-locations";

export const StorageLocationStatusOptions = ["Active", "Inactive"] as const;
