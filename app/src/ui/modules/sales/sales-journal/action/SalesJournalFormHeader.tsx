import Link from "next/link";
import { FileText, Save, Trash2 } from "lucide-react";
import {
	SalesJournalActionCopy,
	SalesJournalHref,
} from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import type { useSalesJournalFormPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

type SalesJournalFormHeaderProps = {
	page: ReturnType<typeof useSalesJournalFormPage>;
};

export function SalesJournalFormHeader({
	page,
}: SalesJournalFormHeaderProps) {
	const copy = SalesJournalActionCopy[page.mode];

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={copy.title}
			description={copy.description}
			eyebrow={
				<>
					<FileText className="h-3.5 w-3.5" aria-hidden="true" />
					Sales transaction
				</>
			}
			actions={
				<div className="flex flex-wrap gap-2">
					<Link
						href={SalesJournalHref}
						className={moduleHeaderActionClassNames.secondary}
					>
						Back
					</Link>
					{page.mode === "view" && page.existingRecord ? (
						<Link
							href={`${SalesJournalHref}/edit/${page.existingRecord.id}`}
							className={moduleHeaderActionClassNames.primary}
						>
							Edit
						</Link>
					) : null}
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
					{!page.isReadonly ? (
						<button
							type="submit"
							className={moduleHeaderActionClassNames.primary}
							disabled={page.isMutating}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save
						</button>
					) : null}
				</div>
			}
		/>
	);
}
