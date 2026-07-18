"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PurchaseOrderHref } from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import { usePurchaseOrderFormPage } from "@/app/src/hooks/modules/purchasing/purchase-order/usePurchaseOrderFormPage";
import {
	PurchaseOrderDetailsForm,
	type PurchaseOrderDetailsSection,
} from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderDetailsForm";
import { PurchaseOrderEntries } from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderEntries";
import { PurchaseOrderFormHeader } from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderFormHeader";
import { PurchaseOrderReportPreview } from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderReportPreview";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function PurchaseOrderFormPage() {
	return (
		<Suspense fallback={<PurchaseOrderFormSkeleton />}>
			<PurchaseOrderFormPageInner />
		</Suspense>
	);
}

function PurchaseOrderFormPageInner() {
	const page = usePurchaseOrderFormPage();
	const [activeTab, setActiveTab] =
		useState<PurchaseOrderDetailsSection>("supplier");

	if (page.needsRecord && !page.existingOrder) {
		return <PurchaseOrderNotFound />;
	}

	return (
		<section className="grid gap-5">
			<PurchaseOrderFormHeader
				mode={page.mode}
				recordId={page.recordId}
				values={page.values}
				onPreview={() => page.setShowPreview(true)}
				onSubmit={page.handleSubmit}
			/>
			<ModuleTabs
				activeTab={activeTab}
				ariaLabel="Purchase order sections"
				tabs={PurchaseOrderTabs}
				onTabChange={setActiveTab}
			/>
			<PurchaseOrderDetailsForm
				isReadonly={page.isReadonly}
				section={activeTab}
				values={page.values}
				onUpdateField={page.updateField}
			/>
			<PurchaseOrderEntries
				error={page.errors.items}
				isReadonly={page.isReadonly}
				rows={page.values.items}
				onRowsChange={page.updateItems}
			/>
			<PurchaseOrderReportPreview
				isOpen={page.showPreview}
				record={page.previewRecord}
				onClose={() => page.setShowPreview(false)}
			/>
		</section>
	);
}

const PurchaseOrderTabs = [
	{ id: "supplier", label: "Supplier / Amounts" },
	{ id: "references", label: "References / Project" },
] satisfies ModuleTabItem<PurchaseOrderDetailsSection>[];

function PurchaseOrderNotFound() {
	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Purchase Order Not Found"
				description="The selected purchase order could not be found."
				actions={
					<Link
						href={PurchaseOrderHref}
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

function PurchaseOrderFormSkeleton() {
	return (
		<section className="grid gap-5">
			<div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />
			<div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
		</section>
	);
}
