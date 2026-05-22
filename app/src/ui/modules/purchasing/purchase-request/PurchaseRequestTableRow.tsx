import Link from "next/link";
import { Edit3, Eye, FileText, Trash2 } from "lucide-react";
import { PurchaseRequestHref } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import {
	formatPurchaseRequestCurrency,
	formatPurchaseRequestDate,
	getPurchaseRequestTotal,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

type PurchaseRequestTableRowProps = {
	request: PurchaseRequestRecord;
	onDeleteRequest: (request: PurchaseRequestRecord) => void;
};

export function PurchaseRequestTableRow({
	request,
	onDeleteRequest,
}: PurchaseRequestTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{request.transNo}</td>
			<td className="px-4 py-4">
				<div className="font-medium">{request.vceName}</div>
				<div className="text-xs text-darknavy/55">{request.vceCode}</div>
			</td>
			<td className="px-4 py-4">{formatPurchaseRequestDate(request.prDate)}</td>
			<td className="px-4 py-4">{request.purchaseType}</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{request.status}
				</span>
			</td>
			<td className="px-4 py-4 text-right font-semibold">
				{formatPurchaseRequestCurrency(getPurchaseRequestTotal(request))}
			</td>
			<td className="px-4 py-4">
				<div className="flex items-center gap-2">
					<Link
						href={`${PurchaseRequestHref}/view/${request.id}`}
						aria-label={`View purchase request ${request.transNo}`}
						className={tableActionClassName}
					>
						<Eye className="h-4 w-4" aria-hidden="true" />
					</Link>
					<Link
						href={`${PurchaseRequestHref}/edit/${request.id}`}
						aria-label={`Edit purchase request ${request.transNo}`}
						className={tableActionClassName}
					>
						<Edit3 className="h-4 w-4" aria-hidden="true" />
					</Link>
					<Link
						href={`${PurchaseRequestHref}/view/${request.id}?preview=1`}
						aria-label={`Preview purchase request ${request.transNo}`}
						className={tableActionClassName}
					>
						<FileText className="h-4 w-4" aria-hidden="true" />
					</Link>
					<button
						type="button"
						onClick={() => onDeleteRequest(request)}
						aria-label={`Delete purchase request ${request.transNo}`}
						className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			</td>
		</tr>
	);
}

const tableActionClassName =
	"inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";
