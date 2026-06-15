"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Save, X } from "lucide-react";
import { PettyCashVoucherHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherFormPage";
import { PettyCashVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherNotFound";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	PettyCashVoucherDetailsFields,
	PettyCashVoucherSidePanel,
} from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherFormSections";

export function PettyCashVoucherActionPage() {
	const router = useRouter();
	const closePage = () => router.push(PettyCashVoucherHref);
	const page = usePettyCashVoucherFormPage({ onSaved: closePage });

	if (page.needsRecord && !page.existingVoucher) {
		return <PettyCashVoucherNotFound />;
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={getActionTitle(page.mode)}
				description="Record petty cash voucher details and supporting information."
				eyebrow={
					<>
						<CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
						Cash disbursement
					</>
				}
				actions={
					<>
						<Link
							href={PettyCashVoucherHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<X className="h-4 w-4" aria-hidden="true" />
							{page.isReadonly ? "Close" : "Cancel"}
						</Link>
						{page.isReadonly ? null : (
							<button
								type="button"
								onClick={page.handleSubmit}
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						)}
					</>
				}
			/>

			<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
				<PettyCashVoucherDetailsFields page={page} />
				<PettyCashVoucherSidePanel />
			</div>
		</section>
	);
}

function getActionTitle(mode: "add" | "edit" | "view") {
	if (mode === "view") {
		return "View Petty Cash Voucher";
	}

	if (mode === "edit") {
		return "Edit Petty Cash Voucher";
	}

	return "New Petty Cash Voucher";
}
