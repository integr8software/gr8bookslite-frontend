"use client";

import { TermManagementActionCopy } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementFormPage } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagementFormPage";
import type { TermManagement, TermManagementActionMode } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { TermManagementFields } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementFields";

const formId = "term-management-drawer-form";

export function TermManagementDrawer({ isOpen, mode, onClose, term }: { isOpen: boolean; mode: TermManagementActionMode; onClose: () => void; term?: TermManagement }) {
	return <TermManagementDrawerPanel key={`${mode}-${term?.id ?? "new"}`} isOpen={isOpen} mode={mode} onClose={onClose} term={term} />;
}

function TermManagementDrawerPanel({ isOpen, mode, onClose, term }: { isOpen: boolean; mode: TermManagementActionMode; onClose: () => void; term?: TermManagement }) {
	const page = useTermManagementFormPage({ existingTerm: term, mode, onSaved: onClose });
	const copy = TermManagementActionCopy[mode];
	return <MaintenanceFormDrawer description={copy.description} eyebrow="Accounting master data" formId={formId} isOpen={isOpen} isReadonly={page.isReadonly} isSaving={page.isMutating} onClose={onClose} title={copy.title}>
		<form id={formId} onSubmit={page.handleSubmit} className="px-6 py-5"><TermManagementFields errors={page.errors} isReadonly={page.isReadonly} values={page.values} onInputChange={page.handleInputChange} /></form>
	</MaintenanceFormDrawer>;
}
