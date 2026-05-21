import type {
	UserRoleFormErrors,
} from "@/app/src/types/modules/user-management/UserManagementTypes";
import type { UserRoleFormValues } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

export function validateUserRoleForm(values: UserRoleFormValues) {
	const errors: UserRoleFormErrors = {};

	if (!values.name.trim()) {
		errors.name = "Name is required.";
	}

	if (values.accessRoles.length === 0) {
		errors.accessRoles = "Select at least one access role.";
	}

	return errors;
}
