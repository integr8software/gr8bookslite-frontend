import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ItemAttributeRecord } from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const ItemAttributesHref = MODULE_ROUTE_MAP.IA;

export const ItemAttributesApiPath = "/maintenance/item-attributes";

export const ItemAttributesTitle = "Item Attributes";

export const ItemAttributesDescription = "Maintain reusable item attributes and values assigned to item records.";

export const ItemAttributesDrawerFormId = "item-attributes-drawer-form";

export const ItemAttributesPaginationStorageKey = "maintenance.item-attributes";

export const ItemAttributesFieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-not-allowed disabled:bg-offwhite/65";

export const ItemAttributesTableColumns = [
  { key: "name", label: "Attribute Name", className: "w-[18rem]" },
  { key: "values", label: "Values", className: "w-[28rem]" },
  { key: "status", label: "Status", className: "w-[7rem] text-center" },
  { label: "Action", className: "w-[9rem] text-center" },
] as const;

export const ItemAttributesTablePreferencesStorageKey = "gr8booksneo:item-attributes:table-preferences";
export const ItemAttributesTablePreferencesModuleKey = "maintenance:item-attributes";
export const ItemAttributesDefaultColumnOrder = ItemAttributesTableColumns.map((column) => ("key" in column ? column.key : "actions"));

export const ItemAttributesDefaultColumnVisibility: VisibilityState = {};

export const ItemAttributesDefaultSorting: SortingState = [{ id: "name", desc: false }];

export const ItemAttributesExportColumns: ModuleTableExportColumn<ItemAttributeRecord>[] = [
  ...ItemAttributesTableColumns.flatMap((column) =>
    "key" in column
      ? [
          {
            header: column.label,
            id: column.key,
            value: column.key === "values" ? (record: ItemAttributeRecord) => record.values.map((value) => value.label).join(", ") : column.key,
          },
        ]
      : [],
  ),
];
