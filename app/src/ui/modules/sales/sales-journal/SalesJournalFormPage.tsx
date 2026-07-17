"use client";

import { useState } from "react";
import { useSalesJournalFormPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalFormPage";
import {
	SalesJournalDetailsPage,
	type SalesJournalDetailsSection,
} from "@/app/src/ui/modules/sales/sales-journal/SalesJournalDetailsPage";
import { SalesJournalHeaderPage } from "@/app/src/ui/modules/sales/sales-journal/SalesJournalHeaderPage";
import { SalesJournalNotFound } from "@/app/src/ui/modules/sales/sales-journal/SalesJournalNotFound";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function SalesJournalFormPage() {
	const page = useSalesJournalFormPage();
	const [activeTab, setActiveTab] =
		useState<SalesJournalDetailsSection>("customer");

	if (page.needsRecord && !page.existingRecord) {
		return <SalesJournalNotFound />;
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
				<SalesJournalHeaderPage page={page} />
				<ModuleTabs
					activeTab={activeTab}
					ariaLabel="Sales journal sections"
					tabs={SalesJournalTabs}
					onTabChange={setActiveTab}
				/>
				<SalesJournalDetailsPage page={page} section={activeTab} />
			</form>

			<AppDialog
				isOpen={page.isDeleteDialogOpen}
				isPending={page.isMutating}
				title="Delete sales journal?"
				description={`This will remove ${page.existingRecord?.documentNo ?? "the selected sales journal"}.`}
				confirmLabel="Delete Sales Journal"
				tone="danger"
				onCancel={() => page.setIsDeleteDialogOpen(false)}
				onConfirm={page.handleConfirmDelete}
			/>
		</>
	);
}

const SalesJournalTabs = [
	{ id: "customer", label: "Customer / Billing" },
	{ id: "amounts", label: "Amounts / Partners" },
	{ id: "references", label: "References / Project" },
] satisfies ModuleTabItem<SalesJournalDetailsSection>[];
