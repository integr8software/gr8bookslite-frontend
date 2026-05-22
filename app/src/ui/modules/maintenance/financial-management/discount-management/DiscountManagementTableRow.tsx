import Link from "next/link";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { DiscountManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import type { DiscountManagementTableRecord } from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";

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
				<div className="flex items-center justify-end gap-1">
					<Link
						href={`${DiscountManagementHref}/view/${discount.id}`}
						aria-label={`View ${discount.description}`}
						className={tableActionClassName}
					>
						<Eye className="h-4 w-4" aria-hidden="true" />
					</Link>
					<Link
						href={`${DiscountManagementHref}/edit/${discount.id}`}
						aria-label={`Edit ${discount.description}`}
						className={tableActionClassName}
					>
						<Edit3 className="h-4 w-4" aria-hidden="true" />
					</Link>
					<button
						type="button"
						onClick={() => onDeleteDiscount(discount)}
						aria-label={`Delete ${discount.description}`}
						className="flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			</td>
		</tr>
	);
}

const tableActionClassName =
	"flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";
