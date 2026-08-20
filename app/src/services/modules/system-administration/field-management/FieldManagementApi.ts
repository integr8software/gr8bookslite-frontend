import { ApiClient } from "@/app/src/services/shared/api/ApiClient";

export type FieldManagementField = {
	id: number;
	moduleId: number;
	fieldKey: string;
	label: string;
	sourcePath?: string | null;
	fieldType?: string | null;
	sortOrder: number;
	isVisible: boolean;
	isRequired: boolean;
	defaultVisible: boolean;
	defaultRequired: boolean;
};

export type FieldManagementModule = {
	id: number;
	code: string;
	name: string;
	description: string;
	iconName?: string | null;
	isActive: boolean;
	fields: FieldManagementField[];
};

export type FieldManagementBootstrap = {
	modules: FieldManagementModule[];
};

export async function GetFieldManagementBootstrap() {
	return (
		await ApiClient.get<FieldManagementBootstrap>(
			"/system-administration/field-management",
		)
	).data;
}

export async function SaveFieldManagementModuleFields(
	moduleId: number,
	fields: Pick<FieldManagementField, "id" | "isVisible" | "isRequired">[],
) {
	return (
		await ApiClient.patch<{
			message: string;
			module: FieldManagementModule;
		}>(`/system-administration/field-management/modules/${moduleId}/fields`, {
			fields,
		})
	).data;
}
