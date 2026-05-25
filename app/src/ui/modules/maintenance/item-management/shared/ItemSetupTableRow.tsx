import { ChevronRight } from "lucide-react";
import type {
	ItemSetupRecord,
	ItemSetupTableRowData,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { ItemSetupRecordActions } from "@/app/src/ui/modules/maintenance/item-management/shared/ItemSetupRecordActions";

type ItemSetupTableRowProps = {
	expandedIds: Set<string>;
	row: ItemSetupTableRowData;
	onDeleteRecord: (record: {
		kind: ItemSetupTableRowData["recordKind"];
		record: ItemSetupRecord;
	}) => void;
	onToggleExpanded: (recordId: string) => void;
};

export function ItemSetupTableRow({
	expandedIds,
	onDeleteRecord,
	onToggleExpanded,
	row,
}: ItemSetupTableRowProps) {
	const { record } = row;

	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{record.code}</td>
			<td className="px-4 py-4">
				<div
					className="flex items-center gap-2"
					style={{ paddingLeft: `${row.level * 1.25}rem` }}
				>
					<button
						type="button"
						disabled={!row.hasChildren}
						onClick={() => onToggleExpanded(record.id)}
						aria-label={`Toggle ${record.name}`}
						className={joinClasses(
							"flex h-7 w-7 items-center justify-center rounded-md transition",
							row.hasChildren
								? "text-darknavy/50 hover:bg-white hover:text-skyblue"
								: "text-transparent",
						)}
					>
						<ChevronRight
							className={joinClasses(
								"h-4 w-4 transition",
								expandedIds.has(record.id) && "rotate-90",
							)}
							aria-hidden="true"
						/>
					</button>
					<div className="min-w-0">
						<div className="font-medium">{record.name}</div>
						<div className="truncate text-xs text-darknavy/55">
							{record.description}
						</div>
					</div>
				</div>
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-citron/35 px-3 py-1 text-xs font-semibold text-darknavy">
					{row.recordKindLabel}
				</span>
			</td>
			<td className="px-4 py-4 text-sm text-darknavy/65">
				{row.appliesToLabel}
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{record.status}
				</span>
			</td>
			<td className="px-4 py-4">
				{row.isVirtual ? null : (
					<ItemSetupRecordActions
						kind={row.recordKind}
						record={record}
						onDeleteRecord={() =>
							onDeleteRecord({ kind: row.recordKind, record })
						}
					/>
				)}
			</td>
		</tr>
	);
}
