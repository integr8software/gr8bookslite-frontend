import type {
	BankMasterfile,
	BankMasterfileCellContentProps,
	BankMasterfileTableRowProps,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnHeaderAlign } from "@/app/src/ui/shared/module/module-table/utils";
import { formatDateTime } from "@/app/src/utils/date.util";

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
					align={getColumnHeaderAlign(cell.column.columnDef.meta) ?? "left"}
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

function BankMasterfileCellContent({
	bank,
	columnId,
	permissions,
	onEditBank,
	onToggleStatus,
	onViewBank,
}: BankMasterfileCellContentProps) {
	const nextStatus = bank.status === "Active" ? "Inactive" : "Active";
	const statusActionLabel = bank.status === "Active" ? "Inactivate" : "Activate";
	const canActivate =
		bank.status === "Active" ||
		(Boolean(bank.accountNumber.trim()) && Boolean(bank.accountName.trim()));

	switch (columnId) {
		case "bankName":
			return <span className="font-medium text-darknavy">{bank.bankName}</span>;
		case "branch":
			return <span>{bank.branch || ""}</span>;
		case "accountNumber":
			return (
				<span className="font-mono text-darknavy/80">
					{bank.accountNumber}
				</span>
			);
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
		case "createdBy":
			return <span>{bank.createdBy ?? ""}</span>;
		case "createdAt":
			return <span>{formatDateTime(bank.createdAt, { emptyValue: "", locale: "en-US" })}</span>;
		case "updatedBy":
			return <span>{bank.updatedBy ?? ""}</span>;
		case "updatedAt":
			return <span>{formatDateTime(bank.updatedAt, { emptyValue: "", locale: "en-US" })}</span>;
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
								disabled={!canActivate}
								label={`${statusActionLabel} ${bank.bankName}`}
								title={
									canActivate
										? `${statusActionLabel} ${bank.bankName}`
										: "Complete the account number and account name before activating."
								}
							/>
						</>
					) : null}
				</ModuleTableActions>
			);
		default:
			return null;
	}
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
