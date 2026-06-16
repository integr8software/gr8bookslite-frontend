"use client";

import { useMaterialRequestFormPage } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestFormPage";
import { MaterialRequestActionHeader } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestActionHeader";
import { MaterialRequestDataEntry } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestDataEntry";
import { MaterialRequestDetailsPanel } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestDetailsPanel";
import { MaterialRequestNotFound } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestNotFound";

export function MaterialRequestActionPage() {
	const page = useMaterialRequestFormPage();

	if (page.needsRecord && !page.existingRequest) {
		return <MaterialRequestNotFound />;
	}

	return (
		<section className="grid gap-5">
			<MaterialRequestActionHeader page={page} />

			<MaterialRequestDetailsPanel
				errors={page.errors}
				isReadonly={page.isReadonly}
				updateField={page.updateField}
				values={page.values}
			/>

			<MaterialRequestDataEntry page={page} />
		</section>
	);
}
