import { ItemPromotionsHref } from "@/app/src/constants/modules/item-management/item-promotions/ItemPromotionsConstants";
import type { ItemPromotionListRecord } from "@/app/src/types/modules/item-management/item-promotions/ItemPromotionsTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function ItemPromotionsTableRow({
	row,
	onStatusChange,
}: {
	row: ItemPromotionListRecord;
	onStatusChange: (row: ItemPromotionListRecord) => void;
}) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{row.code}</td>
			<td className="px-4 py-4">{row.name}</td>
			<td className="px-4 py-4">{row.type}</td>
			<td className="px-4 py-4 text-darknavy/70">{row.item}</td>
			<td className="px-4 py-4 font-semibold">{row.valueLabel}</td>
			<td className="px-4 py-4 text-darknavy/70">
				{row.discountManagementRule}
			</td>
			<td className="px-4 py-4 text-darknavy/70">{row.validity}</td>
			<td className="px-4 py-4 text-center">
				<ModuleStatusBadge status={row.status} />
			</td>
			<td className="px-4 py-4 text-center">
				<ModuleTableActions className="justify-center">
					<ModuleTableActionLink
						variant="view"
						href={`${ItemPromotionsHref}/view/${row.id}`}
						label={`View ${row.name}`}
					/>
					<ModuleTableActionLink
						variant="edit"
						href={`${ItemPromotionsHref}/edit/${row.id}`}
						label={`Edit ${row.name}`}
					/>
					<ModuleTableActionButton
						variant={row.status === "Active" ? "inactive" : "active"}
						label={
							row.status === "Active"
								? `Set ${row.name} inactive`
								: `Set ${row.name} active`
						}
						onClick={() => onStatusChange(row)}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
