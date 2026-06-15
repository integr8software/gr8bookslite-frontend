import type { ChangeEventHandler, FormEventHandler } from "react";
import { RefreshCw, Save } from "lucide-react";
import {
	TransactionNumberInputModeOptions,
	TransactionNumberScopeOptions,
	TransactionNumberStatusOptions,
} from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import type {
	TransactionNumberSetupFormErrors,
	TransactionNumberSetupFormValues,
	TransactionNumberSetupRecord,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";
import { TransactionNumberSetupBranchPicker } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupBranchPicker";
import { TransactionNumberSetupEditorSkeleton } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupEditorSkeleton";
import {
	TransactionNumberSetupField,
	transactionNumberFieldClassName,
	transactionNumberPrimaryButtonClassName,
} from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupUi";

type TransactionNumberSetupEditorProps = {
	branchOptions: Array<{ code: string; id: string; name: string }>;
	errors: TransactionNumberSetupFormErrors;
	isLoading: boolean;
	isMutating: boolean;
	nextNumberPreview: string;
	selectedSetup?: TransactionNumberSetupRecord;
	values: TransactionNumberSetupFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onSubmit: FormEventHandler<HTMLFormElement>;
	onToggleBranch: (branchId: string) => void;
};

export function TransactionNumberSetupEditor({
	branchOptions,
	errors,
	isLoading,
	isMutating,
	nextNumberPreview,
	selectedSetup,
	values,
	onInputChange,
	onSubmit,
	onToggleBranch,
}: TransactionNumberSetupEditorProps) {
	if (isLoading) {
		return <TransactionNumberSetupEditorSkeleton />;
	}

	if (!selectedSetup) {
		return (
			<div className="flex min-h-96 items-center justify-center p-6 text-sm font-medium text-darknavy/55">
				Select a transaction type to configure its sequence.
			</div>
		);
	}

	return (
		<form
			onSubmit={onSubmit}
			className="grid content-start gap-5 p-4 lg:p-5"
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
						Selected transaction
					</p>
					<h2 className="mt-1 text-xl font-semibold text-darknavy">
						{selectedSetup.moduleName}
					</h2>
				</div>
				<button
					type="submit"
					disabled={isLoading || isMutating}
					className={transactionNumberPrimaryButtonClassName}
				>
					{isMutating ? (
						<RefreshCw
							className="h-4 w-4 animate-spin"
							aria-hidden="true"
						/>
					) : (
						<Save className="h-4 w-4" aria-hidden="true" />
					)}
					Update
				</button>
			</div>

			<div className="flex flex-col gap-5">
				<TransactionNumberSetupNumberingSection
					errors={errors}
					nextNumberPreview={nextNumberPreview}
					selectedSetup={selectedSetup}
					values={values}
					onInputChange={onInputChange}
				/>

				<TransactionNumberSetupBranchPicker
					branchOptions={branchOptions}
					scope={values.scope}
					selectedBranchIds={values.branchIds}
					onToggleBranch={onToggleBranch}
				/>
			</div>
		</form>
	);
}

function TransactionNumberSetupNumberingSection({
	errors,
	nextNumberPreview,
	selectedSetup,
	values,
	onInputChange,
}: {
	errors: TransactionNumberSetupFormErrors;
	nextNumberPreview: string;
	selectedSetup: TransactionNumberSetupRecord;
	values: TransactionNumberSetupFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
}) {
	return (
		<section className="rounded-md border border-darknavy/10 p-4">
			<div className="mb-4">
				<h3 className="text-sm font-semibold text-darknavy">
					Numbering setup
				</h3>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<TransactionNumberSetupField label="Transaction Type">
					<input
						value={selectedSetup.prefix}
						readOnly
						className={`${transactionNumberFieldClassName} bg-offwhite/65 font-mono`}
					/>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField
					label="Branch"
					error={errors.branchIds}
				>
					<select
						name="scope"
						value={values.scope}
						onChange={onInputChange}
						className={transactionNumberFieldClassName}
					>
						{TransactionNumberScopeOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField
					label="Numbering"
					error={errors.inputMode}
				>
					<select
						name="inputMode"
						value={values.inputMode}
						onChange={onInputChange}
						className={transactionNumberFieldClassName}
					>
						{TransactionNumberInputModeOptions.map((mode) => (
							<option key={mode} value={mode}>
								{mode}
							</option>
						))}
					</select>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField label="Prefix" error={errors.prefix}>
					<input
						name="prefix"
						value={values.prefix}
						onChange={onInputChange}
						className={`${transactionNumberFieldClassName} font-mono`}
					/>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField label="Digits" error={errors.padding}>
					<input
						name="padding"
						type="number"
						min={1}
						max={12}
						value={values.padding}
						onChange={onInputChange}
						className={transactionNumberFieldClassName}
					/>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField
					label="Start Record"
					error={errors.startingNumber}
				>
					<input
						name="startingNumber"
						type="number"
						min={0}
						value={values.startingNumber}
						onChange={onInputChange}
						className={transactionNumberFieldClassName}
					/>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField label="Status" error={errors.status}>
					<select
						name="status"
						value={values.status}
						onChange={onInputChange}
						className={transactionNumberFieldClassName}
					>
						{TransactionNumberStatusOptions.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField label="Next Number Preview">
					<div className="flex min-h-11 items-center rounded-md border border-darknavy/15 bg-offwhite/65 px-3 font-mono text-sm font-semibold text-darknavy">
						{nextNumberPreview}
					</div>
				</TransactionNumberSetupField>
			</div>
		</section>
	);
}
