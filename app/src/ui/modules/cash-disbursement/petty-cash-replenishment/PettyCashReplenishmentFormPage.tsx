"use client";

import { useRouter } from "next/navigation";
import { PettyCashReplenishmentHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { usePettyCashReplenishmentFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentFormPage";
import { PettyCashReplenishmentDrawer } from "./PettyCashReplenishmentDrawer";
import { PettyCashReplenishmentListPage } from "./PettyCashReplenishmentListPage";
import { PettyCashReplenishmentNotFound } from "./PettyCashReplenishmentNotFound";

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
