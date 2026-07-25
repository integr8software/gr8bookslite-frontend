import type { Row } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { WarehouseAccessHref } from "@/app/src/constants/modules/warehouse-management/warehouse-access/WarehouseAccessConstants";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

type WarehouseAccessTableRowProps = {
	row: Row<WarehouseModuleRecord>;
	onDeleteRecord: (record: WarehouseModuleRecord) => void;
};

export function WarehouseAccessTableRow({
	row,
	onDeleteRecord,
}: WarehouseAccessTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<td
					key={cell.id}
					className={`px-4 py-4 align-middle text-sm text-darknavy ${getColumnMetaClassName(cell.column.columnDef.meta)}`}
				>
					<WarehouseAccessCellContent
						columnId={cell.column.id}
						record={row.original}
						value={String(cell.getValue() ?? "")}
						onDeleteRecord={onDeleteRecord}
					/>
				</td>
			))}
		</tr>
	);
}

function WarehouseAccessCellContent({
	columnId,
	onDeleteRecord,
	record,
	value,
}: {
	columnId: string;
	record: WarehouseModuleRecord;
	value: string;
	onDeleteRecord: (record: WarehouseModuleRecord) => void;
}) {
	if (columnId === "actions") {
		return (
			<ModuleTableActions className="w-full justify-center">
				<ModuleTableActionLink
					variant="view"
					href={`${WarehouseAccessHref}/view/${record.id}`}
					label="View warehouse access"
				/>
				<ModuleTableActionLink
					variant="edit"
					href={`${WarehouseAccessHref}/edit/${record.id}`}
					label="Edit warehouse access"
				/>
				<ModuleTableActionButton
					icon={Trash2}
					variant="delete"
					label="Remove warehouse access"
					onClick={() => onDeleteRecord(record)}
				/>
			</ModuleTableActions>
		);
	}

	if (columnId === "status") {
		return <ModuleStatusBadge status={record.status} />;
	}

	return value || "-";
}
