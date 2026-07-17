import type {
	UnitOfMeasurementPermissions,
	UnitOfMeasurementQuantityMode,
	UnitOfMeasurementRecord,
	UnitOfMeasurementStatus,
	UnitOfMeasurementTableRowProps,
} from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";
import { formatDateTime } from "@/app/src/utils/date.util";

export function UnitOfMeasurementTableRow({
	onEdit,
	permissions,
	onToggleStatus,
	onView,
	row,
}: UnitOfMeasurementTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<UnitOfMeasurementTableCell
					key={cell.id}
					className={getColumnMetaClassName(cell.column.columnDef.meta)}
				>
					<UnitOfMeasurementCellContent
						columnId={cell.column.id}
						record={row.original}
						permissions={permissions}
						onEdit={onEdit}
						onToggleStatus={onToggleStatus}
						onView={onView}
					/>
				</UnitOfMeasurementTableCell>
			))}
		</tr>
	);
}

function UnitOfMeasurementCellContent({
	columnId,
	record,
	onEdit,
	permissions,
	onToggleStatus,
	onView,
}: {
	columnId: string;
	record: UnitOfMeasurementRecord;
	permissions: UnitOfMeasurementPermissions;
	onEdit: (record: UnitOfMeasurementRecord) => void;
	onToggleStatus: (record: UnitOfMeasurementRecord) => void;
	onView: (record: UnitOfMeasurementRecord) => void;
}) {
	const nextStatus = record.status === "Active" ? "Inactive" : "Active";
	const statusActionLabel =
		record.status === "Active" ? "Deactivate" : "Activate";

	switch (columnId) {
		case "name":
			return <span className="font-medium text-darknavy">{record.name}</span>;
		case "symbol":
			return <span className="font-semibold text-darknavy">{record.symbol}</span>;
		case "quantityMode":
			return (
				<span className="block text-center text-darknavy/70">
					{formatQuantityMode(record.quantityMode)}
				</span>
			);
		case "status":
			return (
				<span className="flex justify-center">
					<ModuleStatusBadge<UnitOfMeasurementStatus> status={record.status} />
				</span>
			);
		case "createdBy":
			return <span>{record.createdBy ?? ""}</span>;
		case "createdAt":
			return (
				<span>
					{formatDateTime(record.createdAt, {
						emptyValue: "",
						locale: "en-US",
					})}
				</span>
			);
		case "updatedBy":
			return <span>{record.updatedBy ?? ""}</span>;
		case "updatedAt":
			return (
				<span>
					{formatDateTime(record.updatedAt, {
						emptyValue: "",
						locale: "en-US",
					})}
				</span>
			);
		case "actions":
			return (
				<ModuleTableActions
					data-spotlight-id="maintenance-record-actions"
					className="w-full !justify-center"
				>
					<ModuleTableActionButton
						variant="view"
						label={`View ${record.name}`}
						data-spotlight-id="maintenance-record-view"
						onClick={() => onView(record)}
					/>
					{permissions.canUpdate ? (
						<>
							<ModuleTableActionButton
								variant="edit"
								label={`Edit ${record.name}`}
								data-spotlight-id="maintenance-record-edit"
								onClick={() => onEdit(record)}
							/>
							<ModuleTableActionButton
								variant={nextStatus === "Inactive" ? "inactive" : "active"}
								label={`${statusActionLabel} ${record.name}`}
								data-spotlight-id="maintenance-record-status"
								onClick={() => onToggleStatus(record)}
							/>
						</>
					) : null}
				</ModuleTableActions>
			);
		default:
			return null;
	}
}

function UnitOfMeasurementTableCell({
	className = "text-left",
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>
			{children}
		</td>
	);
}

function formatQuantityMode(mode: UnitOfMeasurementQuantityMode) {
	return mode === "Integer" ? "Whole number" : "Decimal";
}
