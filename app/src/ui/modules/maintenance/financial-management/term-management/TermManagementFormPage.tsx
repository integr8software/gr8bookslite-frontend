"use client";

import { CalendarDays } from "lucide-react";
import { TermManagementActionCopy } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementFormPage } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagementFormPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/system/AppDialog";
import { TermManagementActionButtons } from "./TermManagementActionButtons";
import { TermManagementFields } from "./TermManagementFields";
import { TermManagementNotFound } from "./TermManagementNotFound";

export function TermManagementFormPage() {
	const page = useTermManagementFormPage();
	const copy = TermManagementActionCopy[page.mode];

	if (page.needsRecord && !page.existingTerm) {
		return <TermManagementNotFound />;
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={copy.title}
					description={copy.description}
					eyebrow={
						<>
							<CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
							Accounting master data
						</>
					}
					actions={
						<TermManagementActionButtons
							isReadonly={page.isReadonly}
							mode={page.mode}
							term={page.existingTerm}
							onDeleteTerm={() => page.setIsDeleteDialogOpen(true)}
						/>
					}
				/>

				<TermManagementFields
					errors={page.errors}
					isReadonly={page.isReadonly}
					values={page.values}
					onInputChange={page.handleInputChange}
				/>
			</form>

			<AppDialog
				isOpen={page.isDeleteDialogOpen}
				isPending={page.isMutating}
				title="Delete term definition?"
				description={`This will remove ${page.existingTerm?.description ?? "the selected term"}.`}
				confirmLabel="Delete Term"
				tone="danger"
				onCancel={() => page.setIsDeleteDialogOpen(false)}
				onConfirm={page.handleConfirmDelete}
			/>
		</>
	);
}

