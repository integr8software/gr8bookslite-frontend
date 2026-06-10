import {
	formSignatoriesControllerFindAllV1,
	formSignatoriesControllerFindBootstrapV1,
	formSignatoriesControllerFindOptionsV1,
	formSignatoriesControllerResolveV1,
	formSignatoriesControllerSaveV1,
	formSignatoriesControllerUpdateV1,
} from "@/app/src/generated/api/form-signatories/form-signatories";
import { IsClientAuthSessionMarker } from "@/app/src/data/auth/AuthSessionStorage";
import type {
	FormSignatoryApiSetup,
	FormSignatoryBootstrap,
	FormSignatoryBranchOption,
	FormSignatoryModuleOption,
	FormSignatoryOptions,
	FormSignatoryOptionsApiResponse,
	FormSignatoryRow,
	FormSignatorySetupRecord,
	SaveFormSignatoryRequest,
} from "@/app/src/types/modules/maintenance/form-signatory/FormSignatoryTypes";

function GetAuthorizationHeaders(accessToken: string | null) {
	if (!accessToken || IsClientAuthSessionMarker(accessToken)) {
		return undefined;
	}

	return {
		Authorization: `Bearer ${accessToken}`,
	};
}

export async function GetFormSignatorySetups(accessToken: string | null) {
	const response = await formSignatoriesControllerFindAllV1({
		headers: GetAuthorizationHeaders(accessToken),
	});

	return response.setups.map(MapFormSignatorySetup);
}

export async function GetFormSignatoryOptions(accessToken: string | null) {
	const response = await formSignatoriesControllerFindOptionsV1({
		headers: GetAuthorizationHeaders(accessToken),
	});

	return MapFormSignatoryOptions(response);
}

export async function GetFormSignatoryBootstrap(
	accessToken: string | null,
): Promise<FormSignatoryBootstrap> {
	const response = await formSignatoriesControllerFindBootstrapV1({
		headers: GetAuthorizationHeaders(accessToken),
	});

	return {
		...MapFormSignatoryOptions(response),
		setups: response.setups.map(MapFormSignatorySetup),
	};
}

function MapFormSignatoryOptions(
	options: FormSignatoryOptionsApiResponse,
): FormSignatoryOptions {
	return {
		branches: [
			{ label: "Select Branch", value: "" },
			...options.branches.map<FormSignatoryBranchOption>((branch) => ({
				code: branch.code,
				label: branch.displayName ?? branch.name,
				type: branch.type,
				value: String(branch.id),
			})),
		],
		modules: [
			{ label: "Select Module", value: "" },
			...options.modules.map<FormSignatoryModuleOption>((module) => ({
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
	const response = await formSignatoriesControllerResolveV1(
		{
			moduleCodes: moduleCodes.join(","),
			unitId,
		},
		{
			headers: GetAuthorizationHeaders(accessToken),
		},
	);

	return response.setup ? MapFormSignatorySetup(response.setup) : null;
}

export async function SaveFormSignatorySetup(
	accessToken: string | null,
	payload: SaveFormSignatoryRequest,
	setupId?: string,
) {
	const response = setupId
		? await formSignatoriesControllerUpdateV1(
				Number(setupId),
				payload,
				{
					headers: GetAuthorizationHeaders(accessToken),
				},
			)
		: await formSignatoriesControllerSaveV1(
				payload,
				{
					headers: GetAuthorizationHeaders(accessToken),
				},
			);

	return MapFormSignatorySetup(response.setup);
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
		isThisTemporary: row.isThisTemporary ?? null,
		name: row.name,
		position: row.position ?? "",
		setupId,
		signatureName: row.signatureName ?? "",
		signaturePreview: row.signatureImage ?? "",
		signatureValidUntil: row.signatureValidUntil ?? "",
	};
}
