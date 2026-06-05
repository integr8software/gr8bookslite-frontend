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
	onEditRecord: (kind: ItemSetupTableRowData["recordKind"], record: ItemSetupRecord) => void;
};

export function ItemSetupTableRow({
	expandedIds,
	onDeleteRecord,
	onToggleExpanded,
	onEditRecord,
	row,
}: ItemSetupTableRowProps) {
	const { record } = row;

	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{record.code}</td>
			<td className="px-4 py-4">
				<div className="flex items-center gap-2">
					{row.level > 0 ? (
						<div className="flex self-stretch" aria-hidden="true">
							{Array.from({ length: row.level }).map((_, index) => {
								const isCurrentLevel = index === row.level - 1;

								return (
									<span
										key={index}
										className="relative block w-7 shrink-0"
									>
										<span className="absolute bottom-[-1rem] left-1/2 top-[-1rem] border-l border-dashed border-slate-300" />
										{isCurrentLevel ? (
											<>
												<span className="absolute left-1/2 top-1/2 h-px w-5 border-t border-dashed border-slate-300" />
												<span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-300" />
											</>
										) : null}
									</span>
								);
							})}
						</div>
					) : null}
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
						onEditRecord={() => onEditRecord(row.recordKind, record)}
					/>
				)}
			</td>
		</tr>
	);
}
