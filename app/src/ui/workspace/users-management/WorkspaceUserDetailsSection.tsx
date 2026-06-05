import {
	FormatPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import type {
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
	WorkspaceManagementField,
	WorkspaceManagementFieldClassName,
	WorkspaceManagementSection,
} from "@/app/src/ui/workspace/WorkspaceManagementForm";

export function WorkspaceUserDetailsSection({
	errors,
	isEmailReadonly,
	isReadonly,
	values,
	onUpdateField,
}: {
	errors: WorkspaceCompanyUserFormErrors;
	isEmailReadonly: boolean;
	isReadonly: boolean;
	values: WorkspaceCompanyUserFormValues;
	onUpdateField: (field: keyof WorkspaceCompanyUserFormValues, value: string) => void;
}) {
	return (
		<WorkspaceManagementSection
			title="User Details"
			description="Admins can update the user's name and contact number. Pending invite emails can be corrected before activation."
		>
			<div className="grid gap-4 lg:grid-cols-2">
				<WorkspaceManagementField label="Full Name" error={errors.name} required>
					<input
						value={values.name}
						onChange={(event) => onUpdateField("name", event.target.value)}
						readOnly={isReadonly}
						className={WorkspaceManagementFieldClassName}
					/>
				</WorkspaceManagementField>
				<WorkspaceManagementField label="Email" error={errors.email} required>
					<input
						type="email"
						value={values.email}
						onChange={(event) => onUpdateField("email", event.target.value)}
						readOnly={isReadonly || isEmailReadonly}
						className={WorkspaceManagementFieldClassName}
					/>
				</WorkspaceManagementField>
				<WorkspaceManagementField label="Contact No." error={errors.contactNumber}>
					<input
						type="tel"
						inputMode="numeric"
						maxLength={16}
						value={values.contactNumber}
						onChange={(event) =>
							onUpdateField(
								"contactNumber",
								FormatPhilippineContactNumber(event.target.value),
							)
						}
						readOnly={isReadonly}
						className={WorkspaceManagementFieldClassName}
						placeholder={PhilippineContactNumberPlaceholder}
					/>
				</WorkspaceManagementField>
			</div>
		</WorkspaceManagementSection>
	);
}
