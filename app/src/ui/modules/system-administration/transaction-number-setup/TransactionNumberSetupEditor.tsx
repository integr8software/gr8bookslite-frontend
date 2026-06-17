import type { ChangeEventHandler, FormEventHandler } from "react";
import { RefreshCw, Save } from "lucide-react";
import {
	TransactionNumberInputModeOptions,
	TransactionNumberScopeOptions,
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
				Select a module to configure its numbering.
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
						Selected module
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
	values,
	onInputChange,
}: {
	errors: TransactionNumberSetupFormErrors;
	nextNumberPreview: string;
	values: TransactionNumberSetupFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
}) {
	const isManualMode = values.inputMode === "Manual";

	return (
		<section className="rounded-md border border-darknavy/10 p-4">
			<div className="grid gap-4 md:grid-cols-2">
				<TransactionNumberSetupField
					label="Branches"
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
					label="Mode"
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
						disabled={isManualMode}
						className={`${transactionNumberFieldClassName} font-mono`}
					/>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField label="Suffix" error={errors.suffix}>
					<input
						name="suffix"
						value={values.suffix}
						onChange={onInputChange}
						disabled={isManualMode}
						className={`${transactionNumberFieldClassName} font-mono`}
					/>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField label="Digit" error={errors.padding}>
					<input
						name="padding"
						inputMode="numeric"
						pattern="[0-9]*"
						value={values.padding}
						onChange={onInputChange}
						disabled={isManualMode}
						className={transactionNumberFieldClassName}
					/>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField
					label="Start Record"
					error={errors.startingNumber}
				>
					<input
						name="startingNumber"
						inputMode="numeric"
						pattern="[0-9]*"
						value={values.startingNumber}
						onChange={onInputChange}
						disabled={isManualMode}
						className={transactionNumberFieldClassName}
					/>
				</TransactionNumberSetupField>
				<TransactionNumberSetupField
					label="Next Number Preview"
					className="md:col-span-2"
				>
					<div className="flex min-h-11 items-center rounded-md border border-darknavy/15 bg-offwhite/65 px-3 font-mono text-sm font-semibold text-darknavy">
						{nextNumberPreview}
					</div>
				</TransactionNumberSetupField>
			</div>
		</section>
	);
}
