"use client";

import { motion } from "framer-motion";
import { ChevronRight, Edit3, Trash2 } from "lucide-react";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import {
	Badge,
	Button,
	TypeBadge,
	joinClasses,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls";

type ChartsOfAccountsTableRowProps = {
	account: ChartAccount;
	expandedIds: Set<string>;
	level: number;
	onDelete: (account: ChartAccount) => void;
	onEdit: (account: ChartAccount) => void;
	onToggleExpanded: (accountId: string) => void;
};

export function ChartsOfAccountsTableRow({
	account,
	expandedIds,
	level,
	onDelete,
	onEdit,
	onToggleExpanded,
}: ChartsOfAccountsTableRowProps) {
	return (
		<motion.tr
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.18 }}
			className="module-table-row group text-darknavy"
		>
			<td className="px-4 py-3 text-sm font-semibold text-darknavy/75">
				{account.accountNumber}
			</td>
			<td className="px-4 py-3">
				<AccountNameCell
					account={account}
					expandedIds={expandedIds}
					level={level}
					onToggleExpanded={onToggleExpanded}
				/>
			</td>
			<td className="px-4 py-3">
				<TypeBadge type={account.accountType} />
			</td>
			<td className="px-4 py-3 text-sm text-darknavy/60">
				{account.statementSection}
			</td>
			<td className="px-4 py-3">
				<Badge
					variant={
						account.normalBalance === "Debit" ? "blue" : "violet"
					}
				>
					{account.normalBalance}
				</Badge>
			</td>
			<td className="px-4 py-3">
				<Badge variant={account.status === "Active" ? "green" : "gray"}>
					{account.status}
				</Badge>
			</td>
			<td className="charts-account-actions-cell sticky right-0 px-4 py-3 text-right">
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
	level,
	onToggleExpanded,
}: {
	account: ChartAccount;
	expandedIds: Set<string>;
	level: number;
	onToggleExpanded: (accountId: string) => void;
}) {
	return (
		<div
			className="flex items-center gap-2"
			style={{ paddingLeft: `${level * 1.25}rem` }}
		>
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
				<p className="truncate text-sm font-semibold text-darknavy">
					{account.accountName}
				</p>
				<p className="truncate text-xs text-darknavy/55">
					{account.description || "No description"}
				</p>
			</div>
		</div>
	);
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
		<div className="flex justify-end gap-1">
			<Button
				size="icon"
				variant="ghost"
				aria-label={`Edit ${account.accountName}`}
				onClick={() => onEdit(account)}
			>
				<Edit3 className="h-4 w-4" aria-hidden="true" />
			</Button>
			<Button
				size="icon"
				variant="danger"
				aria-label={`Delete ${account.accountName}`}
				onClick={() => onDelete(account)}
			>
				<Trash2 className="h-4 w-4" aria-hidden="true" />
			</Button>
		</div>
	);
}
