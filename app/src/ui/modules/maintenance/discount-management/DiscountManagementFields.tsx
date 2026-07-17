import type { ReactNode } from "react";
import {
	DiscountManagementFieldClassName,
	DiscountManagementStatusOptions,
	DiscountManagementSelectClassName,
	DiscountManagementTypeOptions,
	DiscountManagementValueTypeOptions,
} from "@/app/src/constants/modules/maintenance/discount-management/DiscountManagementConstants";
import type { DiscountManagementFieldsProps } from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

export function DiscountManagementFields({
	errors,
	generatedAccount,
	isReadonly,
	values,
	onInputChange,
}: DiscountManagementFieldsProps) {
	return (
		<div className="grid gap-4">
			<FormField label="Name" error={errors.name} required>
				<input
					name="name"
					value={values.name}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={DiscountManagementFieldClassName}
					placeholder="Enter discount name"
				/>
			</FormField>

			<FormField label="Type" error={errors.type} required>
				<select
					name="type"
					value={values.type}
					onChange={onInputChange}
					disabled={isReadonly}
					className={DiscountManagementSelectClassName}
				>
					{DiscountManagementTypeOptions.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</FormField>

			<FormField label="Description" error={errors.description}>
				<AppLimitedTextarea
					name="description"
					value={values.description}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={`${DiscountManagementFieldClassName} min-h-24 py-3`}
					counterMode="used"
					placeholder="What is this discount for?"
				/>
			</FormField>

			<div className="grid gap-4 lg:grid-cols-2">
				<FormField label="Discount Type" error={errors.discountType} required>
					<select
						name="discountType"
						value={values.discountType}
						onChange={onInputChange}
						disabled={isReadonly}
							className={DiscountManagementSelectClassName}
					>
						{DiscountManagementValueTypeOptions.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</FormField>

				<FormField label="Discount Value" error={errors.amount} required>
					<input
						name="amount"
						type="number"
						min="0"
						max={values.discountType === "Percentage" ? "100" : undefined}
						step="any"
						value={values.amount}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={DiscountManagementFieldClassName}
						placeholder={
							values.discountType === "Percentage"
								? "Enter percentage"
								: "Enter fixed amount"
						}
					/>
				</FormField>
			</div>

			{isReadonly ? (
				<div className="grid gap-4 lg:grid-cols-2">
					<ReadonlyField label="Account Code">
						{generatedAccount.accountCode}
					</ReadonlyField>
					<ReadonlyField label="Account Title">
						{generatedAccount.accountTitle}
					</ReadonlyField>
					<ReadonlyField label="Account Group" className="lg:col-span-2">
						{generatedAccount.accountGroupPath}
					</ReadonlyField>
				</div>
			) : null}

			<FormField label="Status" error={errors.status} required>
				<select
					name="status"
					value={values.status}
					onChange={onInputChange}
					disabled={isReadonly}
					className={DiscountManagementSelectClassName}
				>
					{DiscountManagementStatusOptions.map((status) => (
						<option key={status} value={status}>
							{status}
						</option>
					))}
				</select>
			</FormField>
		</div>
	);
}

function FormField({
	children,
	error,
	className,
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

function ReadonlyField({
	children,
	className,
	label,
}: {
	children: ReactNode;
	className?: string;
	label: string;
}) {
	return (
		<div className={className}>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
			</span>
			<div className="min-h-11 rounded-md border border-darknavy/10 bg-darknavy/[0.03] px-3 py-2.5 text-sm font-medium text-darknavy">
				{children}
			</div>
		</div>
	);
}


