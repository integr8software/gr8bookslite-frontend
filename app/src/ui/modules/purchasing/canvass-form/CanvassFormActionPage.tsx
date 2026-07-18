"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CanvassFormHref } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import { useCanvassFormActionPage } from "@/app/src/hooks/modules/purchasing/canvass-form/useCanvassFormActionPage";
import {
	CanvassFormDetailsForm,
	type CanvassFormDetailsSection,
} from "@/app/src/ui/modules/purchasing/canvass-form/CanvassFormDetailsForm";
import { CanvassFormEntries } from "@/app/src/ui/modules/purchasing/canvass-form/CanvassFormEntries";
import { CanvassFormHeader } from "@/app/src/ui/modules/purchasing/canvass-form/CanvassFormHeader";
import { CanvassFormReportPreview } from "@/app/src/ui/modules/purchasing/canvass-form/CanvassFormReportPreview";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function CanvassFormActionPage() {
	return (
		<Suspense fallback={<CanvassFormSkeleton />}>
			<CanvassFormActionPageInner />
		</Suspense>
	);
}

function CanvassFormActionPageInner() {
	const page = useCanvassFormActionPage();
	const [activeTab, setActiveTab] = useState<CanvassFormDetailsSection>("request");

	if (page.needsRecord && !page.existingForm) {
		return <CanvassFormNotFound />;
	}

	return (
		<section className="grid gap-5">
			<CanvassFormHeader
				mode={page.mode}
				recordId={page.recordId}
				values={page.values}
				onPreview={() => page.setShowPreview(true)}
				onSubmit={page.handleSubmit}
			/>
			<ModuleTabs
				activeTab={activeTab}
				ariaLabel="Canvass form sections"
				tabs={CanvassTabs}
				onTabChange={setActiveTab}
			/>
			<CanvassFormDetailsForm
				isReadonly={page.isReadonly}
				section={activeTab}
				values={page.values}
				onUpdateField={page.updateField}
			/>
			<CanvassFormEntries
				error={page.errors.items}
				isReadonly={page.isReadonly}
				rows={page.values.items}
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

const CanvassTabs = [
	{ id: "request", label: "Request Details" },
	{ id: "references", label: "References / Status" },
] satisfies ModuleTabItem<CanvassFormDetailsSection>[];

function CanvassFormNotFound() {
	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Canvass Form Not Found"
				description="The selected canvass form could not be found."
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
