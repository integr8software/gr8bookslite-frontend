import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ItemVariationRecord } from "@/app/src/types/modules/maintenance/item-variations/ItemVariationsTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const ItemVariationsHref = MODULE_ROUTE_MAP.IV;

export const ItemVariationsApiPath = "/maintenance/item-variations";

export const ItemVariationsTitle = "Item Variations";

export const ItemVariationsDescription =
  "Maintain reusable item variations and values assigned to item records.";

export const ItemVariationsDrawerFormId = "item-variations-drawer-form";

export const ItemVariationsPaginationStorageKey = "maintenance.item-variations";

export const ItemVariationsFieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-not-allowed disabled:bg-offwhite/65";

export const ItemVariationsTableColumns = [
  { key: "name", label: "Variation Name", className: "w-[18rem]" },
  { key: "values", label: "Values", className: "w-[28rem]" },
  { key: "status", label: "Status", className: "w-[7rem] text-center" },
  { label: "Action", className: "w-[9rem] text-center" },
] as const;

export const ItemVariationsTablePreferencesStorageKey =
  "gr8booksneo:item-variations:table-preferences";
export const ItemVariationsTablePreferencesModuleKey = "maintenance:item-variations";
export const ItemVariationsDefaultColumnOrder = ItemVariationsTableColumns.map((column) =>
  "key" in column ? column.key : "actions",
);

export const ItemVariationsDefaultColumnVisibility: VisibilityState = {};

export const ItemVariationsDefaultSorting: SortingState = [{ id: "name", desc: false }];

export const ItemVariationsExportColumns: ModuleTableExportColumn<ItemVariationRecord>[] = [
  ...ItemVariationsTableColumns.flatMap((column) =>
    "key" in column
      ? [
          {
            header: column.label,
            id: column.key,
            value:
              column.key === "values"
                ? (record: ItemVariationRecord) =>
                    record.values.map((value) => value.label).join(", ")
                : column.key,
          },
        ]
      : [],
  ),
];
