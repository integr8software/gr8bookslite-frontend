"use client";

import { Ban, WalletCards } from "lucide-react";
import type { WorkspaceBillingCompanyAccount } from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";
import { ModuleActionMenu } from "@/app/src/ui/shared/module/ModuleActionMenu";

type WorkspaceBillingSubscriptionRecordActionsProps = {
	account: WorkspaceBillingCompanyAccount;
	onCancelSubscription: () => void;
	onPay: () => void;
};

export function WorkspaceBillingSubscriptionRecordActions({
	account,
	onCancelSubscription,
	onPay,
}: WorkspaceBillingSubscriptionRecordActionsProps) {
	return (
		<ModuleActionMenu
			label={`Open billing actions for ${account.name}`}
			items={[
				{
					icon: WalletCards,
					label: account.paymentActionLabel,
					onSelect: onPay,
					type: "button",
				},
				{
					icon: Ban,
					label: "Cancel",
					onSelect: onCancelSubscription,
					tone: "danger",
					type: "button",
				},
			]}
		/>
	);
}
