import type { ChangeEvent, ReactNode } from "react";
import {
	ResponsibilityCenterStatusOptions,
	ResponsibilityCenterTypeOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterFormErrors,
	ResponsibilityCenterFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

type ResponsibilityCenterDetailsFieldsProps = {
	errors: ResponsibilityCenterFormErrors;
	isReadonly: boolean;
	parentOptions: ResponsibilityCenter[];
	values: ResponsibilityCenterFormValues;
	onInputChange: (
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => void;
};

export function ResponsibilityCenterDetailsFields({
	errors,
	isReadonly,
	onInputChange,
	parentOptions,
	values,
}: ResponsibilityCenterDetailsFieldsProps) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-2">
				<Field label="Code" error={errors.code} required>
					<input
						name="code"
						value={values.code}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="ADM"
					/>
				</Field>

				<Field label="Name" error={errors.name} required>
					<input
						name="name"
						value={values.name}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Administration"
					/>
				</Field>

				<Field label="Type" required>
					<select
						name="type"
						value={values.type}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{ResponsibilityCenterTypeOptions.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</Field>

				<Field label="Status" required>
					<select
						name="status"
						value={values.status}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{ResponsibilityCenterStatusOptions.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</Field>

				<Field label="Manager" error={errors.manager} required>
					<input
						name="manager"
						value={values.manager}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Maria Santos"
					/>
				</Field>

				<Field label="Parent Center" error={errors.parentId}>
					<select
						name="parentId"
						value={values.parentId}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						<option value="">No parent center</option>
						{parentOptions.map((center) => (
							<option key={center.id} value={center.id}>
								{center.code} - {center.name}
							</option>
						))}
					</select>
				</Field>

				<Field label="Description" className="lg:col-span-2">
					<textarea
						name="description"
						value={values.description}
						onChange={onInputChange}
						readOnly={isReadonly}
						rows={4}
						className={fieldClassName}
						placeholder="Optional notes for reporting and accountability."
					/>
				</Field>
			</div>
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
