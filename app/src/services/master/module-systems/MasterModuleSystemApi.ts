import { ApiClient } from "@/app/src/services/shared/api/ApiClient";

export type MasterModuleSystemModule = {
	id: number;
	code: string;
	name: string;
	description: string;
	iconKey: string | null;
	sortOrder: number;
	isActive: boolean;
};

export type MasterModuleSystemSidebarItem = {
	id: number | null;
	key: string;
	label: string;
	description: string;
	itemType: "SECTION" | "CONTAINER" | "LINK";
	moduleId: number | null;
	moduleCode: string | null;
	iconName: string | null;
	sortOrder: number;
	isVisible: boolean;
	children: MasterModuleSystemSidebarItem[];
};

export type MasterModuleSystem = {
	id: number;
	code: string;
	name: string;
	description: string;
	sortOrder: number;
	isActive: boolean;
	moduleCount: number;
	modules: MasterModuleSystemModule[];
	sidebar: MasterModuleSystemSidebarItem[];
};

export type MasterModuleSystemsResponse = {
	systems: MasterModuleSystem[];
};

export type MasterAvailableModulesResponse = {
	modules: MasterModuleSystemModule[];
};

export type MasterModuleSystemSidebarResponse = {
	fallbackSidebar: MasterModuleSystemSidebarItem[];
	sidebar: MasterModuleSystemSidebarItem[];
};

export type SaveMasterModuleSystemRequest = {
	code?: string;
	name: string;
	description?: string | null;
	sortOrder?: number;
	isActive?: boolean;
};

export async function getMasterModuleSystems() {
	const response = await ApiClient.get<MasterModuleSystemsResponse>(
		"/master/module-systems",
	);

	return response.data;
}

export async function getMasterModuleSystemModules() {
	const response = await ApiClient.get<{
		modules: Array<
			Omit<MasterModuleSystemModule, "iconKey" | "sortOrder"> & {
				icon?: string | null;
				sortOrder?: number;
			}
		>;
	}>(
		"/master/module-systems/modules",
	);

	return {
		modules: response.data.modules.map((module) => ({
			...module,
			iconKey: module.icon ?? null,
			sortOrder: module.sortOrder ?? 0,
		})),
	} satisfies MasterAvailableModulesResponse;
}

export async function createMasterModuleSystem(
	payload: SaveMasterModuleSystemRequest,
) {
	const response = await ApiClient.post<{ system: MasterModuleSystem }>(
		"/master/module-systems",
		payload,
	);

	return response.data;
}

export async function updateMasterModuleSystem(
	systemId: number,
	payload: SaveMasterModuleSystemRequest,
) {
	const response = await ApiClient.patch<{ system: MasterModuleSystem }>(
		`/master/module-systems/${systemId}`,
		payload,
	);

	return response.data;
}

export async function updateMasterModuleSystemStatus(
	systemId: number,
	isActive: boolean,
) {
	const response = await ApiClient.patch<{ system: MasterModuleSystem }>(
		`/master/module-systems/${systemId}/status`,
		{ isActive },
	);

	return response.data;
}

export async function saveMasterModuleSystemModules(
	systemId: number,
	moduleCodes: string[],
) {
	const response = await ApiClient.put<{ system: MasterModuleSystem }>(
		`/master/module-systems/${systemId}/modules`,
		{ moduleCodes },
	);

	return response.data;
}

export async function getMasterModuleSystemSidebar(systemId: number) {
	const response = await ApiClient.get<MasterModuleSystemSidebarResponse>(
		`/master/module-systems/${systemId}/sidebar`,
	);

	return response.data;
}

export async function saveMasterModuleSystemSidebar(
	systemId: number,
	items: MasterModuleSystemSidebarItem[],
) {
	const response = await ApiClient.put<{ sidebar: MasterModuleSystemSidebarItem[] }>(
		`/master/module-systems/${systemId}/sidebar`,
		{ items },
	);

	return response.data;
}
