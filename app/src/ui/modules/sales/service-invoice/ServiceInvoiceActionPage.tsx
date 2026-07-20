"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ServiceInvoiceHref } from "@/app/src/constants/modules/sales/service-invoice/ServiceInvoiceConstants";
import { useServiceInvoiceActionForm } from "@/app/src/hooks/modules/sales/service-invoice/useServiceInvoice";
import type { ServiceInvoiceActionMode } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import { ServiceInvoiceFormHeader } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceFormHeader";
import {
	ServiceInvoiceDetailsForm,
	type ServiceInvoiceDetailsSection,
} from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceDetailsForm";
import { ServiceInvoiceEntries } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceEntries";
import { ServiceInvoiceNotFound } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceNotFound";
import { openServiceInvoicePdf } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoicePdf";
import { ServiceInvoiceReportPreview } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceReportPreview";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function ServiceInvoiceActionPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const mode = getModeFromPathname(pathname);
	const isReadonly = mode === "view";
	const recordId =
		typeof params.recordId === "string" ? params.recordId : undefined;
	const [activeTab, setActiveTab] =
		useState<ServiceInvoiceDetailsSection>("customer");
	const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
	const invoiceForm = useServiceInvoiceActionForm(mode, recordId, () => {
		router.push(ServiceInvoiceHref);
	});

	if (invoiceForm.isRecordMissing) {
		return <ServiceInvoiceNotFound />;
	}

	return (
		<>
			<section className="grid gap-5">
				<ServiceInvoiceFormHeader
					mode={mode}
					onPreview={() => setIsReportPreviewOpen(true)}
					values={invoiceForm.values}
					onSubmit={invoiceForm.submitInvoice}
				/>
				<ModuleTabs
					activeTab={activeTab}
					ariaLabel="Service invoice sections"
					tabs={ServiceInvoiceTabs}
					onTabChange={setActiveTab}
				/>
				<ServiceInvoiceDetailsForm
					isReadonly={isReadonly}
					section={activeTab}
					values={invoiceForm.values}
					onUpdateField={invoiceForm.updateField}
				/>
				<ServiceInvoiceEntries
					isReadonly={isReadonly}
					rows={invoiceForm.values.lineEntries}
					onRowsChange={invoiceForm.updateLineEntries}
				/>
			</section>
			<ServiceInvoiceReportPreview
				isOpen={isReportPreviewOpen}
				values={invoiceForm.values}
				onClose={() => setIsReportPreviewOpen(false)}
				onGeneratePdf={() => openServiceInvoicePdf(invoiceForm.values)}
			/>
		</>
	);
}

const ServiceInvoiceTabs = [
	{ id: "customer", label: "Customer / Billing" },
	{ id: "amounts", label: "Amounts / Partners" },
	{ id: "references", label: "References / Project" },
] satisfies ModuleTabItem<ServiceInvoiceDetailsSection>[];

function getModeFromPathname(pathname: string): ServiceInvoiceActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
