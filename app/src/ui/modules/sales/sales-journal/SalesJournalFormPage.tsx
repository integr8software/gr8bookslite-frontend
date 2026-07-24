"use client";

import { useSalesJournalFormPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalFormPage";
import { SalesJournalDetailsPage } from "@/app/src/ui/modules/sales/sales-journal/SalesJournalDetailsPage";
import { SalesJournalHeaderPage } from "@/app/src/ui/modules/sales/sales-journal/SalesJournalHeaderPage";
import { SalesJournalNotFound } from "@/app/src/ui/modules/sales/sales-journal/SalesJournalNotFound";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export function SalesJournalFormPage() {
	const page = useSalesJournalFormPage();

	if (page.needsRecord && !page.existingRecord) {
		return <SalesJournalNotFound />;
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
				<SalesJournalHeaderPage page={page} />
				<SalesJournalDetailsPage page={page} />
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
