import {
	TermManagementDatemodeOptions,
	TermManagementStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type { TermManagementFieldsProps } from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { NumberField } from "@/app/src/ui/shared/FormField/NumberField";
import { SelectField } from "@/app/src/ui/shared/FormField/SelectField";
import { TextAreaField } from "@/app/src/ui/shared/FormField/TextAreaField";
import { TextField } from "@/app/src/ui/shared/FormField/TextField";

export function TermManagementFields({
	errors,
	isReadonly,
	values,
	onInputChange,
}: TermManagementFieldsProps) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-2">
				<TextField
					label="Name"
					error={errors.name}
					className="lg:col-span-2"
					required
					name="name"
					value={values.name}
					onChange={onInputChange}
					readOnly={isReadonly}
					placeholder="Enter Name..."
				/>

				<TextAreaField
					label="Description"
					error={errors.description}
					className="lg:col-span-2"
					name="description"
					maxLength={500}
					value={values.description}
					onChange={onInputChange}
					readOnly={isReadonly}
					placeholder={isReadonly ? "No Description..." : "Enter Description..."}
					controlClassName={`resize-y ${isReadonly ? "placeholder:italic" : ""}`}
				/>

				<SelectField
					label="Datemode"
					error={errors.datemode}
					required
					name="datemode"
					value={values.datemode}
					onChange={onInputChange}
					disabled={isReadonly}
					options={TermManagementDatemodeOptions}
				/>

				<NumberField
					label="Period"
					error={errors.period}
					warning={
						values.period.trim() === "0"
							? "Period is 0. Save only if this term should not add time."
							: undefined
					}
					required
					name="period"
					min={0}
					step={1}
					value={values.period}
					onChange={onInputChange}
					readOnly={isReadonly}
					placeholder="Enter period"
				/>

				<SelectField
					label="Status"
					error={errors.status}
					required
					name="status"
					value={values.status}
					onChange={onInputChange}
					disabled={isReadonly}
					options={TermManagementStatusOptions}
				/>
			</div>
		</div>
	);
}
