"use client";

import type { ChangeEventHandler, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import {
	TransactionTypeActionCopy,
	TransactionTypeHref,
	TransactionTypeStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import { useTransactionTypeActionPage } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionTypeActionPage";
import { AppDialog } from "@/app/src/ui/shared/system/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import type {
	TransactionType,
	TransactionTypeActionMode,
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

export function FinancialManagementTransactionTypeAction() {
	const page = useTransactionTypeActionPage();
	const copy = TransactionTypeActionCopy[page.mode];

	if (page.needsRecord && !page.existingTransactionType) {
		return <TransactionTypeNotFound />;
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
							<Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
							Accounting master data
						</>
					}
					actions={
						<TransactionTypeActionButtons
							isReadonly={page.isReadonly}
							mode={page.mode}
							transactionType={page.existingTransactionType}
							onDeleteTransactionType={() =>
								page.setIsDeleteDialogOpen(true)
							}
						/>
					}
				/>
				<TransactionTypeDetailsFields
					errors={page.errors}
					isReadonly={page.isReadonly}
					values={page.values}
					onInputChange={page.handleInputChange}
				/>
			</form>
			<AppDialog
				isOpen={page.isDeleteDialogOpen}
				isPending={page.isMutating}
				title="Delete transaction type?"
				description={`This will remove ${page.existingTransactionType?.description ?? "the selected transaction type"}.`}
				confirmLabel="Delete Transaction Type"
				tone="danger"
				onCancel={() => page.setIsDeleteDialogOpen(false)}
				onConfirm={page.handleConfirmDelete}
			/>
		</>
	);
}

function TransactionTypeActionButtons({
	transactionType,
	isReadonly,
	mode,
	onDeleteTransactionType,
}: {
	transactionType?: TransactionType;
	isReadonly: boolean;
	mode: TransactionTypeActionMode;
	onDeleteTransactionType: () => void;
}) {
	return (
		<>
			{mode === "view" ? (
				<Link href={TransactionTypeHref} className={moduleHeaderActionClassNames.secondary}>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			) : null}
			{mode === "view" && transactionType ? (
				<Link
					href={`${TransactionTypeHref}/edit/${transactionType.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{transactionType ? (
				<button type="button" onClick={onDeleteTransactionType} className={moduleHeaderActionClassNames.danger}>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Delete
				</button>
			) : null}
			{mode === "edit" && transactionType ? (
				<Link href={`${TransactionTypeHref}/view/${transactionType.id}`} className={moduleHeaderActionClassNames.secondary}>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button type="submit" className={moduleHeaderActionClassNames.primary}>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Transaction Type
				</button>
			) : null}
		</>
	);
}

function TransactionTypeDetailsFields({
	errors,
	isReadonly,
	values,
	onInputChange,
}: {
	errors: TransactionTypeFormErrors;
	isReadonly: boolean;
	values: TransactionTypeFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
}) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-3">
				<Field label="Type" error={errors.type} required>
					<input
						name="type"
						value={values.type}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter code"
					/>
				</Field>

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

				<Field label="Account Code" error={errors.accountCode} required>
					<input
						name="accountCode"
						value={values.accountCode}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter account code"
					/>
				</Field>

				<Field label="Account Title" error={errors.accountTitle} required>
					<input
						name="accountTitle"
						value={values.accountTitle}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter account title"
					/>
				</Field>

				<Field label="Status" error={errors.status}>
					<select
						name="status"
						value={values.status}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{TransactionTypeStatusOptions.map((statusOption) => (
							<option key={statusOption} value={statusOption}>
								{statusOption}
							</option>
						))}
					</select>
				</Field>
			</div>
		</div>
	);
}

function TransactionTypeNotFound() {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<h2 className="text-lg font-semibold text-darknavy">Transaction type not found</h2>
			<p className="mt-2 text-sm text-darknavy/65">
				The requested transaction type record does not exist or has already been removed.
			</p>
		</div>
	);
}

function Field({
	children,
	className,
	error,
	label,
	required,
}: {
	children: ReactNode;
	className?: string;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label className={className}>
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

