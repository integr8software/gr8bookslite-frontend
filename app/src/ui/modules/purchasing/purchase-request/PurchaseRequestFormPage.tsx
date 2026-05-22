"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronUp, FileText, Printer, Save } from "lucide-react";
import {
	PurchaseRequestFormPageCopy,
	PurchaseRequestHref,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { usePurchaseRequestFormPage } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequestFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { PurchaseRequestDetailsPanel } from "./PurchaseRequestDetailsPanel";
import { PurchaseRequestItemsTable } from "./PurchaseRequestItemsTable";
import { PurchaseRequestPreviewDrawer } from "./PurchaseRequestPreviewDrawer";
import { PurchaseRequestSummaryPanel } from "./PurchaseRequestSummaryPanel";

export function PurchaseRequestFormPage() {
	return (
		<Suspense fallback={<PurchaseRequestFormSkeleton />}>
			<PurchaseRequestFormPageInner />
		</Suspense>
	);
}

function PurchaseRequestFormPageInner() {
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
				<PurchaseRequestDetailsPanel
					errors={page.errors}
					isReadonly={page.isReadonly}
					updateField={page.updateField}
					values={page.values}
				/>
				<PurchaseRequestSummaryPanel
					errors={page.errors}
					isReadonly={page.isReadonly}
					updateField={page.updateField}
					values={page.values}
				/>
				<PurchaseRequestItemsTable
					error={page.errors.items}
					items={page.values.items}
					isReadonly={page.isReadonly}
					onAddItem={page.addItem}
					onRemoveItem={page.removeItem}
					onUpdateItem={page.updateItem}
				/>
			</div>

			<PurchaseRequestPreviewDrawer
				isOpen={page.showPreview}
				onClose={() => page.setShowPreview(false)}
				record={page.previewRecord}
			/>
			<PurchaseRequestBottomPreviewButton
				isOpen={page.showPreview}
				onClick={() => page.setShowPreview(true)}
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

function PurchaseRequestBottomPreviewButton({
	isOpen,
	onClick,
}: {
	isOpen: boolean;
	onClick: () => void;
}) {
	if (isOpen) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label="Open print preview"
			className="fixed bottom-0 left-1/2 z-40 inline-flex h-10 w-28 -translate-x-1/2 items-center justify-center rounded-t-lg border border-b-0 border-darknavy/40 bg-white text-darknavy shadow-[0_-8px_28px_rgba(33,39,56,0.08)] transition hover:border-skyblue/35 hover:bg-skyblue/30"
		>
			<ChevronUp className="h-5 w-5" aria-hidden="true" />
		</button>
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
