"use client";

import { useRouter } from "next/navigation";
import { PettyCashReplenishmentHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { usePettyCashReplenishmentFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentFormPage";
import { PettyCashReplenishmentDrawer } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentDrawer";
import { PettyCashReplenishmentListPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentListPage";
import { PettyCashReplenishmentNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentNotFound";

export function PettyCashReplenishmentFormPage() {
	const router = useRouter();
	const page = usePettyCashReplenishmentFormPage();
	const closeDrawer = () => router.push(PettyCashReplenishmentHref);

	if (page.needsRecord && !page.existingReplenishment) {
		return (
			<>
				<PettyCashReplenishmentListPage />
				<PettyCashReplenishmentNotFound />
			</>
		);
	}

	return (
		<>
			<PettyCashReplenishmentListPage />
			<PettyCashReplenishmentDrawer
				isOpen
				onClose={closeDrawer}
				page={page}
				position="right"
			/>
		</>
	);
}
