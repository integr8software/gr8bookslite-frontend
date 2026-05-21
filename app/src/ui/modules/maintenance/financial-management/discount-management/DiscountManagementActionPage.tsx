"use client";

import type { ChangeEventHandler, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Percent, Save, Trash2, X } from "lucide-react";
import { DiscountManagementHref } from "@/app/src/data/modules/maintenance/financial-management/discount-management/DiscountManagementData";
import { useDiscountManagementActionPage } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagementActionPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import type {
	Discount,
	DiscountManagementActionMode,
	DiscountManagementFormErrors,
	DiscountManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";

const actionCopy = {
	add: {
		title: "Add Discount",
		description: "Create a discount and map it to the right chart account.",
	},
	edit: {
		title: "Edit Discount",
		description: "Update the discount percentage and account mapping.",
	},
	view: {
		title: "View Discount",
		description: "Review the configured discount details before making changes.",
	},
} as const;

export function DiscountManagementActionPage() {
	const page = useDiscountManagementActionPage();
	const copy = actionCopy[page.mode];

	if (page.needsRecord && !page.existingDiscount) {
		return <DiscountManagementNotFound />;
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={copy.title}
					description={copy.description}
					eyebrow={
						<>
							<Percent className="h-3.5 w-3.5" aria-hidden="true" />
							Accounting master data
						</>
					}
					actions={
						<DiscountManagementActionButtons
							discount={page.existingDiscount}
							isReadonly={page.isReadonly}
							mode={page.mode}
							onDeleteDiscount={() => page.setIsDeleteDialogOpen(true)}
						/>
					}
				/>
				<DiscountManagementFields
					accountQuery={page.accountQuery}
					errors={page.errors}
					isReadonly={page.isReadonly}
					matchedAccounts={page.matchedAccounts}
					selectedAccount={page.selectedAccount}
					values={page.values}
					onAccountQueryChange={page.handleAccountQueryChange}
					onInputChange={page.handleInputChange}
					onSelectAccount={page.handleSelectAccount}
				/>
			</form>

			<AppConfirmDialog
				isOpen={page.isDeleteDialogOpen}
				isPending={page.isMutating}
				title="Delete discount?"
				description={`This will remove ${page.existingDiscount?.description ?? "the selected discount"}.`}
				confirmLabel="Delete"
				tone="danger"
				onCancel={() => page.setIsDeleteDialogOpen(false)}
				onConfirm={page.handleConfirmDelete}
			/>
		</>
	);
}

function DiscountManagementActionButtons({
	discount,
	isReadonly,
	mode,
	onDeleteDiscount,
}: {
	discount?: Discount;
	isReadonly: boolean;
	mode: DiscountManagementActionMode;
	onDeleteDiscount: () => void;
}) {
	return (
		<>
			{mode === "view" ? (
				<Link
					href={DiscountManagementHref}
					className={moduleHeaderActionClassNames.secondary}
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			) : null}
			{mode === "view" && discount ? (
				<Link
					href={`${DiscountManagementHref}/edit/${discount.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{discount ? (
				<button
					type="button"
					onClick={onDeleteDiscount}
					className={moduleHeaderActionClassNames.danger}
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Delete
				</button>
			) : null}
			{mode === "edit" && discount ? (
				<Link
					href={`${DiscountManagementHref}/view/${discount.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button type="submit" className={moduleHeaderActionClassNames.primary}>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Discount
				</button>
			) : null}
		</>
	);
}

function DiscountManagementFields({
	accountQuery,
	errors,
	isReadonly,
	matchedAccounts,
	selectedAccount,
	values,
	onAccountQueryChange,
	onInputChange,
	onSelectAccount,
}: {
	accountQuery: string;
	errors: DiscountManagementFormErrors;
	isReadonly: boolean;
	matchedAccounts: ChartAccount[];
	selectedAccount?: ChartAccount;
	values: DiscountManagementFormValues;
	onAccountQueryChange: ChangeEventHandler<HTMLInputElement>;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	onSelectAccount: (account: ChartAccount) => void;
}) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-2">
				<Field label="Description" error={errors.description} required>
					<input
						name="description"
						value={values.description}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter description"
					/>
				</Field>

				<Field label="Discount Percentage" error={errors.percentage} required>
					<input
						name="percentage"
						type="number"
						min="0"
						max="100"
						step="0.01"
						value={values.percentage}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter percentage"
					/>
				</Field>

				<Field label="Account Code">
					<input
						value={selectedAccount?.accountNumber ?? ""}
						readOnly
						className={fieldClassName}
						placeholder="Select an account"
					/>
				</Field>

				<Field label="Account Title" error={errors.accountId} required>
					<div className="relative">
						<input
							value={accountQuery}
							onChange={onAccountQueryChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="Search account by name or number"
						/>
						{matchedAccounts.length > 0 ? (
							<ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-darknavy/10 bg-white text-sm shadow-md">
								{matchedAccounts.map((account) => (
									<li key={account.id}>
										<button
											type="button"
											onClick={() => onSelectAccount(account)}
											className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-darknavy transition hover:bg-skyblue/10"
										>
											<span>{account.accountName}</span>
											<span className="text-xs text-darknavy/50">
												{account.accountNumber}
											</span>
										</button>
									</li>
								))}
							</ul>
						) : null}
					</div>
				</Field>
			</div>
		</div>
	);
}

function DiscountManagementNotFound() {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<h2 className="text-lg font-semibold text-darknavy">
				Discount not found
			</h2>
			<p className="mt-2 text-sm text-darknavy/65">
				The requested discount record does not exist or has already been
				removed.
			</p>
		</div>
	);
}

function Field({
	children,
	error,
	label,
	required,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
