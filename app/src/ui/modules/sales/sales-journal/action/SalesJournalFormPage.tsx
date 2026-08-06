"use client";

import { useSalesJournalFormPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalFormPage";
import { SalesJournalEntrySection } from "@/app/src/ui/modules/sales/sales-journal/entries/SalesJournalEntrySection";
import { SalesJournalNotFound } from "@/app/src/ui/modules/sales/sales-journal/overview/SalesJournalNotFound";
import { SalesJournalFormHeader } from "@/app/src/ui/modules/sales/sales-journal/action/SalesJournalFormHeader";
import { SalesJournalHeaderFields } from "@/app/src/ui/modules/sales/sales-journal/action/SalesJournalHeaderFields";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export function SalesJournalFormPage() {
	const page = useSalesJournalFormPage();

	if (page.needsRecord && !page.existingRecord) {
		return <SalesJournalNotFound />;
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
				<SalesJournalFormHeader page={page} />
				<section className="grid gap-4 rounded-md border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
					<SalesJournalHeaderFields page={page} />
				</section>
				<SalesJournalEntrySection page={page} />
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
