"use client";

import { useState } from "react";
import { useMaterialRequestFormPage } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestFormPage";
import { MaterialRequestEntrySection } from "@/app/src/ui/modules/inventory/material-request/entries/MaterialRequestEntrySection";
import { MaterialRequestNotFound } from "@/app/src/ui/modules/inventory/material-request/overview/MaterialRequestNotFound";
import { MaterialRequestReportPreview } from "@/app/src/ui/modules/inventory/material-request/reports/MaterialRequestReportPreview";
import { MaterialRequestActionHeader } from "@/app/src/ui/modules/inventory/material-request/action/MaterialRequestActionHeader";
import { MaterialRequestDetailsPanel } from "@/app/src/ui/modules/inventory/material-request/action/MaterialRequestDetailsPanel";

export function MaterialRequestActionPage() {
	const page = useMaterialRequestFormPage();
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

			<MaterialRequestDetailsPanel
				errors={page.errors}
				isReadonly={page.isReadonly}
				updateField={page.updateField}
				values={page.values}
			/>

			<MaterialRequestEntrySection page={page} />

			<MaterialRequestReportPreview
				isOpen={isReportPreviewOpen}
				values={page.values}
				onClose={() => setIsReportPreviewOpen(false)}
			/>
		</section>
	);
}
