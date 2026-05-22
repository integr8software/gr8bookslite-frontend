"use client";

import { useRouter } from "next/navigation";
import { PettyCashVoucherHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherFormPage";
import { PettyCashVoucherDrawer } from "./PettyCashVoucherDrawer";
import { PettyCashVoucherListPage } from "./PettyCashVoucherListPage";
import { PettyCashVoucherNotFound } from "./PettyCashVoucherNotFound";

export function PettyCashVoucherFormPage() {
	const router = useRouter();
	const page = usePettyCashVoucherFormPage();
	const closeDrawer = () => router.push(PettyCashVoucherHref);

	if (page.needsRecord && !page.existingVoucher) {
		return (
			<>
				<PettyCashVoucherListPage />
				<PettyCashVoucherNotFound />
			</>
		);
	}

	return (
		<>
			<PettyCashVoucherListPage />
			<PettyCashVoucherDrawer
				isOpen
				onClose={closeDrawer}
				page={page}
				position="left"
			/>
		</>
	);
}
