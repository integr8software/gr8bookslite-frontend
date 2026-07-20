"use client";

import { useState } from "react";
import { useMaterialRequestFormPage } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestFormPage";
import { MaterialRequestActionHeader } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestActionHeader";
import { MaterialRequestDataEntry } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestDataEntry";
import {
	MaterialRequestDetailsPanel,
	type MaterialRequestDetailsSection,
} from "@/app/src/ui/modules/inventory/material-request/MaterialRequestDetailsPanel";
import { MaterialRequestNotFound } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestNotFound";
import { MaterialRequestReportPreview } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestReportPreview";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function MaterialRequestActionPage() {
	const page = useMaterialRequestFormPage();
	const [activeTab, setActiveTab] =
		useState<MaterialRequestDetailsSection>("request");
	const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);

	if (page.needsRecord && !page.existingRequest) {
		return <MaterialRequestNotFound />;
	}

	return (
		<section className="grid gap-5">
			<MaterialRequestActionHeader
				page={page}
				onPreview={() => setIsReportPreviewOpen(true)}
			/>

			<ModuleTabs
				activeTab={activeTab}
				ariaLabel="Material request sections"
				tabs={MaterialRequestTabs}
				onTabChange={setActiveTab}
			/>

			<MaterialRequestDetailsPanel
				errors={page.errors}
				isReadonly={page.isReadonly}
				section={activeTab}
				updateField={page.updateField}
				values={page.values}
			/>

			<MaterialRequestDataEntry page={page} />

			<MaterialRequestReportPreview
				isOpen={isReportPreviewOpen}
				values={page.values}
				onClose={() => setIsReportPreviewOpen(false)}
			/>
		</section>
	);
}

const MaterialRequestTabs = [
	{ id: "request", label: "Request / Warehouse" },
	{ id: "vendor", label: "Party Code / Remarks" },
	{ id: "references", label: "References / Project" },
] satisfies ModuleTabItem<MaterialRequestDetailsSection>[];
