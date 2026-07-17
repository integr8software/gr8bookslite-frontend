"use client";

import {
	TermManagementActionCopy,
	TermManagementDrawerFormId,
	TermManagementTitle,
} from "@/app/src/constants/modules/maintenance/term-management/TermManagementConstants";
import { useTermManagementFormPage } from "@/app/src/hooks/modules/maintenance/term-management/useTermManagementFormPage";
import type { TermManagementDrawerProps } from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { TermManagementFields } from "@/app/src/ui/modules/maintenance/term-management/TermManagementFields";

export function TermManagementDrawer({
	initialValues,
	isOpen,
	mode,
	onClose,
	term,
}: TermManagementDrawerProps) {
	const formKey = initialValues
		? `${initialValues.name}-${initialValues.datemode}-${initialValues.period}-${initialValues.status}`
		: "new";

	return (
		<TermManagementDrawerPanel
			key={`${mode}-${term?.id ?? formKey}`}
			initialValues={initialValues}
			isOpen={isOpen}
			mode={mode}
			onClose={onClose}
			term={term}
		/>
	);
}

function TermManagementDrawerPanel({
	initialValues,
	isOpen,
	mode,
	onClose,
	term,
}: TermManagementDrawerProps) {
	const page = useTermManagementFormPage({
		existingTerm: term,
		initialValues,
		mode,
		onSaved: onClose,
	});
	const copy = TermManagementActionCopy[mode];
	return <ModuleDrawer description={copy.description} eyebrow={TermManagementTitle} formId={TermManagementDrawerFormId} isOpen={isOpen} isReadonly={page.isReadonly} isSaving={page.isSubmitting} onBeforeSaveConfirm={page.validateBeforeSubmit} onClose={onClose} savingLabel={getModuleSavePendingLabel(mode)} submitLabel={mode === "edit" ? "Update Term" : "Save Term"} title={copy.title}>
		<form id={TermManagementDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5"><TermManagementFields errors={page.errors} isReadonly={page.isReadonly} values={page.values} onInputChange={page.handleInputChange} /></form>
	</ModuleDrawer>;
}



