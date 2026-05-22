"use client";

import { useRouter } from "next/navigation";
import { PettyCashVoucherHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherFormPage";
import { PettyCashVoucherDrawer } from "./PettyCashVoucherDrawer";
import { PettyCashVoucherListPage } from "./PettyCashVoucherListPage";

export function PettyCashVoucherFormPage() {
	const router = useRouter();
	const page = usePettyCashVoucherFormPage();
	const closeDrawer = () => router.push(PettyCashVoucherHref);

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
