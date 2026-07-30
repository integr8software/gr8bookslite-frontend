import {
	ApproverAssignmentTypeOptions,
	ApproverConditionOptions,
	ApproverCoverageStatusOptions,
	ApproverLevelOptions,
} from "@/app/src/constants/modules/system-administration/user-management/approver-setup/ApproverSetupConstants";
import type {
	ApproverAssignmentType,
	ApproverCondition,
	ApproverCoverageStatus,
	ApproverSetupDrawerMode,
	ApproverSetupFormValues,
	ApproverSetupModuleOption,
	ApproverSetupUser,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { normalizeSelectedApproverIds } from "@/app/src/validations/modules/system-administration/user-management/approver-setup/ApproverSetupValidation";
import {
	ApproverSetupSelectField,
	ApproverSetupTextField,
} from "./ApproverSetupFields";
import { ApproverSetupUserSelectList } from "./ApproverSetupUserSelectList";

type ApproverSetupDrawerProps = {
	formValues: ApproverSetupFormValues;
	isOpen: boolean;
	moduleOptions: ApproverSetupModuleOption[];
	mode: ApproverSetupDrawerMode;
	onChange: (values: ApproverSetupFormValues) => void;
	onClose: () => void;
	onSave: () => void;
	users: ApproverSetupUser[];
	validationMessage: string;
};

export function ApproverSetupDrawer({
	formValues,
	isOpen,
	moduleOptions,
	mode,
	onChange,
	onClose,
	onSave,
	users,
	validationMessage,
}: ApproverSetupDrawerProps) {
	const title =
		mode === "edit" ? "Edit Approver Assignment" : "Assign Approver";
	const moduleSelectOptions = moduleOptions.map<AppAdvancedDropdownOption>(
		(module) => ({
			description: module.code,
			name: module.name,
			value: module.code,
		}),
	);

	function updateField<TKey extends keyof ApproverSetupFormValues>(
		key: TKey,
		value: ApproverSetupFormValues[TKey],
	) {
		if (key === "condition") {
			onChange({
				...formValues,
				condition: value as ApproverCondition,
				userIds: normalizeSelectedApproverIds(
					value as ApproverCondition,
					formValues.userIds,
					users,
				),
			});
			return;
		}

		onChange({ ...formValues, [key]: value });
	}

	return (
		<ModuleDrawer
			isOpen={isOpen}
			title={title}
			description="Configure who can approve, when the coverage applies, and how this user participates in the workflow."
			maxWidthClassName="max-w-xl"
			onClose={onClose}
			footer={
				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onSave}
						className="inline-flex h-10 items-center justify-center rounded-md bg-skyblue px-4 text-sm font-semibold text-white transition hover:bg-skyblue/90"
					>
						{mode === "edit" ? "Save Changes" : "Assign Approver"}
					</button>
				</div>
			}
		>
			<div className="grid gap-4 p-6">
				<ApproverSetupSelectField
					label="Approver condition"
					value={formValues.condition}
					onChange={(value) =>
						updateField("condition", value as ApproverCondition)
					}
					options={ApproverConditionOptions.map((condition) => ({
						label: condition,
						value: condition,
					}))}
				/>
				<ApproverSetupUserSelectList
					condition={formValues.condition}
					selectedUserIds={formValues.userIds}
					users={users}
					onChange={(userIds) => updateField("userIds", userIds)}
				/>
				<div className="grid gap-4 sm:grid-cols-2">
					<ApproverSetupSelectField
						label="Type"
						value={formValues.assignmentType}
						onChange={(value) =>
							updateField(
								"assignmentType",
								value as ApproverAssignmentType,
							)
						}
						options={ApproverAssignmentTypeOptions.map((type) => ({
							label: type,
							value: type,
						}))}
					/>
					<ApproverSetupSelectField
						label="Status"
						value={formValues.status}
						onChange={(value) =>
							updateField(
								"status",
								value as ApproverCoverageStatus,
							)
						}
						options={ApproverCoverageStatusOptions.map(
							(status) => ({
								label: status,
								value: status,
							}),
						)}
					/>
				</div>
				<div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
					<ApproverSetupTextField
						label="Level name"
						value={formValues.levelName}
						onChange={(value) => updateField("levelName", value)}
					/>
					<ApproverSetupSelectField
						label="Level"
						value={formValues.sequence}
						onChange={(value) => updateField("sequence", value)}
						options={ApproverLevelOptions.map((level) => ({
							label: level,
							value: level,
						}))}
					/>
				</div>
				<label>
					<span className="text-sm font-semibold text-darknavy">
						Module scope
					</span>
					<AppAdvancedDropdown
						className="mt-2"
						disabled={moduleOptions.length === 0}
						emptyMessage="No approver setup modules found."
						options={moduleSelectOptions}
						placeholder="Select module"
						searchPlaceholder="Search module"
						value={formValues.moduleScope}
						onChange={(value) => {
							if (typeof value === "string") {
								updateField("moduleScope", value);
							}
						}}
					/>
				</label>
				{validationMessage ? (
					<div className="rounded-md border border-coralpink/30 bg-coralpink/10 px-3 py-2 text-sm font-semibold text-coralpink">
						{validationMessage}
					</div>
				) : null}
				{formValues.assignmentType === "Temporary" ? (
					<div className="grid gap-4 sm:grid-cols-2">
						<ApproverSetupTextField
							label="Effective from"
							type="date"
							value={formValues.effectiveFrom}
							onChange={(value) =>
								updateField("effectiveFrom", value)
							}
						/>
						<ApproverSetupTextField
							label="Valid until"
							type="date"
							value={formValues.effectiveTo}
							onChange={(value) =>
								updateField("effectiveTo", value)
							}
						/>
					</div>
				) : null}
			</div>
		</ModuleDrawer>
	);
}
