import type { ReactNode } from "react";
import type { Row } from "@tanstack/react-table";
import {
	getDefaultAccountTypeLabel,
} from "@/app/src/constants/modules/maintenance/financial-management/default-account/DefaultAccountConstants";
import type {
	DefaultAccount,
	DefaultAccountPermissions,
} from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type DefaultAccountTableRowProps = {
	row: Row<DefaultAccount>;
	permissions: DefaultAccountPermissions;
	onDeleteDefaultAccount: (account: DefaultAccount) => void;
	onEditDefaultAccount: (account: DefaultAccount) => void;
	onToggleStatus: (account: DefaultAccount) => void;
	onViewDefaultAccount: (account: DefaultAccount) => void;
};

export function DefaultAccountTableRow({
	row,
	permissions,
	onDeleteDefaultAccount,
	onEditDefaultAccount,
	onToggleStatus,
	onViewDefaultAccount,
}: DefaultAccountTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<DefaultAccountTableCell
					key={cell.id}
					align={isCenteredColumn(cell.column.id) ? "center" : "left"}
				>
					<DefaultAccountCellContent
						columnId={cell.column.id}
						defaultAccount={row.original}
						permissions={permissions}
						onDeleteDefaultAccount={onDeleteDefaultAccount}
						onEditDefaultAccount={onEditDefaultAccount}
						onToggleStatus={onToggleStatus}
						onViewDefaultAccount={onViewDefaultAccount}
					/>
				</DefaultAccountTableCell>
			))}
		</tr>
	);
}

function isCenteredColumn(columnId: string) {
	return ["actions", "status", "type"].includes(columnId);
}

function DefaultAccountCellContent({
	columnId,
	defaultAccount,
	permissions,
	onDeleteDefaultAccount,
	onEditDefaultAccount,
	onToggleStatus,
	onViewDefaultAccount,
}: {
	columnId: string;
	defaultAccount: DefaultAccount;
	permissions: DefaultAccountPermissions;
	onDeleteDefaultAccount: (account: DefaultAccount) => void;
	onEditDefaultAccount: (account: DefaultAccount) => void;
	onToggleStatus: (account: DefaultAccount) => void;
	onViewDefaultAccount: (account: DefaultAccount) => void;
}) {
	const nextStatus =
		defaultAccount.status === "Active" ? "Inactive" : "Active";
	const statusActionLabel =
		defaultAccount.status === "Active" ? "Inactivate" : "Activate";

	switch (columnId) {
		case "description":
			return (
				<span className="font-medium text-darknavy">
					{defaultAccount.description}
				</span>
			);
		case "type":
			return <TypeBadge type={defaultAccount.type} />;
		case "generatedAccounts":
			return (
				<div className="grid gap-1.5">
					{defaultAccount.generatedAccounts.map((generated) => (
						<span
							key={`${generated.role}-${generated.chartAccountId}`}
							className="block truncate text-darknavy/75"
							title={`${generated.accountCode} - ${generated.accountTitle}`}
						>
							<span className="font-semibold text-darknavy">
								{generated.accountCode}
							</span>{" "}
							{generated.accountTitle}
						</span>
					))}
				</div>
			);
		case "status":
			return <StatusBadge status={defaultAccount.status} />;
		case "createdAt":
			return <span>{formatDateTime(defaultAccount.createdAt)}</span>;
		case "updatedAt":
			return <span>{formatDateTime(defaultAccount.updatedAt)}</span>;
		case "actions":
			return (
				<ModuleTableActions className="w-full !justify-center">
					<ModuleTableActionButton
						variant="view"
						onClick={() => onViewDefaultAccount(defaultAccount)}
						label={`View ${defaultAccount.description}`}
					/>
					{permissions.canUpdate ? (
						<>
							<ModuleTableActionButton
								variant="edit"
								onClick={() => onEditDefaultAccount(defaultAccount)}
								label={`Edit ${defaultAccount.description}`}
							/>
							<ModuleTableActionButton
								variant={nextStatus === "Inactive" ? "inactive" : "active"}
								onClick={() => onToggleStatus(defaultAccount)}
								label={`${statusActionLabel} ${defaultAccount.description}`}
							/>
						</>
					) : null}
					{permissions.canDelete ? (
						<ModuleTableActionButton
							variant="delete"
							onClick={() => onDeleteDefaultAccount(defaultAccount)}
							label={`Delete ${defaultAccount.description}`}
						/>
					) : null}
				</ModuleTableActions>
			);
		default:
			return null;
	}
}

function formatDateTime(value?: string) {
	if (!value) return "-";

	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function DefaultAccountTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: ReactNode;
}) {
	return (
		<td
			className={`px-4 py-4 align-middle text-sm text-darknavy ${align === "center" ? "text-center" : "text-left"}`}
		>
			{children}
		</td>
	);
}

function TypeBadge({ type }: { type: DefaultAccount["type"] }) {
	return (
		<span className="inline-flex rounded-full bg-skyblue/10 px-2.5 py-1 text-xs font-semibold text-skyblue">
			{getDefaultAccountTypeLabel(type)}
		</span>
	);
}

function StatusBadge({ status }: { status: DefaultAccount["status"] }) {
	const statusClass =
		status === "Active"
			? "bg-citron/25 text-darknavy"
			: "bg-darknavy/8 text-darknavy/55";

	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
		>
			{status}
		</span>
	);
}
