import type { SalesQuotationStatus } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";

type SalesQuotationStatusBadgeProps = {
	status: SalesQuotationStatus;
};

export function SalesQuotationStatusBadge({
	status,
}: SalesQuotationStatusBadgeProps) {
	return (
		<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
			{status}
		</span>
	);
}
