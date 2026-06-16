import { ChevronRight } from "lucide-react";
import type { ItemCategoryClassificationTableRowData } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ItemCategoryClassificationTableRowProps = {
	expandedIds: Set<string>;
	row: ItemCategoryClassificationTableRowData;
	onEditRecord: (row: ItemCategoryClassificationTableRowData) => void;
	onStatusChange: (row: ItemCategoryClassificationTableRowData) => void;
	onToggleExpanded: (recordId: string) => void;
	onViewRecord: (row: ItemCategoryClassificationTableRowData) => void;
};

const AccountingBadgeClassNames = {
	Configured: "bg-emerald-50 text-emerald-700 ring-emerald-200",
	Inherited: "bg-skyblue/12 text-darknavy ring-skyblue/25",
	Override: "bg-citron/35 text-darknavy ring-citron/60",
	"Not Set": "bg-slate-100 text-slate-600 ring-slate-200",
} as const;

export function ItemCategoryClassificationTableRow({
	expandedIds,
	onEditRecord,
	onStatusChange,
	onToggleExpanded,
	onViewRecord,
	row,
}: ItemCategoryClassificationTableRowProps) {
	const { record } = row;
	const isStatusLockedByParent =
		row.hasInactiveAncestor && record.status === "Inactive";

	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4">
				<div className="flex items-center gap-2">
					{row.level > 0 ? (
						<div className="flex self-stretch" aria-hidden="true">
							{Array.from({ length: row.level }).map((_, index) => {
								const isCurrentLevel = index === row.level - 1;

								return (
									<span key={index} className="relative block w-7 shrink-0">
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
						<div className="font-medium">
							{record.name}
						</div>
						<div className="mt-1 truncate text-xs text-darknavy/55">
							{record.description}
						</div>
						{row.usedByItemCount > 0 ? (
							<div className="mt-1 text-xs font-medium text-darknavy/55">
								Used by {row.usedByItemCount} item
								{row.usedByItemCount === 1 ? "" : "s"}
							</div>
						) : null}
					</div>
				</div>
			</td>
			<td className="px-4 py-4 text-sm text-darknavy/65">
				{row.parentName}
			</td>
			<td className="px-4 py-4">
				<div className="grid gap-1">
					<span
						className={joinClasses(
							"inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1",
							AccountingBadgeClassNames[row.accountingSetupStatus],
						)}
					>
						{row.accountingSetupStatus}
					</span>
					{row.accountingSetupStatus === "Inherited" &&
					row.inheritedAccountingSourceName ? (
						<span className="text-xs text-darknavy/50">
							From {row.inheritedAccountingSourceName}
						</span>
					) : null}
				</div>
			</td>
			<td className="px-4 py-4">
				<span
					className={joinClasses(
						"inline-flex rounded-full px-3 py-1 text-xs font-semibold",
						record.status === "Active"
							? "bg-emerald-50 text-emerald-700"
							: "bg-amber-50 text-amber-700",
					)}
				>
					{record.status}
				</span>
			</td>
			<td className="px-4 py-4 text-center">
				{row.isVirtual ? null : (
					<ModuleTableActions className="justify-center">
						<ModuleTableActionButton
							variant="view"
							onClick={() => onViewRecord(row)}
							label={`View ${record.name}`}
						/>
						<ModuleTableActionButton
							variant="edit"
							onClick={() => onEditRecord(row)}
							label={`Edit ${record.name}`}
						/>
						<ModuleTableActionButton
							variant={record.status === "Active" ? "inactive" : "active"}
							disabled={isStatusLockedByParent}
							onClick={() => onStatusChange(row)}
							label={
								isStatusLockedByParent
									? `Reactivate a parent category before reactivating ${record.name}`
									: record.status === "Active"
									? `Set ${record.name} inactive`
									: `Reactivate ${record.name}`
							}
							title={
								isStatusLockedByParent
									? "Reactivate the parent category first."
									: undefined
							}
						/>
					</ModuleTableActions>
				)}
			</td>
		</tr>
	);
}
