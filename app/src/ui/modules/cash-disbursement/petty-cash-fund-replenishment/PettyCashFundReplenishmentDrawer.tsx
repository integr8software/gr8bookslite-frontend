"use client";

import type { ModuleDrawerPosition } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { PettyCashFundReplenishmentCopyFromDialog } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentCopyFromDialog";
import {
	PettyCashFundReplenishmentDetailsFields,
	PettyCashFundReplenishmentEntriesTable,
	PettyCashFundReplenishmentSummaryFields,
	PettyCashFundReplenishmentToolbar,
} from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentFormSections";
import type { PettyCashFundReplenishmentFormPageState } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentFormControls";

type PettyCashFundReplenishmentDrawerProps = {
	isOpen: boolean;
	onClose: () => void;
	page: PettyCashFundReplenishmentFormPageState;
	position?: ModuleDrawerPosition;
};

export function PettyCashFundReplenishmentDrawer({
	isOpen,
	onClose,
	page,
}: PettyCashFundReplenishmentDrawerProps) {
	return (
		<ModuleDrawer
			isOpen={isOpen}
			eyebrow="Cash disbursement"
			title="Petty Cash Fund Replenishment"
			description="Create or view petty cash fund replenishment details in a modern action layout."
			maxWidthClassName="max-w-6xl"
			onClose={onClose}
			position="right"
		>
			<div className="p-6">
				<div className="flex flex-col gap-4 rounded-xl border border-darknavy/10 bg-white p-6 shadow-sm">
					<PettyCashFundReplenishmentToolbar
						page={page}
						onCancel={onClose}
					/>

					<div className="grid gap-6 xl:grid-cols-[1.6fr_380px]">
						<PettyCashFundReplenishmentDetailsFields page={page} />
						<PettyCashFundReplenishmentSummaryFields page={page} />
					</div>

					<PettyCashFundReplenishmentEntriesTable page={page} />
				</div>

				<PettyCashFundReplenishmentCopyFromDialog
					isOpen={page.copyDialogOpen}
					source={page.selectedSource}
					onClose={() => page.setCopyDialogOpen(false)}
					onSelect={page.selectCopyFromRecord}
				/>
			</div>
		</ModuleDrawer>
	);
}
