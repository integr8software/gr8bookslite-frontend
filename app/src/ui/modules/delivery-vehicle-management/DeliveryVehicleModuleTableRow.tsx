import type { Row } from "@tanstack/react-table";
import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { formatDateTime } from "@/app/src/utils/date.util";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import {
  ModuleTableActionButton,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

type DeliveryVehicleModuleTableRowProps = {
  allowWorkflowAction: boolean;
  row: Row<DeliveryVehicleModuleRecord>;
  onAdvanceRecord: (record: DeliveryVehicleModuleRecord) => void;
  onEditRecord: (record: DeliveryVehicleModuleRecord) => void;
  onViewRecord: (record: DeliveryVehicleModuleRecord) => void;
};

export function DeliveryVehicleModuleTableRow({
  allowWorkflowAction,
  row,
  onAdvanceRecord,
  onEditRecord,
  onViewRecord,
}: DeliveryVehicleModuleTableRowProps) {
  return (
    <tr className="module-table-row">
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={`px-4 py-4 align-middle text-sm text-darknavy ${getColumnMetaClassName(cell.column.columnDef.meta)}`}
        >
          <DeliveryVehicleModuleCellContent
            allowWorkflowAction={allowWorkflowAction}
            columnId={cell.column.id}
            record={row.original}
            onAdvanceRecord={onAdvanceRecord}
            onEditRecord={onEditRecord}
            onViewRecord={onViewRecord}
          />
        </td>
      ))}
    </tr>
  );
}

function DeliveryVehicleModuleCellContent({
  allowWorkflowAction,
  columnId,
  record,
  onAdvanceRecord,
  onEditRecord,
  onViewRecord,
}: {
  allowWorkflowAction: boolean;
  columnId: string;
  record: DeliveryVehicleModuleRecord;
  onAdvanceRecord: (record: DeliveryVehicleModuleRecord) => void;
  onEditRecord: (record: DeliveryVehicleModuleRecord) => void;
  onViewRecord: (record: DeliveryVehicleModuleRecord) => void;
}) {
  if (columnId === "actions") {
    return (
      <ModuleTableActions className="w-full !justify-center">
        <ModuleTableActionButton
          variant="view"
          onClick={() => onViewRecord(record)}
          label={`View ${record.name}`}
        />
        <ModuleTableActionButton
          variant="edit"
          onClick={() => onEditRecord(record)}
          label={`Edit ${record.name}`}
        />
        {allowWorkflowAction ? (
          <ModuleTableActionButton
            variant="active"
            onClick={() => onAdvanceRecord(record)}
            label={`Advance ${record.name}`}
          />
        ) : null}
      </ModuleTableActions>
    );
  }

  if (columnId === "code") {
    return <span className="font-semibold text-darknavy">{record.code}</span>;
  }

  if (columnId === "name") {
    return <span className="font-medium text-darknavy">{record.name}</span>;
  }

  if (columnId === "status") {
    return <ModuleStatusBadge status={record.status} />;
  }

  if (columnId === "createdBy") {
    return <span>{record.createdBy}</span>;
  }

  if (columnId === "createdAt") {
    return <span>{formatDateTime(record.createdAt, { emptyValue: "", locale: "en-US" })}</span>;
  }

  if (columnId === "updatedBy") {
    return <span>{record.updatedBy ?? ""}</span>;
  }

  if (columnId === "updatedAt") {
    return <span>{formatDateTime(record.updatedAt, { emptyValue: "", locale: "en-US" })}</span>;
  }

  return (
    <span className="block truncate text-darknavy/75" title={record.fields[columnId] ?? ""}>
      {record.fields[columnId] ?? ""}
    </span>
  );
}
