import type { UserFormValues } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type { UserFormErrors } from "@/app/src/types/modules/user-management/UserManagementTypes";

export function validateUserForm(values: UserFormValues) {
	const errors: UserFormErrors = {};

	if (!values.name.trim()) {
		errors.name = "Name is required.";
	}

	if (!values.email.trim()) {
		errors.email = "Email is required.";
	}

	if (!values.contactNumber.trim()) {
		errors.contactNumber = "Contact number is required.";
	}

	return errors;
}
