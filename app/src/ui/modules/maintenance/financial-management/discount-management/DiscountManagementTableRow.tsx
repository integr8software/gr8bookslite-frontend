import { DiscountManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import type { DiscountManagementTableRecord } from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";

type DiscountManagementTableRowProps = {
	discount: DiscountManagementTableRecord;
	onDeleteDiscount: (discount: DiscountManagementTableRecord) => void;
};

export function DiscountManagementTableRow({
	discount,
	onDeleteDiscount,
}: DiscountManagementTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4 font-semibold text-darknavy">
				{discount.description}
			</td>
			<td className="px-4 py-4 text-darknavy">{discount.percentage}%</td>
			<td className="px-4 py-4 text-darknavy">{discount.accountLabel}</td>
			<td className="px-4 py-4">
				<ModuleTableActions>
					<ModuleTableActionLink
						variant="view"
						href={`${DiscountManagementHref}/view/${discount.id}`}
						label={`View ${discount.description}`}
					/>
					<ModuleTableActionLink
						variant="edit"
						href={`${DiscountManagementHref}/edit/${discount.id}`}
						label={`Edit ${discount.description}`}
					/>
					<ModuleTableActionButton
						variant="delete"
						onClick={() => onDeleteDiscount(discount)}
						label={`Delete ${discount.description}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
