"use client";

import { useRouter } from "next/navigation";
import { PettyCashFundReplenishmentHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { usePettyCashFundReplenishmentFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentFormPage";
import { PettyCashFundReplenishmentDrawer } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentDrawer";
import { PettyCashFundReplenishmentListPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentListPage";
import { PettyCashFundReplenishmentNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentNotFound";

export function PettyCashFundReplenishmentFormPage() {
	const router = useRouter();
	const page = usePettyCashFundReplenishmentFormPage();
	const closeDrawer = () => router.push(PettyCashFundReplenishmentHref);

	if (page.needsRecord && !page.existingReplenishment) {
		return (
			<>
				<PettyCashFundReplenishmentListPage />
				<PettyCashFundReplenishmentNotFound />
			</>
		);
	}

	return (
		<>
			<PettyCashFundReplenishmentListPage />
			<PettyCashFundReplenishmentDrawer
				isOpen
				onClose={closeDrawer}
				page={page}
				position="right"
			/>
		</>
	);
}
