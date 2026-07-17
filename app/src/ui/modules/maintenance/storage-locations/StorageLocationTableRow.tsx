import type { Row } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { StorageLocationsHref } from "@/app/src/constants/modules/maintenance/storage-locations/StorageLocationConstants";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

type StorageLocationTableRowProps = {
	row: Row<WarehouseModuleRecord>;
	onDeleteRecord: (record: WarehouseModuleRecord) => void;
};

export function StorageLocationTableRow({
	row,
	onDeleteRecord,
}: StorageLocationTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<td
					key={cell.id}
					className={`px-4 py-4 align-middle text-sm text-darknavy ${getColumnMetaClassName(cell.column.columnDef.meta)}`}
				>
					<StorageLocationCellContent
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

function StorageLocationCellContent({
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
					href={`${StorageLocationsHref}/view/${record.id}`}
					label="View storage location"
				/>
				<ModuleTableActionLink
					variant="edit"
					href={`${StorageLocationsHref}/edit/${record.id}`}
					label="Edit storage location"
				/>
				<ModuleTableActionButton
					icon={Trash2}
					variant="delete"
					label="Remove storage location"
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
