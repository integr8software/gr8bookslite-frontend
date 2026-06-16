"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Landmark, Save, X } from "lucide-react";
import { PettyCashFundReplenishmentHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { usePettyCashFundReplenishmentFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentFormPage";
import { PettyCashFundReplenishmentNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentNotFound";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { PettyCashFundReplenishmentCopyFromDialog } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentCopyFromDialog";
import {
	PettyCashFundReplenishmentDetailsFields,
	PettyCashFundReplenishmentEntriesTable,
	PettyCashFundReplenishmentSummaryFields,
} from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentFormSections";

export function PettyCashFundReplenishmentActionPage() {
	const router = useRouter();
	const page = usePettyCashFundReplenishmentFormPage();
	const closePage = () => router.push(PettyCashFundReplenishmentHref);

	if (page.needsRecord && !page.existingReplenishment) {
		return <PettyCashFundReplenishmentNotFound />;
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={getActionTitle(page.mode)}
				description="Complete the main details and entries for the petty cash fund replenishment record."
				eyebrow={
					<>
						<Landmark className="h-3.5 w-3.5" aria-hidden="true" />
						Cash disbursement
					</>
				}
				actions={
					<>
						<Link
							href={PettyCashFundReplenishmentHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<X className="h-4 w-4" aria-hidden="true" />
							{page.isReadonly ? "Close" : "Cancel"}
						</Link>
						{page.isReadonly ? null : (
							<button
								type="button"
								onClick={() => {
									if (page.handleSubmit()) {
										closePage();
									}
								}}
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						)}
					</>
				}
			/>

			<div className="grid gap-6 xl:grid-cols-[1.6fr_380px]">
				<PettyCashFundReplenishmentDetailsFields page={page} />
				<PettyCashFundReplenishmentSummaryFields page={page} />
			</div>

			<PettyCashFundReplenishmentEntriesTable page={page} />

			<PettyCashFundReplenishmentCopyFromDialog
				isOpen={page.copyDialogOpen}
				source={page.selectedSource}
				onClose={() => page.setCopyDialogOpen(false)}
				onSelect={page.selectCopyFromRecord}
			/>
		</section>
	);
}

function getActionTitle(mode: "add" | "edit" | "view") {
	if (mode === "view") {
		return "View Petty Cash Fund Replenishment";
	}

	if (mode === "edit") {
		return "Edit Petty Cash Fund Replenishment";
	}

	return "New Petty Cash Fund Replenishment";
}
