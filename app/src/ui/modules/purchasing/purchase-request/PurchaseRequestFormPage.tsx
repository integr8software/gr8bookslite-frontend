"use client";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Printer, Save } from "lucide-react";
import {
	PurchaseRequestFormPageCopy,
	PurchaseRequestHref,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { usePurchaseRequestFormPage } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequestFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	PurchaseRequestDetailsForm,
	type PurchaseRequestDetailsSection,
} from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestDetailsForm";
import { PurchaseRequestEntries } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestEntries";
import { PurchaseRequestPreviewDrawer } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestPreviewDrawer";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function PurchaseRequestFormPage() {
	return (
		<Suspense fallback={<PurchaseRequestFormSkeleton />}>
			<PurchaseRequestFormPageInner />
		</Suspense>
	);
}

function PurchaseRequestFormPageInner() {
	const page = usePurchaseRequestFormPage();
	const [activeTab, setActiveTab] =
		useState<PurchaseRequestDetailsSection>("supplier");
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
				<ModuleTabs
					activeTab={activeTab}
					ariaLabel="Purchase request sections"
					tabs={PurchaseRequestTabs}
					onTabChange={setActiveTab}
				/>
				<PurchaseRequestDetailsForm
					isReadonly={page.isReadonly}
					section={activeTab}
					values={page.values}
					onUpdateField={page.updateField}
				/>
				<PurchaseRequestEntries
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

const PurchaseRequestTabs = [
	{ id: "supplier", label: "Supplier / Request" },
	{ id: "references", label: "References / Project" },
] satisfies ModuleTabItem<PurchaseRequestDetailsSection>[];

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
				<button
					type="button"
					onClick={page.handleSubmit}
					className={moduleHeaderActionClassNames.primary}
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save
				</button>
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
