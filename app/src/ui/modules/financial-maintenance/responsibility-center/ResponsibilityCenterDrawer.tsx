"use client";

import type { ChangeEventHandler, ReactNode } from "react";
import {
	ResponsibilityCenterActionCopy,
	ResponsibilityCenterDrawerFormId,
	ResponsibilityCenterFieldClassName,
	ResponsibilityCenterTitle,
} from "@/app/src/constants/modules/financial-maintenance/responsibility-center/ResponsibilityCenterConstants";
import { useResponsibilityCenterFormPage } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenterFormPage";
import type {
	ResponsibilityCenterDrawerProps,
	ResponsibilityCenterFormErrors,
	ResponsibilityCenterFormValues,
	ResponsibilityCenter,
	ResponsibilityCenterClassification,
	ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

export function ResponsibilityCenterDrawer(props: ResponsibilityCenterDrawerProps) {
	return (
		<ResponsibilityCenterDrawerPanel
			key={`${props.mode}-${props.center?.id ?? "new"}`}
			{...props}
		/>
	);
}

function ResponsibilityCenterDrawerPanel({
	center,
	isOpen,
	mode,
	onClose,
}: ResponsibilityCenterDrawerProps) {
	const page = useResponsibilityCenterFormPage({
		center,
		mode,
		onSaved: onClose,
	});
	const copy = ResponsibilityCenterActionCopy[mode];

	return (
		<ModuleDrawer
			description={copy.description}
			eyebrow={ResponsibilityCenterTitle}
			formId={ResponsibilityCenterDrawerFormId}
			isOpen={isOpen}
			isReadonly={page.isReadonly}
			isSaving={page.isSubmitting}
			onBeforeSaveConfirm={page.validateBeforeSubmit}
			onClose={onClose}
			savingLabel={getModuleSavePendingLabel(mode)}
			submitLabel={
				mode === "edit" ? "Update Responsibility Center" : "Save Responsibility Center"
			}
			title={copy.title}
		>
			<form
				id={ResponsibilityCenterDrawerFormId}
				onSubmit={page.handleSubmit}
				className="px-6 py-5"
			>
				<ResponsibilityCenterDrawerFields
					classifications={page.classifications}
					errors={page.errors}
					isReadonly={page.isReadonly}
					codePlaceholder={page.codePlaceholder}
					nameLabel={page.nameLabel}
					parentOptions={page.parentOptions}
					typeOptions={page.typeOptions}
					values={page.values}
					onFieldChange={page.handleFieldChange}
					onInputChange={page.handleInputChange}
				/>
			</form>
		</ModuleDrawer>
	);
}

function ResponsibilityCenterDrawerFields({
	classifications,
	errors,
	isReadonly,
	codePlaceholder,
	nameLabel,
	onFieldChange,
	onInputChange,
	parentOptions,
	typeOptions,
	values,
}: {
	classifications: ResponsibilityCenterClassification[];
	errors: ResponsibilityCenterFormErrors;
	isReadonly: boolean;
	codePlaceholder: string;
	nameLabel: string;
	parentOptions: ResponsibilityCenter[];
	typeOptions: ResponsibilityCenterTypeOption[];
	values: ResponsibilityCenterFormValues;
	onFieldChange: <TKey extends keyof ResponsibilityCenterFormValues>(
		field: TKey,
		value: ResponsibilityCenterFormValues[TKey],
	) => void;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
}) {
	const parentDropdownOptions: AppAdvancedDropdownOption[] = parentOptions.map(
		(center) => ({
			description: center.financialType,
			name: center.name,
			value: center.id,
		}),
	);

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<DrawerField label="Classification" error={errors.classificationId} required>
				<select
					name="classificationId"
					value={values.classificationId}
					onChange={onInputChange}
					disabled={isReadonly}
					className={ResponsibilityCenterFieldClassName}
				>
					<option value="">Select classification</option>
					{classifications.map((classification) => (
						<option key={classification.id} value={classification.id}>
							{classification.name}
						</option>
					))}
				</select>
			</DrawerField>

			<DrawerField label="Type" error={errors.typeId} required>
				<select
					name="typeId"
					value={values.typeId}
					onChange={onInputChange}
					disabled={isReadonly || !values.classificationId}
					className={ResponsibilityCenterFieldClassName}
				>
					<option value="">Select type</option>
					{typeOptions.map((type) => (
						<option key={type.id} value={type.id}>
							{type.name}
						</option>
					))}
				</select>
			</DrawerField>

			<DrawerField label={nameLabel} error={errors.name} required>
				<input
					name="name"
					value={values.name}
					onChange={onInputChange}
					readOnly={isReadonly || !values.classificationId}
					className={ResponsibilityCenterFieldClassName}
					placeholder={
						values.classificationId
							? "Sales Department"
							: "Select classification first"
					}
				/>
			</DrawerField>

			<DrawerField label="Code" error={errors.code}>
				<input
					name="code"
					value={values.code}
					onChange={onInputChange}
					readOnly={isReadonly || !values.typeId}
					className={ResponsibilityCenterFieldClassName}
					placeholder={codePlaceholder}
				/>
			</DrawerField>

			<DrawerField label="Parent Responsibility Center" error={errors.parentId}>
				<AppAdvancedDropdown
					options={parentDropdownOptions}
					placeholder="No parent center"
					readOnly={isReadonly}
					searchPlaceholder="Search parent center"
					showSelectionIndicator={false}
					showSelectedDetails
					value={values.parentId}
					onChange={(value) => onFieldChange("parentId", String(value))}
				/>
			</DrawerField>

			<DrawerField label="Manager" error={errors.manager}>
				<input
					name="manager"
					value={values.manager}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={ResponsibilityCenterFieldClassName}
					placeholder="Maria Santos"
				/>
			</DrawerField>

			<DrawerField
				label="Description"
				error={errors.description}
				className="lg:col-span-2"
			>
				<textarea
					name="description"
					value={values.description}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={joinClasses(
						ResponsibilityCenterFieldClassName,
						"min-h-24 resize-y py-3",
					)}
					placeholder="How this center is used in transactions and reports"
				/>
			</DrawerField>

			<DrawerField label="Status" required>
				<AppSwitch
					falseOption={MaintenanceInactiveStatusSwitchOption}
					value={values.status}
					onChange={(status) => onFieldChange("status", status)}
					readOnly={isReadonly}
					trueOption={MaintenanceActiveStatusSwitchOption}
				/>
			</DrawerField>
		</div>
	);
}

function DrawerField({
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



