import { useState, type DragEvent } from "react";
import { GripVertical } from "lucide-react";
import type {
	PaymentTypePermissions,
	PaymentTypeRecord,
	PaymentTypeTableRowProps,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

export function PaymentTypeTableRow({
	row,
	permissions,
	visiblePaymentTypeIds,
	onEdit,
	onReorder,
	onToggleStatus,
	onView,
}: PaymentTypeTableRowProps) {
	const [draggedOverPaymentTypeId, setDraggedOverPaymentTypeId] = useState<
		string | null
	>(null);
	const [activeDraggedPaymentTypeId, setActiveDraggedPaymentTypeId] = useState<
		string | null
	>(null);
	const [dropPlacement, setDropPlacement] = useState<"before" | "after">(
		"before",
	);
	const isDragTarget =
		draggedOverPaymentTypeId === row.original.id &&
		activeDraggedPaymentTypeId !== row.original.id;

	function handleDragOver(event: DragEvent<HTMLTableRowElement>) {
		if (!permissions.canUpdate) {
			return;
		}

		event.preventDefault();
		const draggedPaymentTypeId = event.dataTransfer.getData(
			"text/payment-type-id",
		);

		if (draggedPaymentTypeId === row.original.id) {
			setDraggedOverPaymentTypeId(null);
			return;
		}

		const rowBounds = event.currentTarget.getBoundingClientRect();
		const nextPlacement =
			event.clientY - rowBounds.top > rowBounds.height / 2
				? "after"
				: "before";

		setDropPlacement(nextPlacement);
		setDraggedOverPaymentTypeId(row.original.id);
	}

	function handleDrop(event: DragEvent<HTMLTableRowElement>) {
		event.preventDefault();
		setDraggedOverPaymentTypeId(null);

		const draggedPaymentTypeId = event.dataTransfer.getData(
			"text/payment-type-id",
		);

		if (
			draggedPaymentTypeId &&
			draggedPaymentTypeId !== row.original.id &&
			permissions.canUpdate &&
			!isNoopPaymentTypeDrop(
				visiblePaymentTypeIds,
				draggedPaymentTypeId,
				row.original.id,
				dropPlacement,
			)
		) {
			onReorder(draggedPaymentTypeId, row.original.id, dropPlacement);
		}
	}

	return (
		<tr
			className={`module-table-row ${
				isDragTarget && dropPlacement === "before"
					? "border-t-2 border-skyblue bg-skyblue/[0.035]"
					: ""
			} ${
				isDragTarget && dropPlacement === "after"
					? "border-b-2 border-skyblue bg-skyblue/[0.035]"
					: ""
			}`}
			onDragLeave={() => setDraggedOverPaymentTypeId(null)}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{row.getVisibleCells().map((cell) => (
				<PaymentTypeTableCell
					key={cell.id}
					className={getColumnMetaClassName(cell.column.columnDef.meta)}
				>
					<PaymentTypeCellContent
						columnId={cell.column.id}
						paymentType={row.original}
						permissions={permissions}
						showDropIndicator={isDragTarget && cell.column.id === "paymentType"}
						dropPlacement={dropPlacement}
						onDragEnd={() => {
							setActiveDraggedPaymentTypeId(null);
							setDraggedOverPaymentTypeId(null);
						}}
						onDragStart={(paymentTypeId) =>
							setActiveDraggedPaymentTypeId(paymentTypeId)
						}
						onEdit={onEdit}
						onToggleStatus={onToggleStatus}
						onView={onView}
					/>
				</PaymentTypeTableCell>
			))}
		</tr>
	);
}

function isNoopPaymentTypeDrop(
	visiblePaymentTypeIds: string[],
	draggedPaymentTypeId: string,
	targetPaymentTypeId: string,
	placement: "before" | "after",
) {
	const draggedIndex = visiblePaymentTypeIds.indexOf(draggedPaymentTypeId);
	const targetIndex = visiblePaymentTypeIds.indexOf(targetPaymentTypeId);

	if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) {
		return true;
	}

	return (
		(placement === "before" && draggedIndex === targetIndex - 1) ||
		(placement === "after" && draggedIndex === targetIndex + 1)
	);
}

function PaymentTypeCellContent({
	columnId,
	paymentType,
	permissions,
	showDropIndicator,
	dropPlacement,
	onDragEnd,
	onDragStart,
	onEdit,
	onToggleStatus,
	onView,
}: {
	columnId: string;
	paymentType: PaymentTypeRecord;
	permissions: PaymentTypePermissions;
	showDropIndicator: boolean;
	dropPlacement: "before" | "after";
	onDragEnd: () => void;
	onDragStart: (paymentTypeId: string) => void;
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
				<div className="relative flex min-w-0 items-center gap-2">
					{showDropIndicator ? (
						<DropPlacementIndicator
							mode={dropPlacement}
							paymentType={paymentType.paymentType}
						/>
					) : null}
					<button
						type="button"
						draggable={permissions.canUpdate}
						disabled={!permissions.canUpdate}
						onDragStart={(event) => {
							onDragStart(paymentType.id);
							event.dataTransfer.effectAllowed = "move";
							event.dataTransfer.setData(
								"text/payment-type-id",
								paymentType.id,
							);
						}}
						onDragEnd={onDragEnd}
						className="inline-flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-darknavy/45 transition hover:bg-skyblue/10 hover:text-darknavy active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-35"
						aria-label={`Drag ${paymentType.paymentType} to reorder`}
						title="Drag to reorder"
					>
						<GripVertical className="h-4 w-4" aria-hidden="true" />
					</button>
					<span className="truncate font-medium text-darknavy">
						{paymentType.paymentType}
					</span>
				</div>
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
			return <ModuleStatusBadge status={paymentType.status} />;
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

function DropPlacementIndicator({
	mode,
	paymentType,
}: {
	mode: "before" | "after";
	paymentType: string;
}) {
	return (
		<span
			className={`pointer-events-none absolute left-0 z-20 ${
				mode === "after" ? "-bottom-4" : "-top-4"
			}`}
			aria-hidden="true"
		>
			<span className="absolute left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-skyblue shadow-sm" />
			<span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-skyblue/30 bg-white px-2.5 py-1 text-[11px] font-bold uppercase text-skyblue shadow-[0_8px_24px_rgba(14,165,233,0.18)]">
				{mode === "after" ? "Drop after" : "Drop before"} {paymentType}
			</span>
		</span>
	);
}

function PaymentTypeTableCell({
	className = "text-left",
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<td
			className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}
		>
			{children}
		</td>
	);
}

import { formatDateTime } from "@/app/src/utils/date.util";
