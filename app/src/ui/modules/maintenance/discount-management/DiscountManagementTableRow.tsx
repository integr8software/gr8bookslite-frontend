import type {
	DiscountManagementPermissions,
	DiscountManagementTableRecord,
	DiscountManagementTableRowProps,
} from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";
import { formatDateTime } from "@/app/src/utils/date.util";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function DiscountManagementTableRow({
	discount,
	permissions,
	row,
	onEditDiscount,
	onToggleStatus,
	onViewDiscount,
}: DiscountManagementTableRowProps) {
	const visibleCells = row?.getVisibleCells();

	return (
		<tr className="module-table-row">
			{visibleCells
				? visibleCells.map((cell) => (
						<DiscountManagementTableCell
							key={cell.id}
							align={isCenteredColumn(cell.column.id) ? "center" : "left"}
						>
							<DiscountManagementCellContent
								columnId={cell.column.id}
								discount={discount}
								permissions={permissions}
								onEditDiscount={onEditDiscount}
								onToggleStatus={onToggleStatus}
								onViewDiscount={onViewDiscount}
							/>
						</DiscountManagementTableCell>
					))
				: null}
		</tr>
	);
}

function isCenteredColumn(columnId: string) {
	return ["actions", "type", "discountType", "amount", "status"].includes(
		columnId,
	);
}

function DiscountManagementCellContent({
	columnId,
	discount,
	permissions,
	onEditDiscount,
	onToggleStatus,
	onViewDiscount,
}: {
	columnId: string;
	discount: DiscountManagementTableRecord;
	permissions: DiscountManagementPermissions;
	onEditDiscount: (discount: DiscountManagementTableRecord) => void;
	onToggleStatus: (discount: DiscountManagementTableRecord) => void;
	onViewDiscount: (discount: DiscountManagementTableRecord) => void;
}) {
	const nextStatus = discount.status === "Active" ? "Inactive" : "Active";
	const statusActionLabel =
		discount.status === "Active" ? "Deactivate" : "Activate";

	switch (columnId) {
		case "name":
			return <span className="font-medium text-darknavy">{discount.name}</span>;
		case "description":
			return (
				<span
					className="block truncate text-darknavy/75"
					title={discount.description}
				>
					{discount.description}
				</span>
			);
		case "type":
			return <span>{discount.type}</span>;
		case "discountType":
			return <span>{discount.discountType}</span>;
		case "amount":
			return (
				<div className="grid gap-0.5">
					<span>{discount.amountLabel}</span>
					<span className="text-xs font-medium text-darknavy/50">
						{discount.valueLabel}
					</span>
				</div>
			);
		case "accountCode":
			return <span>{discount.accountCode}</span>;
		case "accountTitle":
			return (
				<span className="block truncate" title={discount.accountTitle}>
					{discount.accountTitle}
				</span>
			);
		case "status":
			return <StatusBadge status={discount.status} />;
		case "createdBy":
			return <span>{discount.createdBy ?? ""}</span>;
		case "createdAt":
			return <span>{formatDateTime(discount.createdAt)}</span>;
		case "updatedBy":
			return <span>{discount.updatedBy ?? ""}</span>;
		case "updatedAt":
			return <span>{formatDateTime(discount.updatedAt)}</span>;
		case "actions":
			return (
				<ModuleTableActions
					data-spotlight-id="maintenance-record-actions"
					className="w-full !justify-center"
				>
					<ModuleTableActionButton
						variant="view"
						onClick={() => onViewDiscount(discount)}
						data-spotlight-id="maintenance-record-view"
						label={`View ${discount.name}`}
					/>
					{permissions.canUpdate ? (
						<>
							<ModuleTableActionButton
								variant="edit"
								onClick={() => onEditDiscount(discount)}
								data-spotlight-id="maintenance-record-edit"
								label={`Edit ${discount.name}`}
							/>
							<ModuleTableActionButton
								variant={nextStatus === "Inactive" ? "inactive" : "active"}
								onClick={() => onToggleStatus(discount)}
								data-spotlight-id="maintenance-record-status"
								label={`${statusActionLabel} ${discount.name}`}
							/>
						</>
					) : null}
				</ModuleTableActions>
			);
		default:
			return null;
	}
}

function DiscountManagementTableCell({
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

function StatusBadge({ status }: { status: DiscountManagementTableRecord["status"] }) {
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
