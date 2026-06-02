import {
	MaterialRequestStatusOptions,
	MaterialRequestWarehouseOptions,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import type {
	MaterialRequestFormErrors,
	MaterialRequestFormValues,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MaterialRequestDetailsPanelProps = {
	errors: MaterialRequestFormErrors;
	isReadonly: boolean;
	updateField: <TKey extends keyof MaterialRequestFormValues>(
		field: TKey,
		value: MaterialRequestFormValues[TKey],
	) => void;
	values: MaterialRequestFormValues;
};

export function MaterialRequestDetailsPanel({
	errors,
	isReadonly,
	updateField,
	values,
}: MaterialRequestDetailsPanelProps) {
	const remainingRemarks = Math.max(0, 250 - values.remarks.length);

	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<div className="grid gap-x-10 gap-y-5 xl:grid-cols-2">
				<div className="grid gap-4">
					<SelectField
						error={errors.fromWarehouse}
						isRequired
						label="Warehouse"
						value={values.fromWarehouse}
						disabled={isReadonly}
						options={MaterialRequestWarehouseOptions}
						onChange={(value) => updateField("fromWarehouse", value)}
					/>
					<Field
						error={errors.requestedBy}
						isRequired
						label="Requestor"
						value={values.requestedBy}
						readOnly={isReadonly}
						onChange={(value) => updateField("requestedBy", value)}
					/>
					<Field
						error={errors.vceCode}
						isRequired
						label="VCE Code"
						value={values.vceCode}
						readOnly={isReadonly}
						onChange={(value) => updateField("vceCode", value)}
					/>
					<Field
						error={errors.vceName}
						isRequired
						label="VCE Name"
						value={values.vceName}
						readOnly={isReadonly}
						onChange={(value) => updateField("vceName", value)}
					/>
					<div>
						<label className="grid gap-2 text-sm font-semibold text-darknavy">
							Remarks
							<textarea
								value={values.remarks}
								readOnly={isReadonly}
								maxLength={250}
								onChange={(event) =>
									updateField("remarks", event.target.value)
								}
								rows={4}
								className={fieldClassName("min-h-28 py-2")}
							/>
						</label>
						<p className="mt-1 text-xs font-medium text-darknavy/55">
							Characters remaining: {remainingRemarks}
						</p>
					</div>
				</div>

				<div className="grid content-start gap-4">
					<Field
						error={errors.requestNo}
						isRequired
						label="MR No."
						value={values.requestNo}
						readOnly={isReadonly}
						onChange={(value) => updateField("requestNo", value)}
					/>
					<Field
						error={errors.documentDate}
						label="Document Date"
						type="date"
						value={values.documentDate}
						readOnly={isReadonly}
						onChange={(value) => updateField("documentDate", value)}
					/>
					<SelectField
						error={errors.status}
						label="Status"
						value={values.status}
						disabled={isReadonly}
						options={MaterialRequestStatusOptions}
						onChange={(value) => updateField("status", value)}
					/>
					<Field
						label="Project Ref"
						value={values.projectRef}
						readOnly={isReadonly}
						onChange={(value) => updateField("projectRef", value)}
					/>
					<Field
						label="Project Name"
						value={values.projectName}
						readOnly={isReadonly}
						onChange={(value) => updateField("projectName", value)}
					/>
					<Field
						error={errors.toWarehouse}
						isRequired
						label="To Warehouse"
						value={values.toWarehouse}
						readOnly={isReadonly}
						onChange={(value) => updateField("toWarehouse", value)}
					/>
					<Field
						error={errors.purpose}
						isRequired
						label="Purpose"
						value={values.purpose}
						readOnly={isReadonly}
						onChange={(value) => updateField("purpose", value)}
					/>
				</div>
			</div>
		</div>
	);
}

type FieldProps = {
	error?: string;
	isRequired?: boolean;
	label: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	type?: string;
	value: string;
};

function Field({
	error,
	isRequired = false,
	label,
	onChange,
	readOnly,
	type = "text",
	value,
}: FieldProps) {
	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel isRequired={isRequired}>{label}</FieldLabel>
			<div>
				<input
					type={type}
					value={value}
					readOnly={readOnly}
					onChange={(event) => onChange(event.target.value)}
					className={fieldClassName()}
				/>
				{error ? <ErrorText message={error} /> : null}
			</div>
		</div>
	);
}

type SelectFieldProps<TValue extends string> = {
	disabled: boolean;
	error?: string;
	isRequired?: boolean;
	label: string;
	onChange: (value: TValue) => void;
	options: readonly TValue[];
	value: TValue;
};

function SelectField<TValue extends string>({
	disabled,
	error,
	isRequired = false,
	label,
	onChange,
	options,
	value,
}: SelectFieldProps<TValue>) {
	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel isRequired={isRequired}>{label}</FieldLabel>
			<div>
				<select
					value={value}
					disabled={disabled}
					onChange={(event) => onChange(event.target.value as TValue)}
					className={fieldClassName()}
				>
					{options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				{error ? <ErrorText message={error} /> : null}
			</div>
		</div>
	);
}

function FieldLabel({
	children,
	isRequired,
}: {
	children: string;
	isRequired: boolean;
}) {
	return (
		<span className="pt-2 text-sm font-semibold text-darknavy">
			{children}
			{isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
		</span>
	);
}

function fieldClassName(extraClassName?: string) {
	return joinClasses(
		"h-11 w-full rounded-lg border border-darknavy/10 bg-offwhite/60 px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-offwhite/80 disabled:bg-offwhite/80",
		extraClassName,
	);
}

function ErrorText({ message }: { message: string }) {
	return <p className="mt-1.5 text-xs font-semibold text-coralpink">{message}</p>;
}
