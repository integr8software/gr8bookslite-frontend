import type { Row } from "@tanstack/react-table";
import type { BankMasterfilePermissions } from "@/app/src/services/modules/maintenance/bank-masterfile/BankMasterfileApi";
import type { BankMasterfile } from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type BankMasterfileTableRowProps = {
	row: Row<BankMasterfile>;
	permissions: BankMasterfilePermissions;
	onEditBank: (bank: BankMasterfile) => void;
	onToggleStatus: (bank: BankMasterfile) => void;
	onViewBank: (bank: BankMasterfile) => void;
};

export function BankMasterfileTableRow({
	row,
	permissions,
	onEditBank,
	onToggleStatus,
	onViewBank,
}: BankMasterfileTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<BankMasterfileTableCell
					key={cell.id}
					align={isCenteredColumn(cell.column.id) ? "center" : "left"}
				>
					<BankMasterfileCellContent
						columnId={cell.column.id}
						bank={row.original}
						permissions={permissions}
						onEditBank={onEditBank}
						onToggleStatus={onToggleStatus}
						onViewBank={onViewBank}
					/>
				</BankMasterfileTableCell>
			))}
		</tr>
	);
}

function isCenteredColumn(columnId: string) {
	return ["actions", "currencyCode", "isDefault", "status"].includes(columnId);
}

function BankMasterfileCellContent({
	bank,
	columnId,
	permissions,
	onEditBank,
	onToggleStatus,
	onViewBank,
}: {
	bank: BankMasterfile;
	columnId: string;
	permissions: BankMasterfilePermissions;
	onEditBank: (bank: BankMasterfile) => void;
	onToggleStatus: (bank: BankMasterfile) => void;
	onViewBank: (bank: BankMasterfile) => void;
}) {
	const nextStatus = bank.status === "Active" ? "Inactive" : "Active";
	const statusActionLabel = bank.status === "Active" ? "Inactivate" : "Activate";

	switch (columnId) {
		case "bankName":
			return <span className="font-medium text-darknavy">{bank.bankName}</span>;
		case "branch":
			return <span>{bank.branch || ""}</span>;
		case "accountNumber":
			return <span className="font-mono text-darknavy/80">{bank.accountNumber}</span>;
		case "accountName":
			return (
				<span className="block truncate text-darknavy/75" title={bank.accountName}>
					{bank.accountName}
				</span>
			);
		case "accountCode":
			return <span className="font-mono text-darknavy/80">{bank.accountCode}</span>;
		case "currencyCode":
			return <span>{bank.currencyCode || "PHP"}</span>;
		case "isDefault":
			return <span>{bank.isDefault ? "Yes" : "No"}</span>;
		case "status":
			return <StatusBadge status={bank.status} />;
		case "createdAt":
			return <span>{formatDateTime(bank.createdAt)}</span>;
		case "updatedAt":
			return <span>{formatDateTime(bank.updatedAt)}</span>;
		case "actions":
			return (
				<ModuleTableActions className="w-full !justify-center">
					<ModuleTableActionButton
						variant="view"
						onClick={() => onViewBank(bank)}
						label={`View ${bank.bankName}`}
					/>
					{permissions.canUpdate ? (
						<>
							<ModuleTableActionButton
								variant="edit"
								onClick={() => onEditBank(bank)}
								label={`Edit ${bank.bankName}`}
							/>
							<ModuleTableActionButton
								variant={nextStatus === "Inactive" ? "inactive" : "active"}
								onClick={() => onToggleStatus(bank)}
								label={`${statusActionLabel} ${bank.bankName}`}
							/>
						</>
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

function BankMasterfileTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: React.ReactNode;
}) {
	return (
		<td
			className={`px-4 py-4 align-middle text-sm text-darknavy ${align === "center" ? "text-center" : "text-left"}`}
		>
			{children}
		</td>
	);
}

function StatusBadge({ status }: { status: BankMasterfile["status"] }) {
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