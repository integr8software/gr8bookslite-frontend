"use client";

import { ChevronRight, Search } from "lucide-react";
import { ResponsibilityCenterTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/responsibility-center/ResponsibilityCenterConstants";
import { getResponsibilityCenterTableMinWidthClassName } from "@/app/src/data/modules/maintenance/responsibility-center/ResponsibilityCenterData";
import { formatDateTime } from "@/app/src/utils/date.util";
import type {
	FlattenedResponsibilityCenterTreeNode,
	ResponsibilityCenter,
	ResponsibilityCenterPermissions,
	ResponsibilityCenterTreeProps,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	CategoryBadge,
	FinancialTypeBadge,
} from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterTableRow";
import {
	getColumnMetaClassName,
	joinClasses,
} from "@/app/src/ui/shared/module/module-table/utils";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

export function ResponsibilityCenterTree({
	expandedIds,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	permissions,
	table,
	toolbar,
	onEditCenter,
	onToggleStatus,
	onToggleTreeNode,
	onViewCenter,
}: ResponsibilityCenterTreeProps) {
	const tableMinWidthClassName = getResponsibilityCenterTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<ModuleTable
			emptyDescription="Add a center to start grouping financial accountability."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No Responsibility Center Records Found"
			isLoading={isLoading}
			isSyncing={isRefreshing}
			lastSyncedAt={lastSyncedAt}
			minWidthClassName={`${tableMinWidthClassName} table-fixed`}
			paginationLabel="centers"
			paginationStorageKey={ResponsibilityCenterTablePaginationStorageKey}
			table={table}
			tableTitle="Responsibility centers"
			toolbar={toolbar}
			variant="embedded"
			renderRow={(row) => (
				<TreeRow
					key={row.id}
					expandedIds={expandedIds}
					node={row.original}
					permissions={permissions}
					visibleColumns={row.getVisibleCells().map((cell) => ({
						className: getColumnMetaClassName(cell.column.columnDef.meta),
						id: cell.column.id,
					}))}
					onEditCenter={onEditCenter}
					onToggleStatus={onToggleStatus}
					onToggleTreeNode={onToggleTreeNode}
					onViewCenter={onViewCenter}
				/>
			)}
		/>
	);
}

function TreeRow({
	expandedIds,
	node,
	permissions,
	visibleColumns,
	onEditCenter,
	onToggleStatus,
	onToggleTreeNode,
	onViewCenter,
}: {
	expandedIds: Set<string>;
	node: FlattenedResponsibilityCenterTreeNode;
	permissions: ResponsibilityCenterPermissions;
	visibleColumns: Array<{ className?: string; id: string }>;
	onEditCenter: (center: ResponsibilityCenter) => void;
	onToggleStatus: (center: ResponsibilityCenter) => void;
	onToggleTreeNode: (centerId: string) => void;
	onViewCenter: (center: ResponsibilityCenter) => void;
}) {
	return (
		<tr className="module-table-row text-darknavy">
			{visibleColumns.map((column) => (
				<td
					key={column.id}
					className={joinClasses(
						"align-middle text-sm text-darknavy",
						column.className ?? "text-left",
					)}
				>
					<TreeCell
						columnId={column.id}
						expandedIds={expandedIds}
						node={node}
						permissions={permissions}
						onEditCenter={onEditCenter}
						onToggleStatus={onToggleStatus}
						onToggleTreeNode={onToggleTreeNode}
						onViewCenter={onViewCenter}
					/>
				</td>
			))}
		</tr>
	);
}

function TreeCell({
	columnId,
	expandedIds,
	node,
	permissions,
	onEditCenter,
	onToggleStatus,
	onToggleTreeNode,
	onViewCenter,
}: {
	columnId: string;
	expandedIds: Set<string>;
	node: FlattenedResponsibilityCenterTreeNode;
	permissions: ResponsibilityCenterPermissions;
	onEditCenter: (center: ResponsibilityCenter) => void;
	onToggleStatus: (center: ResponsibilityCenter) => void;
	onToggleTreeNode: (centerId: string) => void;
	onViewCenter: (center: ResponsibilityCenter) => void;
}) {
	const { center, childrenCount, level } = node;
	const hasChildren = childrenCount > 0;
	const nextStatus = center.status === "Active" ? "Inactive" : "Active";
	const statusActionLabel =
		center.status === "Active" ? "Deactivate" : "Activate";

	switch (columnId) {
		case "code":
			return <span className="font-mono text-xs font-semibold">{center.code}</span>;
		case "name":
			return (
				<div className="flex min-w-0 items-center gap-1.5">
					{level > 0 ? (
						<span
							className="shrink-0"
							style={{ width: `${level * 1.35}rem` }}
							aria-hidden="true"
						/>
					) : null}
					{hasChildren ? (
						<button
							type="button"
							onClick={() => onToggleTreeNode(center.id)}
							aria-label={`Toggle ${center.name}`}
							className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-darknavy/55 transition hover:bg-white hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25"
						>
							<ChevronRight
								className={joinClasses(
									"h-4 w-4 transition",
									expandedIds.has(center.id) && "rotate-90",
								)}
								aria-hidden="true"
							/>
						</button>
					) : (
						<span className="h-7 w-7 shrink-0" aria-hidden="true" />
					)}
					<span className="truncate font-semibold text-darknavy">
						{center.name}
					</span>
				</div>
			);
		case "financialType":
			return <FinancialTypeBadge financialType={center.financialType} />;
		case "category":
			return <CategoryBadge category={center.category} />;
		case "manager":
			return <span className="truncate">{center.manager}</span>;
		case "description":
			return (
				<span className="block truncate text-darknavy/70" title={center.description}>
					{center.description ?? ""}
				</span>
			);
		case "status":
			return <ModuleStatusBadge status={center.status} />;
		case "createdBy":
			return <span>{center.createdBy ?? ""}</span>;
		case "createdAt":
			return (
				<span>
					{formatDateTime(center.createdAt, {
						emptyValue: "",
						invalidValue: "",
						locale: "en-US",
					})}
				</span>
			);
		case "updatedBy":
			return <span>{center.updatedBy ?? ""}</span>;
		case "updatedAt":
			return (
				<span>
					{formatDateTime(center.updatedAt, {
						emptyValue: "",
						invalidValue: "",
						locale: "en-US",
					})}
				</span>
			);
		case "actions":
			return (
				<ModuleTableActions className="w-full !justify-center">
					{permissions.canView ? (
						<ModuleTableActionButton
							variant="view"
							onClick={() => onViewCenter(center)}
							label={`View ${center.name}`}
						/>
					) : null}
					{permissions.canUpdate ? (
						<>
							<ModuleTableActionButton
								variant="edit"
								onClick={() => onEditCenter(center)}
								label={`Edit ${center.name}`}
							/>
							<ModuleTableActionButton
								variant={nextStatus === "Inactive" ? "inactive" : "active"}
								onClick={() => onToggleStatus(center)}
								label={`${statusActionLabel} ${center.name}`}
							/>
						</>
					) : null}
				</ModuleTableActions>
			);
		default:
			return null;
	}
}

