import {
	PurchaseOrderHref,
} from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import {
	formatPurchaseOrderAmount,
	formatPurchaseOrderDate,
	getPurchaseOrderTotals,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type { PurchaseOrderRecord } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type PurchaseOrderRecordActionsProps = {
	order: PurchaseOrderRecord;
	onDeleteOrder: (order: PurchaseOrderRecord) => void;
};

export function PurchaseOrderRecordActions({
	order,
	onDeleteOrder,
}: PurchaseOrderRecordActionsProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{order.transNo}</td>
			<td className="px-4 py-4">{formatPurchaseOrderDate(order.documentDate)}</td>
			<td className="px-4 py-4">
				<div className="font-medium">{order.vceName}</div>
				<div className="text-xs text-darknavy/55">{order.vceCode}</div>
			</td>
			<td className="px-4 py-4">{order.purchaseType}</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{order.status}
				</span>
			</td>
			<td className="px-4 py-4 text-right font-semibold">
				{formatPurchaseOrderAmount(getPurchaseOrderTotals(order).grossAmount)}
			</td>
			<td className="px-4 py-4">
				<ModuleTableActions>
					<ModuleTableActionLink
						variant="view"
						href={`${PurchaseOrderHref}/view/${order.id}`}
						label={`View purchase order ${order.transNo}`}
					/>
					<ModuleTableActionLink
						variant="edit"
						href={`${PurchaseOrderHref}/edit/${order.id}`}
						label={`Edit purchase order ${order.transNo}`}
					/>
					<ModuleTableActionButton
						variant="delete"
						onClick={() => onDeleteOrder(order)}
						label={`Delete purchase order ${order.transNo}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
