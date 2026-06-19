import type {
	ChangeEventHandler,
	ClipboardEventHandler,
	KeyboardEventHandler,
	ReactNode,
} from "react";
import {
	TermManagementDatemodeOptions,
	TermManagementStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type {
	TermManagementFormErrors,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

type TermManagementFieldsProps = {
	errors: TermManagementFormErrors;
	isReadonly: boolean;
	values: TermManagementFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
};

export function TermManagementFields({
	errors,
	isReadonly,
	values,
	onInputChange,
}: TermManagementFieldsProps) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-2">
				<FormField label="Name" error={errors.name} className="lg:col-span-2" required>
					<input
						name="name"
						value={values.name}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter name"
					/>
				</FormField>

				<FormField
					label="Description"
					error={errors.description}
					className="lg:col-span-2"
				>
					<textarea
						name="description"
						maxLength={500}
						value={values.description}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={`${fieldClassName} min-h-24 resize-y py-3`}
						placeholder="Enter description"
					/>
				</FormField>

				<FormField label="Datemode" error={errors.datemode} required>
					<select
						name="datemode"
						value={values.datemode}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{TermManagementDatemodeOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</FormField>

				<FormField
					label="Period"
					error={errors.period}
					warning={
						values.period.trim() === "0"
							? "Period is 0. Save only if this term should not add time."
							: undefined
					}
					required
				>
					<input
						name="period"
						type="number"
						min={0}
						step={1}
						value={values.period}
						onChange={onInputChange}
						onKeyDown={preventNonWholeNumberInput}
						onPaste={preventNonWholeNumberPaste}
						onWheel={(event) => event.currentTarget.blur()}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter period"
					/>
				</FormField>

				<FormField label="Status" error={errors.status} required>
					<select
						name="status"
						value={values.status}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{TermManagementStatusOptions.map((statusOption) => (
							<option key={statusOption} value={statusOption}>
								{statusOption}
							</option>
						))}
					</select>
				</FormField>
			</div>
		</div>
	);
}

function FormField({
	children,
	className,
	error,
	label,
	required,
	warning,
}: {
	children: ReactNode;
	className?: string;
	error?: string;
	label: string;
	required?: boolean;
	warning?: string;
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
			) : warning ? (
				<span className="mt-1 block text-xs font-medium text-amber-600">
					{warning}
				</span>
			) : null}
		</label>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";

const blockedPeriodKeys = new Set(["e", "E", "+", "-", "."]);

const preventNonWholeNumberInput: KeyboardEventHandler<HTMLInputElement> = (
	event,
) => {
	if (blockedPeriodKeys.has(event.key)) {
		event.preventDefault();
	}
};

const preventNonWholeNumberPaste: ClipboardEventHandler<HTMLInputElement> = (
	event,
) => {
	const pastedText = event.clipboardData.getData("text");

	if (!/^\d+$/.test(pastedText.trim())) {
		event.preventDefault();
	}
};
