"use client";

import { Copy, Eye, WalletCards } from "lucide-react";
import toast from "react-hot-toast";
import { getMasterPromotionViewHref } from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import { WorkspaceBillingSubscriptionHref } from "@/app/src/constants/workspace/billing-and-subscription/WorkspaceBillingSubscriptionConstants";
import type { WorkspaceVouchersAndCouponsRecord } from "@/app/src/types/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsTypes";
import { ModuleActionMenu } from "@/app/src/ui/shared/module/ModuleActionMenu";

type WorkspaceVouchersAndCouponsRecordActionsProps = {
	record: WorkspaceVouchersAndCouponsRecord;
};

export function WorkspaceVouchersAndCouponsRecordActions({
	record,
}: WorkspaceVouchersAndCouponsRecordActionsProps) {
	return (
		<ModuleActionMenu
			label={`Open actions for ${record.promotionName}`}
			items={[
				{
					href: getMasterPromotionViewHref(record.promotionId),
					icon: Eye,
					label: "View promotion",
					type: "link",
				},
				{
					href: WorkspaceBillingSubscriptionHref,
					icon: WalletCards,
					label: "Use in billing",
					type: "link",
				},
				{
					icon: Copy,
					label: "Copy code",
					onSelect: () => {
						void copyPromotionCode(record.code);
					},
					type: "button",
				},
			]}
		/>
	);
}

async function copyPromotionCode(code: string) {
	if (typeof navigator === "undefined" || !navigator.clipboard) {
		toast.error("Clipboard is unavailable.");
		return;
	}

	try {
		await navigator.clipboard.writeText(code);
		toast.success(`${code} copied.`);
	} catch {
		toast.error("Unable to copy code.");
	}
}
