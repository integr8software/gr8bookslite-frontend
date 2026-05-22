"use client";

import { useRouter } from "next/navigation";
import { PettyCashReplenishmentHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { usePettyCashReplenishmentFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentFormPage";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { PettyCashReplenishmentCopyFromDialog } from "./CopyFromDialog";
import {
	PettyCashReplenishmentDetailsFields,
	PettyCashReplenishmentEntriesTable,
	PettyCashReplenishmentSummaryFields,
	PettyCashReplenishmentToolbar,
} from "./PettyCashReplenishmentFormSections";
import { PettyCashReplenishmentListPage } from "./PettyCashReplenishmentListPage";

export function PettyCashReplenishmentFormPage() {
	const router = useRouter();
	const page = usePettyCashReplenishmentFormPage();
	const closeDrawer = () => router.push(PettyCashReplenishmentHref);

	return (
		<>
			<PettyCashReplenishmentListPage />
			<ModuleDrawer
				isOpen
				eyebrow="Cash disbursement"
				title="Petty Cash Replenishment"
				description="Create or view petty cash replenishment details in a modern action layout."
				maxWidthClassName="max-w-6xl"
				onClose={closeDrawer}
			>
				<div className="p-6">
					<div className="flex flex-col gap-4 rounded-xl border border-darknavy/10 bg-white p-6 shadow-sm">
						<PettyCashReplenishmentToolbar page={page} />

						<div className="grid gap-6 xl:grid-cols-[1.6fr_380px]">
							<PettyCashReplenishmentDetailsFields page={page} />
							<PettyCashReplenishmentSummaryFields page={page} />
						</div>

						<PettyCashReplenishmentEntriesTable page={page} />
					</div>

					<PettyCashReplenishmentCopyFromDialog
						isOpen={page.copyDialogOpen}
						source={page.selectedSource}
						onClose={() => page.setCopyDialogOpen(false)}
						onSelect={page.selectCopyFromRecord}
					/>
				</div>
			</ModuleDrawer>
		</>
	);
}
