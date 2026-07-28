import type { Row } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import {
  ModuleTableActionButton,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

type WarehouseStorageTableRowProps = {
  row: Row<WarehouseModuleRecord>;
  onDeleteRecord: (record: WarehouseModuleRecord) => void;
  onEditRecord: (record: WarehouseModuleRecord) => void;
  onSelectRecord: (record: WarehouseModuleRecord) => void;
  onViewRecord: (record: WarehouseModuleRecord) => void;
};

export function WarehouseStorageTableRow({
  row,
  onDeleteRecord,
  onEditRecord,
  onSelectRecord,
  onViewRecord,
}: WarehouseStorageTableRowProps) {
  return (
    <tr className="module-table-row cursor-pointer" onClick={() => onSelectRecord(row.original)}>
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={`px-4 py-3 align-middle text-sm text-darknavy ${getColumnMetaClassName(cell.column.columnDef.meta)}`}
        >
          <WarehouseStorageCellContent
            columnId={cell.column.id}
            record={row.original}
            value={String(cell.getValue() ?? "")}
            onDeleteRecord={onDeleteRecord}
            onEditRecord={onEditRecord}
            onViewRecord={onViewRecord}
          />
        </td>
      ))}
    </tr>
  );
}

function WarehouseStorageCellContent({
  columnId,
  onDeleteRecord,
  onEditRecord,
  onViewRecord,
  record,
  value,
}: {
  columnId: string;
  record: WarehouseModuleRecord;
  value: string;
  onDeleteRecord: (record: WarehouseModuleRecord) => void;
  onEditRecord: (record: WarehouseModuleRecord) => void;
  onViewRecord: (record: WarehouseModuleRecord) => void;
}) {
  if (columnId === "actions") {
    return (
      <ModuleTableActions
        className="w-full justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <ModuleTableActionButton
          variant="view"
          label="View warehouse storage"
          onClick={() => onViewRecord(record)}
        />
        <ModuleTableActionButton
          variant="edit"
          label="Edit warehouse storage"
          onClick={() => onEditRecord(record)}
        />
        <ModuleTableActionButton
          icon={Trash2}
          variant="delete"
          label="Remove warehouse storage"
          onClick={() => onDeleteRecord(record)}
        />
      </ModuleTableActions>
    );
  }

  if (columnId === "status") {
    return <ModuleStatusBadge status={record.status} />;
  }

  if (columnId === "storageCode") {
    return <span className="font-semibold text-skyblue">{value || "-"}</span>;
  }

  return value || "-";
}
