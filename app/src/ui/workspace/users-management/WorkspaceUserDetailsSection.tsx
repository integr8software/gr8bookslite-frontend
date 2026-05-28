import {
	FormatPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import type {
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
	WorkspaceCompanyField,
	WorkspaceCompanyFieldClassName,
	WorkspaceCompanySection,
} from "@/app/src/ui/workspace/shared/WorkspaceFormPrimitives";

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
		<WorkspaceCompanySection
			title="User Details"
			description="Admins can update the user's name and contact number. Email stays readonly after creation."
		>
			<div className="grid gap-4 lg:grid-cols-2">
				<WorkspaceCompanyField label="Full Name" error={errors.name} required>
					<input
						value={values.name}
						onChange={(event) => onUpdateField("name", event.target.value)}
						readOnly={isReadonly}
						className={WorkspaceCompanyFieldClassName}
					/>
				</WorkspaceCompanyField>
				<WorkspaceCompanyField label="Email" error={errors.email} required>
					<input
						type="email"
						value={values.email}
						onChange={(event) => onUpdateField("email", event.target.value)}
						readOnly={isReadonly || isEmailReadonly}
						className={WorkspaceCompanyFieldClassName}
					/>
				</WorkspaceCompanyField>
				<WorkspaceCompanyField label="Contact No." error={errors.contactNumber}>
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
						className={WorkspaceCompanyFieldClassName}
						placeholder={PhilippineContactNumberPlaceholder}
					/>
				</WorkspaceCompanyField>
			</div>
		</WorkspaceCompanySection>
	);
}
