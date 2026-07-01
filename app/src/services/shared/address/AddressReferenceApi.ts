import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	AddressAutocompleteItem,
	AddressBarangay,
	AddressCityMunicipality,
	AddressProvince,
	AddressRegion,
} from "@/app/src/types/shared/address/AddressTypes";

export const AddressReferenceQueryKeys = {
	autocomplete: (query: string, regionCode: string) =>
		["address-reference", "autocomplete", query, regionCode] as const,
	barangays: (cityMunicipalityCode: string) =>
		["address-reference", "barangays", cityMunicipalityCode] as const,
	citiesMunicipalities: (provinceCode: string) =>
		["address-reference", "cities-municipalities", provinceCode] as const,
	provinces: (regionCode: string) =>
		["address-reference", "provinces", regionCode] as const,
	regions: () => ["address-reference", "regions"] as const,
};

export async function GetAddressRegions() {
	const response = await ApiClient.get<{ regions: AddressRegion[] }>(
		"/regions",
	);

	return response.data.regions;
}

export async function GetAddressProvinces(regionCode?: string) {
	const response = await ApiClient.get<{ provinces: AddressProvince[] }>(
		regionCode
			? `/regions/${regionCode}/provinces`
			: "/provinces",
	);

	return response.data.provinces;
}

export async function GetAddressCitiesMunicipalities({
	provinceCode,
	regionCode,
}: {
	provinceCode?: string;
	regionCode?: string;
}) {
	const path = provinceCode
		? `/provinces/${provinceCode}/cities-municipalities`
		: regionCode
			? `/regions/${regionCode}/cities-municipalities`
			: "/cities-municipalities";
	const response = await ApiClient.get<{
		cityMunicipalities: AddressCityMunicipality[];
	}>(path);

	return response.data.cityMunicipalities;
}

export async function GetAddressBarangays(cityMunicipalityCode?: string) {
	if (!cityMunicipalityCode) {
		return [];
	}

	const response = await ApiClient.get<{ barangays: AddressBarangay[] }>(
		`/cities-municipalities/${cityMunicipalityCode}/barangays`,
	);

	return response.data.barangays;
}

export async function GetAddressAutocomplete({
	limit = 20,
	query,
	regionCode,
}: {
	limit?: number;
	query: string;
	regionCode?: string;
}) {
	const response = await ApiClient.get<{ addresses: AddressAutocompleteItem[] }>(
		"/address/autocomplete",
		{
			params: {
				limit,
				query,
				regionCode: regionCode || undefined,
			},
		},
	);

	return response.data.addresses;
}
