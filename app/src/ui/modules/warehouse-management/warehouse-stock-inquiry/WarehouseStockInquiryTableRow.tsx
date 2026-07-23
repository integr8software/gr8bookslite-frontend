import type { Row } from "@tanstack/react-table";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

type WarehouseStockInquiryTableRowProps = {
	row: Row<WarehouseModuleRecord>;
};

export function WarehouseStockInquiryTableRow({
	row,
}: WarehouseStockInquiryTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<td
					key={cell.id}
					className={`px-4 py-4 align-middle text-sm text-darknavy ${getColumnMetaClassName(cell.column.columnDef.meta)}`}
				>
					<WarehouseStockInquiryCellContent
						columnId={cell.column.id}
						record={row.original}
						value={String(cell.getValue() ?? "")}
					/>
				</td>
			))}
		</tr>
	);
}

function WarehouseStockInquiryCellContent({
	columnId,
	record,
	value,
}: {
	columnId: string;
	record: WarehouseModuleRecord;
	value: string;
}) {
	if (columnId === "actions") {
		return <span className="text-xs font-semibold text-darknavy/40">Read only</span>;
	}

	if (columnId === "status") {
		return <ModuleStatusBadge status={record.status} />;
	}

	return value || "-";
}
