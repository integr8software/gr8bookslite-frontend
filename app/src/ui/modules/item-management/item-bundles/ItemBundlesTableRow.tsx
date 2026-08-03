import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatItemBundleComponents } from "@/app/src/data/modules/item-management/item-bundles/ItemBundlesData";
import { ItemBundlesHref } from "@/app/src/constants/modules/item-management/item-bundles/ItemBundlesConstants";
import type { ItemBundleListRecord } from "@/app/src/types/modules/item-management/item-bundles/ItemBundlesTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function ItemBundlesTableRow({
	row,
	onStatusChange,
}: {
	row: ItemBundleListRecord;
	onStatusChange: (row: ItemBundleListRecord) => void;
}) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{row.code}</td>
			<td className="px-4 py-4">{row.bundleItem}</td>
			<td className="px-4 py-4 text-darknavy/70">
				<div className="font-medium text-darknavy">
					{formatItemBundleComponents(row.components)}
				</div>
			</td>
			<td className="px-4 py-4 text-right font-semibold">
				{formatCurrency(row.totalCost)}
			</td>
			<td className="px-4 py-4 text-right font-semibold">
				{formatCurrency(row.originalSelling)}
			</td>
			<td className="px-4 py-4 text-right font-semibold">
				{formatCurrency(row.bundlePrice)}
			</td>
			<td className="px-4 py-4 text-right font-semibold">
				{formatCurrency(row.savings)}
			</td>
			<td className="px-4 py-4 text-center">
				<ModuleStatusBadge status={row.status} />
			</td>
			<td className="px-4 py-4 text-center">
				<ModuleTableActions className="justify-center">
					<ModuleTableActionLink
						variant="view"
						href={`${ItemBundlesHref}/view/${row.id}`}
						label={`View ${row.bundleItem}`}
					/>
					<ModuleTableActionLink
						variant="edit"
						href={`${ItemBundlesHref}/edit/${row.id}`}
						label={`Edit ${row.bundleItem}`}
					/>
					<ModuleTableActionButton
						variant={row.status === "Active" ? "inactive" : "active"}
						label={
							row.status === "Active"
								? `Set ${row.bundleItem} inactive`
								: `Set ${row.bundleItem} active`
						}
						onClick={() => onStatusChange(row)}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
