import type { DiscountManagementTableRecord } from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type DiscountManagementTableRowProps = {
	discount: DiscountManagementTableRecord;
	onEditDiscount: (discount: DiscountManagementTableRecord) => void;
	onToggleStatus: (discount: DiscountManagementTableRecord) => void;
	onViewDiscount: (discount: DiscountManagementTableRecord) => void;
};

export function DiscountManagementTableRow({
	discount,
	onEditDiscount,
	onToggleStatus,
	onViewDiscount,
}: DiscountManagementTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4 font-semibold text-darknavy">
				{discount.name}
			</td>
			<td className="px-4 py-4 text-darknavy">{discount.description}</td>
			<td className="px-4 py-4 text-darknavy">
				<div className="grid gap-0.5">
					<span>{discount.amountLabel}</span>
					<span className="text-xs font-medium text-darknavy/50">
						{discount.valueLabel}
					</span>
				</div>
			</td>
			<td className="px-4 py-4 text-darknavy">{discount.accountLabel}</td>
			<td className="px-4 py-4 text-darknavy">{discount.moduleLabel}</td>
			<td className="px-4 py-4 text-darknavy">{discount.status}</td>
			<td className="px-4 py-4 text-center">
				<ModuleTableActions className="justify-center">
					<ModuleTableActionButton
						variant="view"
						onClick={() => onViewDiscount(discount)}
						label={`View ${discount.name}`}
					/>
					<ModuleTableActionButton
						variant="edit"
						onClick={() => onEditDiscount(discount)}
						label={`Edit ${discount.name}`}
					/>
					<ModuleTableActionButton
						variant={discount.status === "Active" ? "inactive" : "active"}
						onClick={() => onToggleStatus(discount)}
						label={`${discount.status === "Active" ? "Deactivate" : "Activate"} ${discount.name}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
