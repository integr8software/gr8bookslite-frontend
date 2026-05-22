"use client";

import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import { PettyCashVoucherHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherFormPage";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
	primaryButtonClassName,
	secondaryButtonClassName,
} from "./PettyCashVoucherFormControls";
import {
	PettyCashVoucherDetailsFields,
	PettyCashVoucherSidePanel,
} from "./PettyCashVoucherFormSections";
import { PettyCashVoucherListPage } from "./PettyCashVoucherListPage";

export function PettyCashVoucherFormPage() {
	const router = useRouter();
	const page = usePettyCashVoucherFormPage();
	const closeDrawer = () => router.push(PettyCashVoucherHref);

	return (
		<>
			<PettyCashVoucherListPage />
			<ModuleDrawer
				isOpen
				eyebrow="Cash disbursement"
				title="Petty Cash Voucher"
				description="Record a new petty cash voucher using the same modern module action layout."
				maxWidthClassName="max-w-5xl"
				onClose={closeDrawer}
			>
				<div className="grid gap-4 p-6">
					<div className="grid gap-4">
						<PettyCashVoucherSidePanel />
						<PettyCashVoucherDetailsFields page={page} />
					</div>
				</div>

				<div className="flex justify-end gap-2 mb-6">
					<button
						type="button"
						onClick={closeDrawer}
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
		</>
	);
}
