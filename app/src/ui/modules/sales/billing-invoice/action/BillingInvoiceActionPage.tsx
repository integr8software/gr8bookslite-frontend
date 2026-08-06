"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BillingInvoiceHref } from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceConstants";
import { useBillingInvoiceActionForm } from "@/app/src/hooks/modules/sales/billing-invoice/useBillingInvoice";
import type {
	BillingInvoiceAccountEntry,
	BillingInvoiceActionMode,
	BillingInvoiceLineEntry,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { BillingInvoiceFormHeader } from "@/app/src/ui/modules/sales/billing-invoice/action/BillingInvoiceFormHeader";
import { BillingInvoiceDetailsForm } from "@/app/src/ui/modules/sales/billing-invoice/action/BillingInvoiceDetailsForm";
import { BillingInvoiceEntries } from "@/app/src/ui/modules/sales/billing-invoice/entries/BillingInvoiceEntries";
import { BillingInvoiceNotFound } from "@/app/src/ui/modules/sales/billing-invoice/overview/BillingInvoiceNotFound";
import { openBillingInvoicePdf } from "@/app/src/ui/modules/sales/billing-invoice/reports/BillingInvoicePdf";
import { BillingInvoiceReportPreview } from "@/app/src/ui/modules/sales/billing-invoice/reports/BillingInvoiceReportPreview";

export function BillingInvoiceActionPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const mode = getModeFromPathname(pathname);
	const isReadonly = mode === "view";
	const recordId =
		typeof params.recordId === "string" ? params.recordId : undefined;
	const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
	const invoiceForm = useBillingInvoiceActionForm(mode, recordId, () => {
		router.push(BillingInvoiceHref);
	});

	if (invoiceForm.isRecordMissing) {
		return <BillingInvoiceNotFound />;
	}

	function updateLineEntries(lineEntries: BillingInvoiceLineEntry[]) {
		invoiceForm.updateLineEntries(lineEntries);
	}

	function updateAccountEntries(accountEntries: BillingInvoiceAccountEntry[]) {
		invoiceForm.updateField("accountEntries", accountEntries);
	}

	return (
		<>
			<section className="grid gap-5">
				<BillingInvoiceFormHeader
					mode={mode}
					onPreview={() => setIsReportPreviewOpen(true)}
					values={invoiceForm.values}
					onSubmit={invoiceForm.submitInvoice}
				/>
				<BillingInvoiceDetailsForm
					isReadonly={isReadonly}
					values={invoiceForm.values}
					onUpdateField={invoiceForm.updateField}
				/>
				<BillingInvoiceEntries
					accountRows={invoiceForm.values.accountEntries}
					isReadonly={isReadonly}
					rows={invoiceForm.values.lineEntries}
					onAccountRowsChange={updateAccountEntries}
					onRowsChange={updateLineEntries}
				/>
			</section>
			<BillingInvoiceReportPreview
				isOpen={isReportPreviewOpen}
				values={invoiceForm.values}
				onClose={() => setIsReportPreviewOpen(false)}
				onGeneratePdf={() => openBillingInvoicePdf(invoiceForm.values)}
			/>
		</>
	);
}

function getModeFromPathname(pathname: string): BillingInvoiceActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

