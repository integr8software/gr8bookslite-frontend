"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BillingInvoiceHref } from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceConstants";
import { useBillingInvoiceActionForm } from "@/app/src/hooks/modules/sales/billing-invoice/useBillingInvoice";
import type { BillingInvoiceActionMode } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { BillingInvoiceFormHeader } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceFormHeader";
import {
	BillingInvoiceDetailsForm,
	type BillingInvoiceDetailsSection,
} from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceDetailsForm";
import { BillingInvoiceEntries } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceEntries";
import { BillingInvoiceNotFound } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceNotFound";
import { openBillingInvoicePdf } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoicePdf";
import { BillingInvoiceReportPreview } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceReportPreview";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function BillingInvoiceActionPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const mode = getModeFromPathname(pathname);
	const isReadonly = mode === "view";
	const recordId =
		typeof params.recordId === "string" ? params.recordId : undefined;
	const [activeTab, setActiveTab] =
		useState<BillingInvoiceDetailsSection>("customer");
	const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
	const invoiceForm = useBillingInvoiceActionForm(mode, recordId, () => {
		router.push(BillingInvoiceHref);
	});

	if (invoiceForm.isRecordMissing) {
		return <BillingInvoiceNotFound />;
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
				<ModuleTabs
					activeTab={activeTab}
					ariaLabel="Billing Invoice sections"
					tabs={BillingInvoiceTabs}
					onTabChange={setActiveTab}
				/>
				<BillingInvoiceDetailsForm
					isReadonly={isReadonly}
					section={activeTab}
					values={invoiceForm.values}
					onUpdateField={invoiceForm.updateField}
				/>
				<BillingInvoiceEntries
					isReadonly={isReadonly}
					rows={invoiceForm.values.lineEntries}
					onRowsChange={invoiceForm.updateLineEntries}
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

const BillingInvoiceTabs = [
	{ id: "customer", label: "Customer / Billing" },
	{ id: "amounts", label: "Amounts / Partners" },
	{ id: "references", label: "References / Shipment" },
] satisfies ModuleTabItem<BillingInvoiceDetailsSection>[];

function getModeFromPathname(pathname: string): BillingInvoiceActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

