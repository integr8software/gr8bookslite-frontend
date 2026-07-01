"use client";

import {
	TermManagementActionCopy,
	TermManagementTitle,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementFormPage } from "@/app/src/hooks/modules/maintenance/term-management/useTermManagementFormPage";
import type {
	TermManagement,
	TermManagementActionMode,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { TermManagementFields } from "@/app/src/ui/modules/maintenance/term-management/TermManagementFields";

const formId = "term-management-drawer-form";

type TermManagementDrawerProps = {
	initialValues?: TermManagementFormValues;
	isOpen: boolean;
	mode: TermManagementActionMode;
	onClose: () => void;
	term?: TermManagement;
};

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
	return <MaintenanceFormDrawer description={copy.description} eyebrow={TermManagementTitle} formId={formId} isOpen={isOpen} isReadonly={page.isReadonly} isSaving={page.isSubmitting} onClose={onClose} savingLabel={mode === "edit" ? "Updating Term..." : "Saving Term..."} submitLabel={mode === "edit" ? "Update Term" : "Save Term"} title={copy.title}>
		<form id={formId} onSubmit={page.handleSubmit} className="px-6 py-5"><TermManagementFields errors={page.errors} isReadonly={page.isReadonly} values={page.values} onInputChange={page.handleInputChange} /></form>
	</MaintenanceFormDrawer>;
}
