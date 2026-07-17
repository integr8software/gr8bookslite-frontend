"use client";

import {
	UnitOfMeasurementActionCopy,
	UnitOfMeasurementDrawerFormId,
	UnitOfMeasurementTitle,
} from "@/app/src/constants/modules/maintenance/unit-of-measurement/UnitOfMeasurementConstants";
import { useUnitOfMeasurementFormPage } from "@/app/src/hooks/modules/maintenance/unit-of-measurement/useUnitOfMeasurementFormPage";
import type { UnitOfMeasurementDrawerProps } from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";
import {
	getModuleSavePendingLabel,
	ModuleDrawer,
} from "@/app/src/ui/shared/module/ModuleDrawer";
import { UnitOfMeasurementFields } from "@/app/src/ui/modules/maintenance/unit-of-measurement/UnitOfMeasurementFields";

export function UnitOfMeasurementDrawer({
	initialValues,
	isOpen,
	isSaving,
	mode,
	onClose,
	onSave,
	record,
}: UnitOfMeasurementDrawerProps) {
	const formKey = initialValues
		? `${initialValues.name}-${initialValues.symbol}-${initialValues.quantityMode}-${initialValues.status}`
		: "new";

	return (
		<UnitOfMeasurementDrawerPanel
			key={`${mode}-${record?.id ?? formKey}`}
			initialValues={initialValues}
			isOpen={isOpen}
			isSaving={isSaving}
			mode={mode}
			onClose={onClose}
			onSave={onSave}
			record={record}
		/>
	);
}

function UnitOfMeasurementDrawerPanel({
	initialValues,
	isOpen,
	isSaving,
	mode,
	onClose,
	onSave,
	record,
}: UnitOfMeasurementDrawerProps) {
	const page = useUnitOfMeasurementFormPage({
		existingRecord: record,
		initialValues,
		mode,
		onSave,
		onSaved: onClose,
	});
	const copy = UnitOfMeasurementActionCopy[mode];
	const isSubmitting = isSaving || page.isSubmitting;

	return (
		<ModuleDrawer
			description={copy.description}
			eyebrow={UnitOfMeasurementTitle}
			formId={UnitOfMeasurementDrawerFormId}
			isOpen={isOpen}
			isReadonly={page.isReadonly}
			isSaving={isSubmitting}
			maxWidthClassName="max-w-xl"
			onBeforeSaveConfirm={page.validateBeforeSubmit}
			onClose={onClose}
			savingLabel={getModuleSavePendingLabel(mode)}
			submitLabel={mode === "edit" ? "Update Unit" : "Save Unit"}
			title={copy.title}
		>
			<form
				id={UnitOfMeasurementDrawerFormId}
				onSubmit={page.handleSubmit}
				className="px-6 py-5"
			>
				<UnitOfMeasurementFields
					errors={page.errors}
					isReadonly={page.isReadonly}
					values={page.values}
					onInputChange={page.handleInputChange}
				/>
			</form>
		</ModuleDrawer>
	);
}
