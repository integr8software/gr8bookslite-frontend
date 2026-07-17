"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SalesInvoiceHref } from "@/app/src/constants/modules/sales/sales-invoice/SalesInvoiceConstants";
import { useSalesInvoiceActionForm } from "@/app/src/hooks/modules/sales/sales-invoice/useSalesInvoice";
import type {
	SalesInvoiceActionMode,
	SalesInvoiceLineItem,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import { SalesInvoiceActionHeader } from "@/app/src/ui/modules/sales/sales-invoice/SalesInvoiceActionHeader";
import { SalesInvoiceDetailsForm } from "@/app/src/ui/modules/sales/sales-invoice/SalesInvoiceDetailsForm";
import { SalesInvoiceEntries } from "@/app/src/ui/modules/sales/sales-invoice/SalesInvoiceEntries";
import { SalesInvoiceReportPreview } from "@/app/src/ui/modules/sales/sales-invoice/SalesInvoiceReportPreview";

export function SalesInvoiceAction() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const mode = getModeFromPathname(pathname);
	const isReadonly = mode === "view";
	const recordId =
		typeof params.recordId === "string" ? params.recordId : undefined;
	const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
	const invoiceForm = useSalesInvoiceActionForm(mode, recordId, () => {
		router.push(SalesInvoiceHref);
	});

	function updateLineItems(lineItems: SalesInvoiceLineItem[]) {
		invoiceForm.updateField("lineItems", lineItems);
	}

	return (
		<>
			<section className="grid gap-5">
				<SalesInvoiceActionHeader
					mode={mode}
					onPreview={() => setIsReportPreviewOpen(true)}
					values={invoiceForm.values}
					onSubmit={invoiceForm.submitInvoice}
				/>
				<SalesInvoiceDetailsForm
					isReadonly={isReadonly}
					values={invoiceForm.values}
					onUpdateField={invoiceForm.updateField}
				/>
				<SalesInvoiceEntries
					isReadonly={isReadonly}
					rows={invoiceForm.values.lineItems}
					onRowsChange={updateLineItems}
				/>
			</section>
			<SalesInvoiceReportPreview
				isOpen={isReportPreviewOpen}
				values={invoiceForm.values}
				onClose={() => setIsReportPreviewOpen(false)}
				onPrint={() => window.print()}
			/>
		</>
	);
}

function getModeFromPathname(pathname: string): SalesInvoiceActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
