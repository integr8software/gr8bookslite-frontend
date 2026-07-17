export const UnitOfMeasurementTitle = "Unit of Measurement";
export const UnitOfMeasurementDescription =
	"Maintain units used by item records, purchasing, sales, and inventory quantities.";
export const UnitOfMeasurementDrawerFormId = "unit-of-measurement-drawer-form";
export const UnitOfMeasurementPaginationStorageKey =
	"maintenance.unit-of-measurement";

export const UnitOfMeasurementFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy";

export const UnitOfMeasurementQuantityModeOptions = [
	{ label: "Whole number quantities", value: "Integer" },
	{ label: "Decimal quantities", value: "Float" },
] as const;
