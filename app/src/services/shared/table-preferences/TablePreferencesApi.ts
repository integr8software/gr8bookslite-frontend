import { ApiClient } from "@/app/src/services/shared/api/ApiClient";

export type TablePreferenceConfiguration = Record<string, unknown>;

type TablePreferenceResponse = {
	configuration: TablePreferenceConfiguration | null;
};

const TablePreferencesPath = "/table-preferences";

export async function fetchTablePreference(moduleKey: string) {
	const response = await ApiClient.get<TablePreferenceResponse>(
		`${TablePreferencesPath}/${encodeURIComponent(moduleKey)}`,
	);

	return response.data.configuration;
}

export async function saveTablePreference(
	moduleKey: string,
	configuration: TablePreferenceConfiguration,
) {
	const response = await ApiClient.put<TablePreferenceResponse>(
		`${TablePreferencesPath}/${encodeURIComponent(moduleKey)}`,
		{ configuration },
	);

	return response.data.configuration;
}
