"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Printer, Save } from "lucide-react";
import {
	PurchaseRequestFormPageCopy,
	PurchaseRequestHref,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { PurchaseRequestMaterialPlanRecords } from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import { usePurchaseRequestFormPage } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequestFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	PurchaseRequestDetailsForm,
} from "@/app/src/ui/modules/purchasing/purchase-request/action/PurchaseRequestDetailsForm";
import { PurchaseRequestEntrySection } from "@/app/src/ui/modules/purchasing/purchase-request/entries/PurchaseRequestEntrySection";
import { PurchaseRequestPreviewDrawer } from "@/app/src/ui/modules/purchasing/purchase-request/reports/PurchaseRequestPreviewDrawer";
import {
	AppCopyFromDropdown,
} from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

export function PurchaseRequestActionPage() {
	return (
		<Suspense fallback={<PurchaseRequestFormSkeleton />}>
			<PurchaseRequestActionPageInner />
		</Suspense>
	);
}

function PurchaseRequestActionPageInner() {
	const page = usePurchaseRequestFormPage();
	const title = getPurchaseRequestTitle(
		page.mode,
		page.existingRequest?.transNo,
	);

	if (page.needsRecord && !page.existingRequest) {
		return <PurchaseRequestNotFound />;
	}

	return (
		<section className="purchase-request-form-page grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={title}
				description={PurchaseRequestFormPageCopy[page.mode].description}
				eyebrow={
					<>
						<FileText className="h-3.5 w-3.5" aria-hidden="true" />
						Purchasing document
					</>
				}
				actions={<PurchaseRequestHeaderActions page={page} />}
			/>

			<div className="grid min-w-0 gap-5">
				<PurchaseRequestDetailsForm
					isReadonly={page.isReadonly}
					values={page.values}
					onUpdateField={page.updateField}
				/>
				<PurchaseRequestEntrySection
					error={page.errors.items}
					isReadonly={page.isReadonly}
					rows={page.values.items}
					onRowsChange={page.updateItems}
				/>
			</div>

			<PurchaseRequestPreviewDrawer
				isOpen={page.showPreview}
				onClose={() => page.setShowPreview(false)}
				record={page.previewRecord}
			/>
		</section>
	);
}

type PurchaseRequestFormPageState = ReturnType<
	typeof usePurchaseRequestFormPage
>;

function PurchaseRequestHeaderActions({
	page,
}: {
	page: PurchaseRequestFormPageState;
}) {
	return (
		<>
			<Link
				href={PurchaseRequestHref}
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
					href={`${PurchaseRequestHref}/edit/${page.existingRequest?.id ?? ""}`}
					className={moduleHeaderActionClassNames.primary}
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : (
				<>
					<AppCopyFromDropdown
						records={PurchaseRequestMaterialPlanRecords}
						sources={["Material Plan"]}
						onApply={page.copyFromMaterialPlan}
					/>
					<button
						type="button"
						disabled={page.isSubmitting}
						onClick={page.handleSubmit}
						className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
					>
						<Save className="h-4 w-4" aria-hidden="true" />
						{page.isSubmitting ? "Saving..." : "Save"}
					</button>
				</>
			)}
		</>
	);
}

function PurchaseRequestNotFound() {
	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Purchase Request Not Found"
				description="The selected purchase request could not be found."
				actions={
					<Link
						href={PurchaseRequestHref}
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

function PurchaseRequestFormSkeleton() {
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

function getPurchaseRequestTitle(mode: string, transNo?: string) {
	if (mode === "add") {
		return PurchaseRequestFormPageCopy.add.title;
	}

	if (mode === "edit") {
		return `${PurchaseRequestFormPageCopy.edit.title} ${transNo ?? ""}`;
	}

	return `${PurchaseRequestFormPageCopy.view.title} ${transNo ?? ""}`;
}
