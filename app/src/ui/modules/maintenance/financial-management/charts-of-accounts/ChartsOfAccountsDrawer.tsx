"use client";

import { useState } from "react";
import { ChartsOfAccountsDrawerTabs } from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import {
	EmptyAccountFormValues,
	EmptyBankDetails,
	accountToFormValues,
} from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsData";
import type {
	BankDetailsKey,
	ChartAccount,
	ChartAccountFormValues,
	ChartsOfAccountsFormTab,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import { ChartsOfAccountsForm } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsForm";
import {
	Button,
	Tabs,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";

type ChartsOfAccountsDrawerProps = {
	account: ChartAccount | null;
	accounts: ChartAccount[];
	isOpen: boolean;
	onClose: () => void;
	onSave: (values: ChartAccountFormValues) => void;
};

export function ChartsOfAccountsDrawer({
	account,
	accounts,
	isOpen,
	onClose,
	onSave,
}: ChartsOfAccountsDrawerProps) {
	return (
		<DrawerPanel
			key={account?.id ?? "new-account"}
			account={account}
			accounts={accounts}
			isOpen={isOpen}
			onClose={onClose}
			onSave={onSave}
		/>
	);
}

function DrawerPanel({
	account,
	accounts,
	isOpen,
	onClose,
	onSave,
}: ChartsOfAccountsDrawerProps) {
	const [activeTab, setActiveTab] = useState<ChartsOfAccountsFormTab>(
		"Account Information",
	);
	const [values, setValues] = useState<ChartAccountFormValues>(() =>
		account ? accountToFormValues(account) : EmptyAccountFormValues,
	);
	const [submitted, setSubmitted] = useState(false);

	const showBankDetails = values.accountCategory === "Cash in Bank";
	const tabs: ChartsOfAccountsFormTab[] = showBankDetails
		? ChartsOfAccountsDrawerTabs
		: ["Account Information"];

	function updateField<Key extends keyof ChartAccountFormValues>(
		key: Key,
		value: ChartAccountFormValues[Key],
	) {
		setValues((current) => ({ ...current, [key]: value }));
	}

	function updateBankField(key: BankDetailsKey, value: string) {
		setValues((current) => ({
			...current,
			bankDetails: {
				...(current.bankDetails ?? EmptyBankDetails),
				[key]: value,
			},
		}));
	}

	function handleSubmit() {
		setSubmitted(true);
		if (!values.accountNumber || !values.accountName) {
			return;
		}
		onSave(values);
	}

	return (
		<ModuleDrawer
			isOpen={isOpen}
			eyebrow={account ? "Edit ledger account" : "Create ledger account"}
			title={account ? account.accountName : "Add Account"}
			description="Configure reporting, hierarchy, and bank setup."
			onClose={onClose}
			footer={
				<div className="flex items-center justify-end gap-2">
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit}>
						{account ? "Save Changes" : "Create Account"}
					</Button>
				</div>
			}
		>
			<div className="border-b border-darknavy/10 px-6 py-4">
				<Tabs value={activeTab} options={tabs} onChange={setActiveTab} />
			</div>

			<ChartsOfAccountsForm
				account={account}
				accounts={accounts}
				activeTab={activeTab}
				submitted={submitted}
				values={values}
				onBankFieldChange={updateBankField}
				onFieldChange={updateField}
			/>
		</ModuleDrawer>
	);
}
