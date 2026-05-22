"use client";

import { useRouter } from "next/navigation";
import { PettyCashReplenishmentHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { usePettyCashReplenishmentFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentFormPage";
import { PettyCashReplenishmentDrawer } from "./PettyCashReplenishmentDrawer";
import { PettyCashReplenishmentListPage } from "./PettyCashReplenishmentListPage";

export function PettyCashReplenishmentFormPage() {
	const router = useRouter();
	const page = usePettyCashReplenishmentFormPage();
	const closeDrawer = () => router.push(PettyCashReplenishmentHref);

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
