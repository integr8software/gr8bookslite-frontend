"use client";

import { useRouter } from "next/navigation";
import { PettyCashVoucherHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherFormPage";
import { PettyCashVoucherDrawer } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherDrawer";
import { PettyCashVoucherListPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherListPage";
import { PettyCashVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherNotFound";

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
