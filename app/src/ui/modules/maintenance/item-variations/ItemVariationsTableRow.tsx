import type { Row } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { ItemVariationRecord } from "@/app/src/types/modules/maintenance/item-variations/ItemVariationsTypes";
import { ModuleTableActionButton, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

const MaxVisibleVariationValues = 6;

type ItemVariationsTableRowProps = {
  row: Row<ItemVariationRecord>;
  onEdit: (record: ItemVariationRecord) => void;
  onToggleStatus: (record: ItemVariationRecord) => void;
  onView: (record: ItemVariationRecord) => void;
};

export function ItemVariationsTableRow({ row, onEdit, onToggleStatus, onView }: ItemVariationsTableRowProps) {
  const record = row.original;

  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <ItemVariationsTableCell key={cell.id} className={getColumnMetaClassName(cell.column.columnDef.meta)}>
          <ItemVariationsCellContent columnId={cell.column.id} record={record} onEdit={onEdit} onToggleStatus={onToggleStatus} onView={onView} />
        </ItemVariationsTableCell>
      ))}
    </tr>
  );
}

function ItemVariationsCellContent({
  columnId,
  record,
  onEdit,
  onToggleStatus,
  onView,
}: {
  columnId: string;
  record: ItemVariationRecord;
  onEdit: (record: ItemVariationRecord) => void;
  onToggleStatus: (record: ItemVariationRecord) => void;
  onView: (record: ItemVariationRecord) => void;
}) {
  switch (columnId) {
    case "name":
      return <span className="font-semibold">{record.name}</span>;
    case "values":
      const visibleValues = record.values.slice(0, MaxVisibleVariationValues);
      const hiddenValueCount = record.values.length - visibleValues.length;

      return (
        <div className="flex flex-nowrap gap-1.5 overflow-hidden" title={record.values.map((value) => value.label).join(", ")}>
          {record.values.length > 0 ? (
            <>
              {visibleValues.map((value) => (
                <span
                  key={value.id}
                  className={`inline-flex max-w-[12rem] shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${
                    value.status === "Active" ? "bg-skyblue/10 text-darknavy" : "bg-darknavy/5 text-darknavy/45 line-through"
                  }`}
                >
                  <span className="truncate">{value.label}</span>
                </span>
              ))}
              {hiddenValueCount > 0 ? (
                <span className="inline-flex shrink-0 rounded-md bg-darknavy/5 px-2.5 py-1 text-xs font-semibold text-darknavy/65">
                  + {hiddenValueCount} more
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-sm text-darknavy/45">No values added</span>
          )}
        </div>
      );
    case "status":
      return <ModuleStatusBadge status={record.status} />;
    case "actions":
      return (
        <ModuleTableActions className="w-full !justify-center">
          <ModuleTableActionButton variant="view" label={`View ${record.name}`} onClick={() => onView(record)} />
          <ModuleTableActionButton variant="edit" label={`Edit ${record.name}`} onClick={() => onEdit(record)} />
          <ModuleTableActionButton
            variant={record.status === "Active" ? "inactive" : "active"}
            label={record.status === "Active" ? `Set ${record.name} inactive` : `Set ${record.name} active`}
            onClick={() => onToggleStatus(record)}
          />
        </ModuleTableActions>
      );
    default:
      return null;
  }
}

function ItemVariationsTableCell({ className = "text-left", children }: { className?: string; children: ReactNode }) {
  return <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>{children}</td>;
}
