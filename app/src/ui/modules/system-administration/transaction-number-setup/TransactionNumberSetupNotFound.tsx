import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { TransactionNumberSetupHref } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function TransactionNumberSetupNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-6 text-center shadow-sm">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
				<ReceiptText className="h-6 w-6" aria-hidden="true" />
			</div>
			<h1 className="mt-4 text-xl font-semibold text-darknavy">
				Transaction Number Setup Not Found
			</h1>
			<p className="mx-auto mt-2 max-w-md text-sm text-darknavy/55">
				The selected numbering setup may have been moved or removed.
			</p>
			<Link
				href={TransactionNumberSetupHref}
				className={`mt-5 ${moduleHeaderActionClassNames.secondary}`}
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back to Setups
			</Link>
		</section>
	);
}
