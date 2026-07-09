"use client";

import {
	DefaultAccountActionCopy,
	DefaultAccountDrawerFormId,
	DefaultAccountStatusOptions,
	DefaultAccountTitle,
	DefaultAccountTypeOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/default-account/DefaultAccountConstants";
import { useDefaultAccountFormPage } from "@/app/src/hooks/modules/maintenance/default-account/useDefaultAccountFormPage";
import type { DefaultAccountDrawerProps } from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

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
	const copy = DefaultAccountActionCopy[mode];
	const expenseParentOptions: AppAdvancedDropdownOption[] =
		page.expenseParentOptions.map((account) => ({
			value: account.id,
			name: account.accountTitle,
			label: account.accountCode,
			description: account.accountLevel.replaceAll("_", " "),
		}));

	return (
		<MaintenanceFormDrawer
			description={copy.description}
			eyebrow={DefaultAccountTitle}
			formId={DefaultAccountDrawerFormId}
			isOpen={isOpen}
			isReadonly={page.isReadonly}
			isSaving={page.isSubmitting}
			onClose={onClose}
			savingLabel={
				mode === "edit"
					? "Updating Default Account..."
					: "Saving Default Account..."
			}
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
							options={expenseParentOptions}
							placeholder={
								page.isLoadingExpenseParentOptions
									? "Loading expense accounts..."
									: "Default expense parent"
							}
							searchPlaceholder="Search expense accounts"
							showSelectedDetails
							onChange={page.handleExpenseParentChange}
						/>
					</label>
				) : null}
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-darknavy">Status</span>
					<select
						name="status"
						value={page.values.status}
						disabled={page.isReadonly}
						onChange={page.handleInputChange}
						className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
					>
						{DefaultAccountStatusOptions.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
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
		</MaintenanceFormDrawer>
	);
}
