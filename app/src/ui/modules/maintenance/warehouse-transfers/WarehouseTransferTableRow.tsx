import type { Row } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { WarehouseTransfersHref } from "@/app/src/constants/modules/maintenance/warehouse-transfers/WarehouseTransferConstants";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

type WarehouseTransferTableRowProps = {
	row: Row<WarehouseModuleRecord>;
	onDeleteRecord: (record: WarehouseModuleRecord) => void;
};

export function WarehouseTransferTableRow({
	row,
	onDeleteRecord,
}: WarehouseTransferTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<td
					key={cell.id}
					className={`px-4 py-4 align-middle text-sm text-darknavy ${getColumnMetaClassName(cell.column.columnDef.meta)}`}
				>
					<WarehouseTransferCellContent
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

function WarehouseTransferCellContent({
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
					href={`${WarehouseTransfersHref}/view/${record.id}`}
					label="View warehouse transfer"
				/>
				<ModuleTableActionLink
					variant="edit"
					href={`${WarehouseTransfersHref}/edit/${record.id}`}
					label="Edit warehouse transfer"
				/>
				<ModuleTableActionButton
					icon={Trash2}
					variant="delete"
					label="Remove warehouse transfer"
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
