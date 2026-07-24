"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Printer, Save } from "lucide-react";
import {
	SalesQuotationFormPageCopy,
	SalesQuotationHref,
} from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import { useSalesQuotationFormPage } from "@/app/src/hooks/modules/sales/sales-quotation/useSalesQuotationFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	SalesQuotationDetailsForm,
} from "@/app/src/ui/modules/sales/sales-quotation/SalesQuotationDetailsForm";
import { SalesQuotationEntries } from "@/app/src/ui/modules/sales/sales-quotation/SalesQuotationEntries";
import { SalesQuotationPreviewDrawer } from "@/app/src/ui/modules/sales/sales-quotation/SalesQuotationPreviewDrawer";

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
				actions={<SalesQuotationHeaderActions page={page} />}
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

type SalesQuotationFormPageState = ReturnType<
	typeof useSalesQuotationFormPage
>;

function SalesQuotationHeaderActions({
	page,
}: {
	page: SalesQuotationFormPageState;
}) {
	return (
		<>
			<Link
				href={SalesQuotationHref}
				className={moduleHeaderActionClassNames.secondary}
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				List
			</Link>
			<button
				type="button"
				onClick={() => page.setShowPreview((current) => !current)}
				className={moduleHeaderActionClassNames.secondary}
			>
				<Printer className="h-4 w-4" aria-hidden="true" />
				{page.showPreview ? "Hide Preview" : "Preview"}
			</button>
			{page.mode === "view" ? (
				<Link
					href={`${SalesQuotationHref}/edit/${page.existingRequest?.id ?? ""}`}
					className={moduleHeaderActionClassNames.primary}
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : (
				<button
					type="button"
					disabled={page.isSubmitting}
					onClick={page.handleSubmit}
					className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					{page.isSubmitting ? "Saving..." : "Save"}
				</button>
			)}
		</>
	);
}

function SalesQuotationNotFound() {
	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Sales Quotation Not Found"
				description="The selected sales quotation could not be found."
				actions={
					<Link
						href={SalesQuotationHref}
						className={moduleHeaderActionClassNames.secondary}
					>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back to List
					</Link>
				}
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
