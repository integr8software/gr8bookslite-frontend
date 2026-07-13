"use client";

import {
	ResponsibilityCenterActionCopy,
	ResponsibilityCenterDrawerFormId,
	ResponsibilityCenterTitle,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { useResponsibilityCenterFormPage } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenterFormPage";
import type { ResponsibilityCenterDrawerProps } from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import { ResponsibilityCenterDetailsFields } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterDetailsFields";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";

export function ResponsibilityCenterDrawer(props: ResponsibilityCenterDrawerProps) {
	return (
		<ResponsibilityCenterDrawerPanel
			key={`${props.mode}-${props.center?.id ?? "new"}`}
			{...props}
		/>
	);
}

function ResponsibilityCenterDrawerPanel({
	center,
	isOpen,
	mode,
	onClose,
}: ResponsibilityCenterDrawerProps) {
	const page = useResponsibilityCenterFormPage({
		center,
		mode,
		onSaved: onClose,
	});
	const copy = ResponsibilityCenterActionCopy[mode];

	return (
		<MaintenanceFormDrawer
			description={copy.description}
			eyebrow={ResponsibilityCenterTitle}
			formId={ResponsibilityCenterDrawerFormId}
			isOpen={isOpen}
			isReadonly={page.isReadonly}
			isSaving={page.isSubmitting}
			onClose={onClose}
			savingLabel={
				mode === "edit"
					? "Updating Responsibility Center..."
					: "Saving Responsibility Center..."
			}
			submitLabel={
				mode === "edit" ? "Update Responsibility Center" : "Save Responsibility Center"
			}
			title={copy.title}
		>
			<form
				id={ResponsibilityCenterDrawerFormId}
				onSubmit={page.handleSubmit}
				className="px-6 py-5"
			>
				<ResponsibilityCenterDetailsFields
					errors={page.errors}
					isReadonly={page.isReadonly}
					parentOptions={page.parentOptions}
					values={page.values}
					onFieldChange={page.handleFieldChange}
					onInputChange={page.handleInputChange}
				/>
			</form>
		</MaintenanceFormDrawer>
	);
}
