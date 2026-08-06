import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { SalesJournalHref } from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function SalesJournalNotFound() {
	return (
		<section className="grid min-h-[22rem] place-items-center rounded-md border border-darknavy/10 bg-white p-8 text-center shadow-sm shadow-darknavy/5">
			<div className="max-w-md">
				<FileQuestion
					className="mx-auto h-12 w-12 text-skyblue"
					aria-hidden="true"
				/>
				<h1 className="mt-4 text-2xl font-semibold text-darknavy">
					Sales journal not found
				</h1>
				<p className="mt-2 text-sm leading-6 text-darknavy/65">
					The selected sales journal may have been deleted or is no longer
					available.
				</p>
				<Link
					href={SalesJournalHref}
					className={`${moduleHeaderActionClassNames.primary} mt-5`}
				>
					Back to Sales Journal
				</Link>
			</div>
		</section>
	);
}
