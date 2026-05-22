"use client";

import { Save, X } from "lucide-react";
import type { ModuleDrawerPosition } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
	primaryButtonClassName,
	secondaryButtonClassName,
	type PettyCashVoucherFormPageState,
} from "./PettyCashVoucherFormControls";
import {
	PettyCashVoucherDetailsFields,
	PettyCashVoucherSidePanel,
} from "./PettyCashVoucherFormSections";

type PettyCashVoucherDrawerProps = {
	isOpen: boolean;
	onClose: () => void;
	page: PettyCashVoucherFormPageState;
	position?: ModuleDrawerPosition;
};

export function PettyCashVoucherDrawer({
	isOpen,
	onClose,
	page,
	position = "right",
}: PettyCashVoucherDrawerProps) {
	return (
		<ModuleDrawer
			isOpen={isOpen}
			eyebrow="Cash disbursement"
			title="Petty Cash Voucher"
			description="Record a new petty cash voucher using the same modern module action layout."
			maxWidthClassName="max-w-5xl"
			onClose={onClose}
			position={position}
		>
			<div className="grid gap-4 p-6">
				<div className="grid gap-4">
					<PettyCashVoucherSidePanel />
					<PettyCashVoucherDetailsFields page={page} />
				</div>
			</div>

			<div className="mb-6 flex justify-end gap-2">
				<button
					type="button"
					onClick={onClose}
					className={secondaryButtonClassName}
				>
					<X className="h-4 w-4" />
					Cancel
				</button>
				<button
					type="button"
					onClick={page.handleSubmit}
					className={primaryButtonClassName}
				>
					<Save className="h-4 w-4" />
					Save
				</button>
			</div>
		</ModuleDrawer>
	);
}
