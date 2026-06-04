import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	FormSignatoryApiSetup,
	FormSignatoryBranchOption,
	FormSignatoryModuleOption,
	FormSignatoryOptionsApiResponse,
	FormSignatoryRow,
	FormSignatorySetupRecord,
	SaveFormSignatoryRequest,
} from "@/app/src/types/modules/maintenance/form-signatory/FormSignatoryTypes";

function GetAuthorizationHeaders(accessToken: string | null) {
	if (!accessToken) {
		return undefined;
	}

	return {
		Authorization: `Bearer ${accessToken}`,
	};
}

export async function GetFormSignatorySetups(accessToken: string | null) {
	const response = await ApiClient.get<{ setups: FormSignatoryApiSetup[] }>(
		"/maintenance/form-signatories",
		{
			headers: GetAuthorizationHeaders(accessToken),
		},
	);

	return response.data.setups.map(MapFormSignatorySetup);
}

export async function GetFormSignatoryOptions(accessToken: string | null) {
	const response = await ApiClient.get<FormSignatoryOptionsApiResponse>(
		"/maintenance/form-signatories/options",
		{
			headers: GetAuthorizationHeaders(accessToken),
		},
	);

	return {
		branches: [
			{ label: "Select Branch", value: "" },
			...response.data.branches.map<FormSignatoryBranchOption>((branch) => ({
				code: branch.code,
				label: branch.displayName ?? branch.name,
				type: branch.type,
				value: String(branch.id),
			})),
		],
		modules: [
			{ label: "Select Module", value: "" },
			...response.data.modules.map<FormSignatoryModuleOption>((module) => ({
				id: String(module.id),
				label: module.name,
				value: module.code,
			})),
		],
	};
}

export async function ResolveFormSignatorySetup(
	accessToken: string | null,
	unitId: number,
	moduleCodes: readonly string[],
) {
	const response = await ApiClient.get<{ setup: FormSignatoryApiSetup | null }>(
		"/maintenance/form-signatories/resolve",
		{
			headers: GetAuthorizationHeaders(accessToken),
			params: {
				moduleCodes: moduleCodes.join(","),
				unitId,
			},
		},
	);

	return response.data.setup ? MapFormSignatorySetup(response.data.setup) : null;
}

export async function SaveFormSignatorySetup(
	accessToken: string | null,
	payload: SaveFormSignatoryRequest,
	setupId?: string,
) {
	const response = setupId
		? await ApiClient.patch<{ setup: FormSignatoryApiSetup }>(
				`/maintenance/form-signatories/${setupId}`,
				payload,
				{
					headers: GetAuthorizationHeaders(accessToken),
				},
			)
		: await ApiClient.post<{ setup: FormSignatoryApiSetup }>(
				"/maintenance/form-signatories",
				payload,
				{
					headers: GetAuthorizationHeaders(accessToken),
				},
			);

	return MapFormSignatorySetup(response.data.setup);
}

function MapFormSignatorySetup(
	setup: FormSignatoryApiSetup,
): FormSignatorySetupRecord {
	return {
		branch: String(setup.unit.id),
		branchName: setup.unit.displayName ?? setup.unit.name,
		id: String(setup.id),
		module: setup.module.code,
		moduleName: setup.module.name,
		rows: setup.rows.map((row) => MapFormSignatoryRow(row, String(setup.id))),
	};
}

function MapFormSignatoryRow(
	row: FormSignatoryApiSetup["rows"][number],
	setupId: string,
): FormSignatoryRow {
	return {
		id: String(row.id),
		label: row.label,
		name: row.name,
		position: row.position ?? "",
		setupId,
		signatureName: row.signatureName ?? "",
		signaturePreview: row.signatureImage ?? "",
		signatureValidUntil: row.signatureValidUntil ?? "",
	};
}
