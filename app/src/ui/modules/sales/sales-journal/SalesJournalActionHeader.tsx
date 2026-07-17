import Link from "next/link";
import { ArrowLeft, Save, Trash2, X } from "lucide-react";
import { SalesJournalHref } from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import type { useSalesJournalFormPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

type SalesJournalActionHeaderProps = {
	page: ReturnType<typeof useSalesJournalFormPage>;
};

export function SalesJournalActionHeader({
	page,
}: SalesJournalActionHeaderProps) {
	const title =
		page.mode === "view"
			? `View Sales Journal | ${page.values.documentNo || "Draft"}`
			: page.mode === "edit"
				? `Edit Sales Journal | ${page.values.documentNo || "Draft"}`
				: "Add Sales Journal";

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			eyebrow={page.values.documentNo || "Sales journal"}
			title={title}
			description={
				page.mode === "view"
					? "Review sales journal details, document references, and accounting entries."
					: "Complete the sales journal header and accounting entries on one page before saving."
			}
			actionsClassName="items-center gap-1"
			actions={
				<>
					<Link
						href={SalesJournalHref}
						className={moduleHeaderActionClassNames.secondary}
					>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back
					</Link>
					<ReportPreviewAction onPreview={() => window.print()} />
					{page.mode === "view" && page.existingRecord ? (
						<Link
							href={`${SalesJournalHref}/edit/${page.existingRecord.id}`}
							className={moduleHeaderActionClassNames.primary}
						>
							Edit
						</Link>
					) : null}
					{page.mode === "view" ? null : (
						<>
							<Link
								href={SalesJournalHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<X className="h-4 w-4" aria-hidden="true" />
								Cancel
							</Link>
							{page.mode === "edit" ? (
								<button
									type="button"
									className={moduleHeaderActionClassNames.danger}
									onClick={() => page.setIsDeleteDialogOpen(true)}
								>
									<Trash2 className="h-4 w-4" aria-hidden="true" />
									Delete
								</button>
							) : null}
							<button
								type="button"
								className={moduleHeaderActionClassNames.primary}
								disabled={page.isMutating}
								onClick={page.submitSalesJournal}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						</>
					)}
				</>
			}
		/>
	);
}
