"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
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
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls.tsx";

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
		<AnimatePresence>
			{isOpen ? (
				<DrawerPanel
					key={account?.id ?? "new-account"}
					account={account}
					accounts={accounts}
					onClose={onClose}
					onSave={onSave}
				/>
			) : null}
		</AnimatePresence>
	);
}

function DrawerPanel({
	account,
	accounts,
	onClose,
	onSave,
}: Omit<ChartsOfAccountsDrawerProps, "isOpen">) {
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
		<>
			<motion.button
				type="button"
				aria-label="Close drawer overlay"
				className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
			/>
			<motion.aside
				role="dialog"
				aria-modal="true"
				aria-label={account ? "Edit account" : "Add account"}
				className="fixed bottom-0 right-0 top-0 z-[60] flex w-full max-w-2xl flex-col bg-white shadow-[-30px_0_70px_rgba(15,23,42,0.22)]"
				initial={{ x: "100%" }}
				animate={{ x: 0 }}
				exit={{ x: "100%" }}
				transition={{ type: "spring", damping: 32, stiffness: 260 }}
			>
				<DrawerHeader account={account} onClose={onClose} />

				<div className="border-b border-slate-200 px-6 py-4">
					<Tabs
						value={activeTab}
						options={tabs}
						onChange={setActiveTab}
					/>
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

				<div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit}>
						{account ? "Save Changes" : "Create Account"}
					</Button>
				</div>
			</motion.aside>
		</>
	);
}

function DrawerHeader({
	account,
	onClose,
}: {
	account: ChartAccount | null;
	onClose: () => void;
}) {
	return (
		<div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
			<div>
				<p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
					{account ? "Edit ledger account" : "Create ledger account"}
				</p>
				<h2 className="mt-1 text-xl font-semibold text-slate-950">
					{account ? account.accountName : "Add Account"}
				</h2>
				<p className="mt-1 text-sm text-slate-500">
					Configure reporting, hierarchy, and bank setup.
				</p>
			</div>
			<Button
				variant="ghost"
				size="icon"
				aria-label="Close drawer"
				onClick={onClose}
			>
				<X className="h-5 w-5" aria-hidden="true" />
			</Button>
		</div>
	);
}
