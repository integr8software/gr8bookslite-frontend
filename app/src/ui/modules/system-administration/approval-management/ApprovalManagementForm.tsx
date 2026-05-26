import type { ChangeEventHandler, FormEvent, ReactNode } from "react";
import {
	ApprovalManagementModuleOptions,
	ApprovalManagementStatusOptions,
	ApprovalStageCountOptions,
	ApprovalStageRequirementOptions,
} from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import type {
	ApprovalApproverOption,
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementModuleCode,
	ApprovalStageFormValues,
	ApprovalStageRequirement,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type ApprovalManagementFormProps = {
	approverOptions: ApprovalApproverOption[];
	errors: ApprovalManagementFormErrors;
	isReadonly: boolean;
	values: ApprovalManagementFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onModuleCodeChange: (moduleCode: ApprovalManagementModuleCode) => void;
	onStageFieldChange: <TKey extends keyof ApprovalStageFormValues>(
		stageId: string,
		field: TKey,
		value: ApprovalStageFormValues[TKey],
	) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ApprovalManagementForm({
	approverOptions,
	errors,
	isReadonly,
	onInputChange,
	onModuleCodeChange,
	onStageFieldChange,
	onSubmit,
	values,
}: ApprovalManagementFormProps) {
	const dropdownApproverOptions = createDropdownApproverOptions(approverOptions);

	return (
		<form
			id="approval-management-form"
			onSubmit={onSubmit}
			className="grid gap-5"
		>
			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">
					Workflow Setup
				</h2>
				<div className="mt-4 grid gap-4 lg:grid-cols-2">
					<FormField label="Module" error={errors.moduleCode} required>
						<select
							name="moduleCode"
							value={values.moduleCode}
							onChange={(event) =>
								onModuleCodeChange(
									event.target.value as ApprovalManagementModuleCode,
								)
							}
							disabled={isReadonly}
							className={fieldClassName}
						>
							<option value="">Select module</option>
							{ApprovalManagementModuleOptions.map((option) => (
								<option key={option.code} value={option.code}>
									{option.name} ({option.code})
								</option>
							))}
						</select>
					</FormField>
					<FormField label="Number of Approval Stages" error={errors.stageCount} required>
						<select
							name="stageCount"
							value={values.stageCount}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{ApprovalStageCountOptions.map((stageCount) => (
								<option key={stageCount} value={stageCount}>
									{stageCount}
								</option>
							))}
						</select>
					</FormField>
					<FormField label="Status" error={errors.status} required>
						<select
							name="status"
							value={values.status}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{ApprovalManagementStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</FormField>
					<FormField label="Description" error={errors.description} wide>
						<textarea
							name="description"
							value={values.description}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={`${fieldClassName} min-h-24 py-3`}
							placeholder="Workflow notes"
						/>
					</FormField>
				</div>
			</section>

			<section className="grid gap-3">
				<div className="flex items-center justify-between gap-3">
					<h2 className="text-base font-semibold text-darknavy">
						Approval Stages
					</h2>
					<span className="rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
						{values.stageCount} {values.stageCount === 1 ? "stage" : "stages"}
					</span>
				</div>
				{values.stages.map((stage) => {
					const stageErrors = errors.stages?.[stage.id] ?? {};

					return (
						<article
							key={stage.id}
							className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm"
						>
							<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
								<h3 className="text-sm font-semibold uppercase tracking-wide text-darknavy/55">
									Stage {stage.sequence}
								</h3>
								<span
									className={
										stage.requirement === "all"
											? "rounded-full bg-citron/35 px-3 py-1 text-xs font-semibold text-darknavy"
											: "rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy"
									}
								>
									{stage.requirement === "all"
										? "All approvers"
										: "Any one approver"}
								</span>
							</div>
							<div className="grid gap-4 lg:grid-cols-2">
								<FormField label="Stage Name" error={stageErrors.name} required>
									<input
										value={stage.name}
										onChange={(event) =>
											onStageFieldChange(stage.id, "name", event.target.value)
										}
										readOnly={isReadonly}
										className={fieldClassName}
									/>
								</FormField>
								<FormField
									label="Condition to Proceed"
									error={stageErrors.requirement}
									required
								>
									<select
										value={stage.requirement}
										onChange={(event) =>
											onStageFieldChange(
												stage.id,
												"requirement",
												event.target.value as ApprovalStageRequirement,
											)
										}
										disabled={isReadonly}
										className={fieldClassName}
									>
										{ApprovalStageRequirementOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</FormField>
								<FormField
									label="Approvers"
									error={stageErrors.approverIds}
									required
									wide
								>
									<AppAdvancedDropdown
										isClearable
										menuPortal
										readOnly={isReadonly}
										searchPlaceholder="Search approvers"
										selectionMode="multiple"
										showSelectedDetails
										options={dropdownApproverOptions}
										placeholder="Select approvers"
										value={stage.approverIds}
										onChange={(nextValue) =>
											onStageFieldChange(
												stage.id,
												"approverIds",
												Array.isArray(nextValue)
													? nextValue
													: nextValue
														? [nextValue]
														: [],
											)
										}
									/>
								</FormField>
							</div>
						</article>
					);
				})}
			</section>
		</form>
	);
}

function createDropdownApproverOptions(
	approvers: ApprovalApproverOption[],
): AppAdvancedDropdownOption[] {
	return approvers.map((approver) => ({
		description: approver.email,
		label: approver.role,
		name: approver.name,
		value: approver.id,
	}));
}

function FormField({
	children,
	error,
	label,
	required,
	wide,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
	wide?: boolean;
}) {
	return (
		<div className={wide ? "lg:col-span-2" : undefined}>
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
		</div>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
