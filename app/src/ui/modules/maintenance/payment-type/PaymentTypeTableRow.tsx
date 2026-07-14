import type {
	PaymentTypePermissions,
	PaymentTypeRecord,
	PaymentTypeTableRowProps,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PaymentTypeTableRow({
	row,
	permissions,
	onEdit,
	onToggleStatus,
	onView,
}: PaymentTypeTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<PaymentTypeTableCell
					key={cell.id}
					align={isCenteredColumn(cell.column.id) ? "center" : "left"}
				>
					<PaymentTypeCellContent
						columnId={cell.column.id}
						paymentType={row.original}
						permissions={permissions}
						onEdit={onEdit}
						onToggleStatus={onToggleStatus}
						onView={onView}
					/>
				</PaymentTypeTableCell>
			))}
		</tr>
	);
}

function isCenteredColumn(columnId: string) {
	return ["actions", "status", "type"].includes(columnId);
}

function PaymentTypeCellContent({
	columnId,
	paymentType,
	permissions,
	onEdit,
	onToggleStatus,
	onView,
}: {
	columnId: string;
	paymentType: PaymentTypeRecord;
	permissions: PaymentTypePermissions;
	onEdit: (paymentType: PaymentTypeRecord) => void;
	onToggleStatus: (paymentType: PaymentTypeRecord) => void;
	onView: (paymentType: PaymentTypeRecord) => void;
}) {
	const nextStatus = paymentType.status === "Active" ? "Inactive" : "Active";
	const statusActionLabel =
		paymentType.status === "Active" ? "Deactivate" : "Activate";

	switch (columnId) {
		case "paymentType":
			return (
				<span className="font-medium text-darknavy">
					{paymentType.paymentType}
				</span>
			);
		case "description":
			return (
				<span
					className="block truncate text-darknavy/75"
					title={paymentType.description}
				>
					{paymentType.description || ""}
				</span>
			);
		case "type":
			return (
				<span className="inline-flex rounded-md bg-skyblue/10 px-2.5 py-1 text-xs font-semibold text-darknavy">
					{paymentType.type}
				</span>
			);
		case "status":
			return <StatusBadge status={paymentType.status} />;
		case "createdBy":
			return <span>{paymentType.createdBy ?? ""}</span>;
		case "createdAt":
			return <span>{formatDateTime(paymentType.createdAt, { emptyValue: "", locale: "en-US" })}</span>;
		case "updatedBy":
			return <span>{paymentType.updatedBy ?? ""}</span>;
		case "updatedAt":
			return <span>{formatDateTime(paymentType.updatedAt, { emptyValue: "", locale: "en-US" })}</span>;
		case "actions":
			return (
				<ModuleTableActions
					data-spotlight-id="maintenance-record-actions"
					className="w-full !justify-center"
				>
					<ModuleTableActionButton
						variant="view"
						onClick={() => onView(paymentType)}
						data-spotlight-id="maintenance-record-view"
						label={`View ${paymentType.paymentType}`}
					/>
					{permissions.canUpdate ? (
						<>
							<ModuleTableActionButton
								variant="edit"
								onClick={() => onEdit(paymentType)}
								data-spotlight-id="maintenance-record-edit"
								label={`Edit ${paymentType.paymentType}`}
							/>
							<ModuleTableActionButton
								variant={nextStatus === "Inactive" ? "inactive" : "active"}
								onClick={() => onToggleStatus(paymentType)}
								data-spotlight-id="maintenance-record-status"
								label={`${statusActionLabel} ${paymentType.paymentType}`}
							/>
						</>
					) : null}
				</ModuleTableActions>
			);
		default:
			return null;
	}
}

function PaymentTypeTableCell({
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

function StatusBadge({ status }: { status: PaymentTypeRecord["status"] }) {
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
import { formatDateTime } from "@/app/src/utils/date.util";
