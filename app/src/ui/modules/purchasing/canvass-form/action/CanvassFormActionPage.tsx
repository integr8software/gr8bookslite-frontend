"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CanvassFormHref } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import { useCanvassFormActionPage } from "@/app/src/hooks/modules/purchasing/canvass-form/useCanvassFormActionPage";
import { CanvassFormDetailsForm } from "@/app/src/ui/modules/purchasing/canvass-form/action/CanvassFormDetailsForm";
import { CanvassFormEntrySection } from "@/app/src/ui/modules/purchasing/canvass-form/entries/CanvassFormEntrySection";
import { CanvassFormFormHeader } from "@/app/src/ui/modules/purchasing/canvass-form/action/CanvassFormFormHeader";
import { CanvassFormReportPreview } from "@/app/src/ui/modules/purchasing/canvass-form/reports/CanvassFormReportPreview";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function CanvassFormActionPage() {
	return (
		<Suspense fallback={<CanvassFormSkeleton />}>
			<CanvassFormActionPageInner />
		</Suspense>
	);
}

function CanvassFormActionPageInner() {
	const page = useCanvassFormActionPage();

	if (page.needsRecord && !page.existingForm) {
		return <CanvassFormNotFound />;
	}

	return (
		<section className="grid gap-5">
			<CanvassFormFormHeader
				copyFromRecords={page.purchaseRequestCopyRecords}
				isSubmitting={page.isSubmitting}
				mode={page.mode}
				recordId={page.recordId}
				values={page.values}
				onCopyFromPurchaseRequest={page.copyFromPurchaseRequests}
				onPreview={() => page.setShowPreview(true)}
				onSubmit={page.handleSubmit}
			/>
			<CanvassFormDetailsForm
				isReadonly={page.isReadonly}
				values={page.values}
				onUpdateField={page.updateField}
			/>
			<CanvassFormEntrySection
				accountingRows={page.values.accountingEntries}
				error={page.errors.items}
				isReadonly={page.isReadonly}
				rows={page.values.items}
				onAccountingRowsChange={page.updateAccountingEntries}
				onRowsChange={page.updateItems}
			/>
			<CanvassFormReportPreview
				isOpen={page.showPreview}
				record={page.previewRecord}
				onClose={() => page.setShowPreview(false)}
			/>
		</section>
	);
}

function CanvassFormNotFound() {
	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Canvass Order Not Found"
				description="The selected canvass order could not be found."
				actions={
					<Link href={CanvassFormHref} className={moduleHeaderActionClassNames.secondary}>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back to List
					</Link>
				}
			/>
		</section>
	);
}

function CanvassFormSkeleton() {
	return (
		<section className="grid gap-5">
			<div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />
			<div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
		</section>
	);
}
