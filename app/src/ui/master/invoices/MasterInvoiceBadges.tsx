import type {
	MasterInvoicePaymentMethod,
	MasterInvoiceStatus,
} from "@/app/src/types/master/invoices/MasterInvoiceTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const StatusTone: Record<MasterInvoiceStatus, string> = {
	Failed: "bg-coralpink/12 text-coralpink ring-coralpink/18",
	Paid: "bg-citron/35 text-darknavy ring-citron/50",
	Pending: "bg-skyblue/12 text-darknavy ring-skyblue/25",
	Refunded: "bg-offwhite text-darknavy/70 ring-darknavy/10",
};

const PaymentMethodTone: Record<MasterInvoicePaymentMethod, string> = {
	"Bank Transfer": "bg-offwhite text-darknavy ring-darknavy/10",
	Card: "bg-skyblue/12 text-darknavy ring-skyblue/25",
	GCash: "bg-citron/35 text-darknavy ring-citron/50",
	"Manual Payment": "bg-white text-darknavy/70 ring-darknavy/12",
	Maya: "bg-coralpink/12 text-coralpink ring-coralpink/18",
};

export function MasterInvoiceStatusBadge({
	status,
}: {
	status: MasterInvoiceStatus;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-7 items-center rounded-md px-2.5 text-xs font-semibold ring-1",
				StatusTone[status],
			)}
		>
			{status}
		</span>
	);
}

export function MasterInvoicePaymentMethodBadge({
	paymentMethod,
}: {
	paymentMethod: MasterInvoicePaymentMethod;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-7 items-center rounded-md px-2.5 text-xs font-semibold ring-1",
				PaymentMethodTone[paymentMethod],
			)}
		>
			{paymentMethod}
		</span>
	);
}
