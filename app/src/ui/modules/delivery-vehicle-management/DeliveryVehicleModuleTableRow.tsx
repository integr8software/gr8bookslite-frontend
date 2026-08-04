import type { Row } from "@tanstack/react-table";
import type {
  DeliveryVehicleField,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { formatDateTime } from "@/app/src/utils/date.util";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import {
  ModuleTableActionButton,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

type DeliveryVehicleModuleTableRowProps = {
  allowStatusAction: boolean;
  allowWorkflowAction: boolean;
  fields: readonly DeliveryVehicleField[];
  row: Row<DeliveryVehicleModuleRecord>;
  onAdvanceRecord: (record: DeliveryVehicleModuleRecord) => void;
  onEditRecord: (record: DeliveryVehicleModuleRecord) => void;
  onToggleStatus: (record: DeliveryVehicleModuleRecord) => void;
  onViewRecord: (record: DeliveryVehicleModuleRecord) => void;
};

export function DeliveryVehicleModuleTableRow({
  allowStatusAction,
  allowWorkflowAction,
  fields,
  row,
  onAdvanceRecord,
  onEditRecord,
  onToggleStatus,
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
            allowStatusAction={allowStatusAction}
            allowWorkflowAction={allowWorkflowAction}
            columnId={cell.column.id}
            fields={fields}
            record={row.original}
            onAdvanceRecord={onAdvanceRecord}
            onEditRecord={onEditRecord}
            onToggleStatus={onToggleStatus}
            onViewRecord={onViewRecord}
          />
        </td>
      ))}
    </tr>
  );
}

function DeliveryVehicleModuleCellContent({
  allowStatusAction,
  allowWorkflowAction,
  columnId,
  fields,
  record,
  onAdvanceRecord,
  onEditRecord,
  onToggleStatus,
  onViewRecord,
}: {
  allowStatusAction: boolean;
  allowWorkflowAction: boolean;
  columnId: string;
  fields: readonly DeliveryVehicleField[];
  record: DeliveryVehicleModuleRecord;
  onAdvanceRecord: (record: DeliveryVehicleModuleRecord) => void;
  onEditRecord: (record: DeliveryVehicleModuleRecord) => void;
  onToggleStatus: (record: DeliveryVehicleModuleRecord) => void;
  onViewRecord: (record: DeliveryVehicleModuleRecord) => void;
}) {
  const nextStatus = record.status === "Active" ? "Inactive" : "Active";
  const statusActionLabel = record.status === "Active" ? "Disable" : "Enable";

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
        {allowStatusAction ? (
          <ModuleTableActionButton
            variant={nextStatus === "Inactive" ? "inactive" : "active"}
            onClick={() => onToggleStatus(record)}
            label={`${statusActionLabel} ${record.name}`}
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

  const fieldValue = formatFieldValue(record, columnId, fields);

  return (
    <span className="block truncate text-darknavy/75" title={fieldValue}>
      {fieldValue}
    </span>
  );
}

function formatFieldValue(
  record: DeliveryVehicleModuleRecord,
  fieldKey: string,
  fields: readonly DeliveryVehicleField[],
) {
  const value = record.fields[fieldKey] ?? "";
  const suffix = fields.find((field) => field.key === fieldKey)?.unitSuffix;

  if (!value || !suffix) {
    return value;
  }

  return `${value} ${suffix}`;
}
