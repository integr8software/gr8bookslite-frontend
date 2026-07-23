"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
	DefaultAccountActionCopy,
	DefaultAccountDrawerFormId,
	DefaultAccountTitle,
	DefaultAccountTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import { EmptyBankDetails } from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsDefaults";
import { useDefaultAccountFormPage } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccountFormPage";
import {
	FetchNextChartAccountCode,
	SaveChartAccount,
} from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import type {
	AccountLevel,
	ChartAccountFormValues,
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type {
	DefaultAccountDrawerProps,
	DefaultAccountExpenseParentOption,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { AnimatedPendingLabel } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

export function DefaultAccountDrawer({
	defaultAccount,
	isOpen,
	mode,
	onClose,
}: DefaultAccountDrawerProps) {
	return (
		<DefaultAccountDrawerPanel
			key={`${mode}-${defaultAccount?.id ?? "new"}`}
			defaultAccount={defaultAccount}
			isOpen={isOpen}
			mode={mode}
			onClose={onClose}
		/>
	);
}

function DefaultAccountDrawerPanel({
	defaultAccount,
	isOpen,
	mode,
	onClose,
}: DefaultAccountDrawerProps) {
	const page = useDefaultAccountFormPage({
		existingDefaultAccount: defaultAccount,
		mode,
		onSaved: onClose,
	});
	const [expenseSubAccountDialog, setExpenseSubAccountDialog] =
		useState<ExpenseSubAccountDialogState>(null);
	const copy = DefaultAccountActionCopy[mode];
	const expenseParentOptions: AppAdvancedDropdownOption[] =
		page.expenseParentOptions.map((account) => ({
			value: account.id,
			name: account.accountTitle,
			label: account.accountCode,
			description: account.accountLevel.replaceAll("_", " "),
		}));
	const selectedExpenseParentId =
		page.values.expenseParentCoaId || page.expenseParentOptions[0]?.id || "";
	const selectedExpenseParentAccount = useMemo(
		() =>
			page.expenseParentOptions.find(
				(account) => account.id === selectedExpenseParentId,
			) ?? null,
		[page.expenseParentOptions, selectedExpenseParentId],
	);
	const nextExpenseSubAccountLevel = getExpenseSubAccountLevel(
		selectedExpenseParentAccount?.accountLevel,
	);
	const canAddExpenseTypeSubAccount =
		!page.isReadonly &&
		page.values.type === "EXPENSE" &&
		Boolean(selectedExpenseParentAccount && nextExpenseSubAccountLevel);

	return (
		<>
			<ModuleDrawer
				description={copy.description}
				eyebrow={DefaultAccountTitle}
				formId={DefaultAccountDrawerFormId}
				isOpen={isOpen}
				isReadonly={page.isReadonly}
				isSaving={page.isSubmitting}
				onBeforeSaveConfirm={page.validateBeforeSubmit}
				onClose={onClose}
				savingLabel={getModuleSavePendingLabel(mode)}
				submitLabel={mode === "edit" ? "Update Default Account" : "Save Default Account"}
				title={copy.title}
			>
				<form id={DefaultAccountDrawerFormId} onSubmit={page.handleSubmit} className="grid gap-5 px-6 py-5">
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-darknavy">
						Default Account Name <span className="text-coralpink">*</span>
					</span>
					<input
						name="defaultAccountName"
						value={page.values.defaultAccountName}
						disabled={page.isReadonly}
						onChange={page.handleInputChange}
						placeholder="Office Supplies"
						className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
					/>
					{page.errors.defaultAccountName ? (
						<span className="text-xs font-semibold text-coralpink">
							{page.errors.defaultAccountName}
						</span>
					) : null}
				</label>
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-darknavy">Description</span>
					<textarea
						name="description"
						value={page.values.description}
						disabled={page.isReadonly}
						onChange={page.handleInputChange}
						placeholder="Optional notes for this default account"
						rows={3}
						className="min-h-24 resize-none rounded-md border border-darknavy/10 bg-white px-3 py-2 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
					/>
				</label>
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-darknavy">
						Type <span className="text-coralpink">*</span>
					</span>
					<select
						name="type"
						value={page.values.type}
						disabled={page.isReadonly || mode === "edit"}
						onChange={page.handleInputChange}
						className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
					>
						{DefaultAccountTypeOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</label>
				{page.values.type === "EXPENSE" ? (
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">
							Expense Parent
						</span>
						<AppAdvancedDropdown
							value={page.values.expenseParentCoaId}
							disabled={page.isReadonly || page.isLoadingExpenseParentOptions}
							addAction={{
								disabled: !canAddExpenseTypeSubAccount,
								label: "Add Expense Type Sub Account",
								onClick: () => {
									if (selectedExpenseParentAccount && nextExpenseSubAccountLevel) {
										setExpenseSubAccountDialog({
											accountLevel: nextExpenseSubAccountLevel,
											parentAccount: selectedExpenseParentAccount,
										});
									}
								},
							}}
							options={expenseParentOptions}
							placeholder={
								page.isLoadingExpenseParentOptions
									? "Loading expense accounts..."
									: "--Select Expense Parent--"
							}
							searchPlaceholder="Search expense accounts"
							onChange={page.handleExpenseParentChange}
						/>
					</label>
				) : null}
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-darknavy">Status</span>
					<AppSwitch
						falseOption={MaintenanceInactiveStatusSwitchOption}
						value={page.values.status}
						readOnly={page.isReadonly}
						onChange={page.handleStatusChange}
						trueOption={MaintenanceActiveStatusSwitchOption}
					/>
				</label>
				{defaultAccount?.generatedAccounts.length ? (
					<div className="grid gap-3 border-t border-darknavy/10 pt-5">
						<h3 className="text-sm font-semibold text-darknavy">
							Generated Chart of Accounts
						</h3>
						<div className="grid gap-2">
							{defaultAccount.generatedAccounts.map((account) => (
								<div
									key={`${account.role}-${account.chartAccountId}`}
									className="rounded-md border border-darknavy/10 bg-darknavy/[0.02] p-3"
								>
									<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
										{account.role.replaceAll("_", " ")}
									</p>
									<p className="mt-1 text-sm font-semibold text-darknavy">
										{account.accountCode} - {account.accountTitle}
									</p>
								</div>
							))}
						</div>
					</div>
				) : null}
				</form>
			</ModuleDrawer>
			<ExpenseSubAccountDialog
				accountLevel={expenseSubAccountDialog?.accountLevel ?? null}
				isOpen={Boolean(expenseSubAccountDialog)}
				parentAccount={expenseSubAccountDialog?.parentAccount ?? null}
				onClose={() => setExpenseSubAccountDialog(null)}
				onSaved={async (accountId) => {
					await page.refreshExpenseParentOptions();
					page.handleExpenseParentChange(accountId);
					setExpenseSubAccountDialog(null);
				}}
			/>
		</>
	);
}

type ExpenseSubAccountDialogState = {
	accountLevel: AccountLevel;
	parentAccount: DefaultAccountExpenseParentOption;
} | null;

function ExpenseSubAccountDialog({
	accountLevel,
	closeOnBackdrop = true,
	closeOnEscape = true,
	isOpen,
	parentAccount,
	onClose,
	onSaved,
}: {
	accountLevel: AccountLevel | null;
	closeOnBackdrop?: boolean;
	closeOnEscape?: boolean;
	isOpen: boolean;
	parentAccount: DefaultAccountExpenseParentOption | null;
	onClose: () => void;
	onSaved: (accountId: string) => Promise<void>;
}) {
	const [accountCode, setAccountCode] = useState("");
	const [accountName, setAccountName] = useState("");
	const [error, setError] = useState("");
	const [isCodeLoading, setIsCodeLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const isPending = isCodeLoading || isSaving;

	useEffect(() => {
		if (!isOpen || !parentAccount || !accountLevel) {
			return;
		}

		let isCurrent = true;
		const timeoutId = window.setTimeout(() => {
			setAccountCode("");
			setAccountName("");
			setError("");
			setIsCodeLoading(true);

			FetchNextChartAccountCode({
				accountLevel,
				parentAccountId: parentAccount.id,
			})
				.then((nextCode) => {
					if (isCurrent) {
						setAccountCode(nextCode);
					}
				})
				.catch((caughtError: unknown) => {
					if (isCurrent) {
						setError(getErrorMessage(caughtError, "Could not generate the next code."));
					}
				})
				.finally(() => {
					if (isCurrent) {
						setIsCodeLoading(false);
					}
				});
		});

		return () => {
			isCurrent = false;
			window.clearTimeout(timeoutId);
		};
	}, [accountLevel, isOpen, parentAccount]);

	const handleSave = useCallback(async () => {
		const trimmedName = accountName.trim();

		if (!trimmedName) {
			setError("Expense Sub Account Name is required.");
			return;
		}

		if (!parentAccount || !accountLevel) {
			setError("Select an expense parent before adding a sub account.");
			return;
		}

		setIsSaving(true);
		setError("");

		try {
			const savedAccount = await SaveChartAccount(
				createExpenseSubAccountValues({
					accountCode,
					accountLevel,
					accountName: trimmedName,
					parentAccount,
				}),
			);

			await onSaved(savedAccount.id);
			toast.success("Expense type saved.");
		} catch (caughtError) {
			setError(getErrorMessage(caughtError, "Could not save the expense sub account."));
		} finally {
			setIsSaving(false);
		}
	}, [accountCode, accountLevel, accountName, onSaved, parentAccount]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape" && closeOnEscape && !isPending) {
				onClose();
				return;
			}

			if (event.key === "Enter" && !isPending && accountCode) {
				event.preventDefault();
				void handleSave();
			}
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [accountCode, closeOnEscape, handleSave, isOpen, isPending, onClose]);

	if (!isOpen || !parentAccount || !accountLevel) {
		return null;
	}

	return (
		<div
			role="presentation"
			className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/20 px-4 py-6 backdrop-blur-[1px]"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget && closeOnBackdrop && !isPending) {
					onClose();
				}
			}}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="expense-sub-account-dialog-title"
				className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-5 shadow-[0_28px_90px_rgba(33,39,56,0.24)]"
			>
				<h2
					id="expense-sub-account-dialog-title"
					className="text-base font-semibold text-darknavy"
				>
					Add Expense Type
				</h2>
				<div className="mt-5 grid gap-4">
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">
							Expense Sub Account Name <span className="text-coralpink">*</span>
						</span>
						<input
							value={accountName}
							disabled={isPending}
							onChange={(event) => setAccountName(event.target.value)}
							placeholder="Meals and representation"
							className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
						/>
					</label>
				</div>
				{error ? (
					<p className="mt-4 rounded-md border border-coralpink/20 bg-coralpink/5 px-3 py-2 text-sm font-semibold text-coralpink">
						{error}
					</p>
				) : null}
				<div className="mt-5 flex justify-end gap-2">
					<button
						type="button"
						disabled={isPending}
						onClick={onClose}
						className="inline-flex h-10 min-w-28 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						Cancel
					</button>
					<button
						type="button"
						disabled={isPending || !accountCode}
						onClick={() => void handleSave()}
						className="app-dialog-primary-button inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						{isSaving ? <AnimatedPendingLabel label="Saving..." /> : "Save"}
					</button>
				</div>
			</section>
		</div>
	);
}

function createExpenseSubAccountValues({
	accountCode,
	accountLevel,
	accountName,
	parentAccount,
}: {
	accountCode: string;
	accountLevel: AccountLevel;
	accountName: string;
	parentAccount: DefaultAccountExpenseParentOption;
}): ChartAccountFormValues {
	return {
		accountNumber: accountCode,
		accountName,
		accountLevel,
		accountType: "EXPENSE",
		parentId: parentAccount.id,
		normalBalance: "DEBIT",
		statementGroup: "Income Statement",
		statementSection: "Income Statement",
		reportAlias: "",
		description: "",
		status: "Active",
		showInReports: true,
		isPostingAccount: false,
		isBankLinked: false,
		bankDetails: EmptyBankDetails,
	};
}

function getExpenseSubAccountLevel(parentLevel: string | undefined): AccountLevel | null {
	switch (parentLevel) {
		case "MAJOR":
			return "SUB1";
		case "SUB1":
			return "SUB2";
		case "SUB2":
			return "SUB3";
		default:
			return null;
	}
}

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}



