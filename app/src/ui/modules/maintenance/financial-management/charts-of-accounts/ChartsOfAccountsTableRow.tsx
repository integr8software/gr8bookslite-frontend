"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import {
	Badge,
	TypeBadge,
	joinClasses,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";

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
			<td className="px-5 py-4 font-semibold text-darknavy">
				{account.accountNumber}
			</td>
			<td className="px-5 py-4">
				<AccountNameCell
					account={account}
					expandedIds={expandedIds}
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
	level,
	onToggleExpanded,
}: {
	account: ChartAccount;
	expandedIds: Set<string>;
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
