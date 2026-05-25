"use client";

import type { ModuleDrawerPosition } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { PettyCashReplenishmentCopyFromDialog } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/CopyFromDialog";
import {
	PettyCashReplenishmentDetailsFields,
	PettyCashReplenishmentEntriesTable,
	PettyCashReplenishmentSummaryFields,
	PettyCashReplenishmentToolbar,
} from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentFormSections";
import type { PettyCashReplenishmentFormPageState } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentFormControls";

type PettyCashReplenishmentDrawerProps = {
	isOpen: boolean;
	onClose: () => void;
	page: PettyCashReplenishmentFormPageState;
	position?: ModuleDrawerPosition;
};

export function PettyCashReplenishmentDrawer({
	isOpen,
	onClose,
	page,
}: PettyCashReplenishmentDrawerProps) {
	return (
		<ModuleDrawer
			isOpen={isOpen}
			eyebrow="Cash disbursement"
			title="Petty Cash Replenishment"
			description="Create or view petty cash replenishment details in a modern action layout."
			maxWidthClassName="max-w-6xl"
			onClose={onClose}
			position="right"
		>
			<div className="p-6">
				<div className="flex flex-col gap-4 rounded-xl border border-darknavy/10 bg-white p-6 shadow-sm">
					<PettyCashReplenishmentToolbar
						page={page}
						onCancel={onClose}
					/>

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
	);
}
