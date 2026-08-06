"use client";

import { Suspense } from "react";
import { FileText } from "lucide-react";
import {
	SalesQuotationFormPageCopy,
} from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import { useSalesQuotationFormPage } from "@/app/src/hooks/modules/sales/sales-quotation/useSalesQuotationFormPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { SalesQuotationEntries } from "@/app/src/ui/modules/sales/sales-quotation/entries/SalesQuotationEntries";
import { SalesQuotationNotFound } from "@/app/src/ui/modules/sales/sales-quotation/overview/SalesQuotationNotFound";
import { SalesQuotationPreviewDrawer } from "@/app/src/ui/modules/sales/sales-quotation/reports/SalesQuotationPreviewDrawer";
import { SalesQuotationDetailsForm } from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationDetailsForm";
import { SalesQuotationFormHeaderActions } from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationFormHeaderActions";

export function SalesQuotationFormPage() {
	return (
		<Suspense fallback={<SalesQuotationFormSkeleton />}>
			<SalesQuotationFormPageInner />
		</Suspense>
	);
}

function SalesQuotationFormPageInner() {
	const page = useSalesQuotationFormPage();
	const title = getSalesQuotationTitle(
		page.mode,
		page.existingRequest?.transNo,
	);

	if (page.needsRecord && !page.existingRequest) {
		return <SalesQuotationNotFound />;
	}

	return (
		<section className="sales-quotation-form-page grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={title}
				description={SalesQuotationFormPageCopy[page.mode].description}
				eyebrow={
					<>
						<FileText className="h-3.5 w-3.5" aria-hidden="true" />
						Sales document
					</>
				}
				actions={<SalesQuotationFormHeaderActions page={page} />}
			/>

			<div className="grid min-w-0 gap-5">
				<SalesQuotationDetailsForm
					isReadonly={page.isReadonly}
					values={page.values}
					onUpdateField={page.updateField}
				/>
				<SalesQuotationEntries
					error={page.errors.items}
					isReadonly={page.isReadonly}
					rows={page.values.items}
					onRowsChange={page.updateItems}
				/>
			</div>

			<SalesQuotationPreviewDrawer
				isOpen={page.showPreview}
				onClose={() => page.setShowPreview(false)}
				record={page.previewRecord}
			/>
		</section>
	);
}

function SalesQuotationFormSkeleton() {
	return (
		<section className="grid gap-5">
			<div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />
			<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
				<div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
				<div className="h-64 animate-pulse rounded-lg bg-white shadow-sm" />
			</div>
		</section>
	);
}

function getSalesQuotationTitle(mode: string, transNo?: string) {
	if (mode === "add") {
		return SalesQuotationFormPageCopy.add.title;
	}

	if (mode === "edit") {
		return `${SalesQuotationFormPageCopy.edit.title} ${transNo ?? ""}`;
	}

	return `${SalesQuotationFormPageCopy.view.title} ${transNo ?? ""}`;
}
