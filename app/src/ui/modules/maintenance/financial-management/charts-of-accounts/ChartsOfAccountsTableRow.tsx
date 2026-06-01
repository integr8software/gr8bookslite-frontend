"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { ChevronRight, GripVertical } from "lucide-react";
import type { CSSProperties } from "react";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import {
	Badge,
	TypeBadge,
	joinClasses,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ChartsOfAccountsTableRowProps = {
	account: ChartAccount;
	activeDragAccount?: {
		id: string;
		isSpecific: boolean;
		parentId: string | null;
	};
	expandedIds: Set<string>;
	level: number;
	onDelete: (account: ChartAccount) => void;
	onEdit: (account: ChartAccount) => void;
	onToggleExpanded: (accountId: string) => void;
};

export function ChartsOfAccountsTableRow({
	account,
	activeDragAccount,
	expandedIds,
	level,
	onDelete,
	onEdit,
	onToggleExpanded,
}: ChartsOfAccountsTableRowProps) {
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef: setDraggableNodeRef,
		transform,
	} = useDraggable({ id: account.id });
	const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
		id: account.id,
	});
	const targetIsSpecific = isSpecificAccountNumber(account.accountNumber);
	const canDropOnAccount = getCanDropOnAccount({
		activeDragAccount,
		targetAccount: account,
		targetIsSpecific,
	});
	const rowStyle: CSSProperties = {
		transform: CSS.Translate.toString(transform),
	};

	function setRowNodeRef(node: HTMLTableRowElement | null) {
		setDraggableNodeRef(node);
		setDroppableNodeRef(node);
	}

	return (
		<motion.tr
			ref={setRowNodeRef}
			style={rowStyle}
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.18 }}
			className={joinClasses(
				"module-table-row group text-darknavy",
				isDragging && "relative z-10 bg-skyblue/5 opacity-70 shadow-sm",
				isOver &&
					canDropOnAccount &&
					!isDragging &&
					"bg-skyblue/10 ring-1 ring-inset ring-skyblue/25",
			)}
		>
			<td className="px-5 py-4 font-semibold text-darknavy">
				{account.accountNumber}
			</td>
			<td className="px-5 py-4">
				<AccountNameCell
					account={account}
					expandedIds={expandedIds}
					dragAttributes={attributes}
					dragListeners={listeners}
					level={level}
					onToggleExpanded={onToggleExpanded}
				/>
			</td>
			<td className="px-5 py-4">
				<TypeBadge type={account.accountType} />
			</td>
			<td className="px-5 py-4 text-darknavy">
				{account.statementSection}
			</td>
			<td className="px-5 py-4">
				<Badge
					variant={
						account.normalBalance === "Debit" ? "blue" : "violet"
					}
				>
					{account.normalBalance}
				</Badge>
			</td>
			<td className="px-5 py-4">
				<Badge variant={account.status === "Active" ? "green" : "gray"}>
					{account.status}
				</Badge>
			</td>
			<td className="charts-account-actions-cell sticky right-0 px-5 py-4 text-right">
				<RowActions
					account={account}
					onDelete={onDelete}
					onEdit={onEdit}
				/>
			</td>
		</motion.tr>
	);
}

function AccountNameCell({
	account,
	expandedIds,
	dragAttributes,
	dragListeners,
	level,
	onToggleExpanded,
}: {
	account: ChartAccount;
	expandedIds: Set<string>;
	dragAttributes: ReturnType<typeof useDraggable>["attributes"];
	dragListeners: ReturnType<typeof useDraggable>["listeners"];
	level: number;
	onToggleExpanded: (accountId: string) => void;
}) {
	return (
		<div className="flex items-center gap-2">
			{level > 0 ? (
				<div className="flex self-stretch" aria-hidden="true">
					{Array.from({ length: level }).map((_, index) => {
						const isCurrentLevel = index === level - 1;

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
				aria-label={`Drag ${account.accountName}`}
				className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-darknavy/40 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/30"
				{...dragAttributes}
				{...dragListeners}
			>
				<GripVertical className="h-4 w-4" aria-hidden="true" />
			</button>
			<button
				type="button"
				disabled={!account.children?.length}
				onClick={() => onToggleExpanded(account.id)}
				aria-label={`Toggle ${account.accountName}`}
				className={joinClasses(
					"flex h-7 w-7 items-center justify-center rounded-md transition",
					account.children?.length
						? "text-darknavy/50 hover:bg-white hover:text-skyblue"
						: "text-transparent",
				)}
			>
				<ChevronRight
					className={joinClasses(
						"h-4 w-4 transition",
						expandedIds.has(account.id) && "rotate-90",
					)}
					aria-hidden="true"
				/>
			</button>
			<div className="min-w-0">
				<p className="truncate font-semibold text-darknavy">
					{account.accountName}
				</p>
				<p className="truncate text-sm text-darknavy/60">
					{account.description || "No description"}
				</p>
			</div>
		</div>
	);
}

function getCanDropOnAccount({
	activeDragAccount,
	targetAccount,
	targetIsSpecific,
}: {
	activeDragAccount?: {
		id: string;
		isSpecific: boolean;
		parentId: string | null;
	};
	targetAccount: ChartAccount;
	targetIsSpecific: boolean;
}) {
	if (!activeDragAccount || activeDragAccount.id === targetAccount.id) {
		return false;
	}

	if (activeDragAccount.isSpecific) {
		return true;
	}

	return (
		!targetIsSpecific &&
		activeDragAccount.parentId === targetAccount.parentId
	);
}

function isSpecificAccountNumber(accountNumber: string) {
	return !accountNumber.endsWith("000");
}

function RowActions({
	account,
	onDelete,
	onEdit,
}: {
	account: ChartAccount;
	onDelete: (account: ChartAccount) => void;
	onEdit: (account: ChartAccount) => void;
}) {
	return (
		<ModuleTableActions>
			<ModuleTableActionButton
				variant="edit"
				label={`Edit ${account.accountName}`}
				onClick={() => onEdit(account)}
			/>
			<ModuleTableActionButton
				variant="delete"
				label={`Delete ${account.accountName}`}
				onClick={() => onDelete(account)}
			/>
		</ModuleTableActions>
	);
}
