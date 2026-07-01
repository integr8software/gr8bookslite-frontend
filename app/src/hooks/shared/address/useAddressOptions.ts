"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	AddressReferenceQueryKeys,
	GetAddressBarangays,
	GetAddressCitiesMunicipalities,
	GetAddressProvinces,
	GetAddressRegions,
} from "@/app/src/services/shared/address/AddressReferenceApi";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

const AddressReferenceStaleTime = 24 * 60 * 60 * 1000;
const NcrRegionCode = "130000000";

export function useAddressOptions({
	barangayCode,
	barangayName,
	cityMunicipalityCode,
	cityMunicipalityName,
	provinceCode,
	provinceName,
	regionCode,
	regionName,
}: {
	barangayCode: string;
	barangayName?: string;
	cityMunicipalityCode: string;
	cityMunicipalityName?: string;
	provinceCode: string;
	provinceName?: string;
	regionCode: string;
	regionName?: string;
}) {
	const regionsQuery = useQuery({
		queryKey: AddressReferenceQueryKeys.regions(),
		queryFn: GetAddressRegions,
		staleTime: AddressReferenceStaleTime,
	});
	const provincesQuery = useQuery({
		queryKey: AddressReferenceQueryKeys.provinces(""),
		queryFn: () => GetAddressProvinces(),
		staleTime: AddressReferenceStaleTime,
	});
	const provinceOptions = useMemo(
		() => {
			const provinces = provincesQuery.data ?? [];
			const loadedRegions = regionsQuery.data ?? [];
			const regions = loadedRegions.some(
				(region) => region.regionCode === NcrRegionCode,
			)
				? loadedRegions
				: [
						...loadedRegions,
						{
							id: 0,
							name: "National Capital Region",
							psgcCode: NcrRegionCode,
							regionCode: NcrRegionCode,
						},
					];
			const regionCodesWithProvinces = new Set(
				provinces.map((province) => province.regionCode),
			);
			const provinceOptions = provinces.map((province) => ({
				name: province.name,
				regionCode: province.regionCode,
				regionName:
					regions.find(
						(region) => region.regionCode === province.regionCode,
					)?.name ?? "",
				value: province.provinceCode,
			}));
			const provinceLessRegionOptions = regions
				.filter(
					(region) =>
						region.regionCode === NcrRegionCode ||
						!regionCodesWithProvinces.has(region.regionCode),
				)
				.map((region) => ({
					description:
						region.regionCode === NcrRegionCode ? "NCR" : undefined,
					name:
						region.regionCode === NcrRegionCode
							? "Metro Manila / National Capital Region (NCR)"
							: region.name,
					regionCode: region.regionCode,
					regionName: region.name,
					value: region.regionCode,
				}));

			const options = [...provinceOptions, ...provinceLessRegionOptions];

			if (
				provinceCode &&
				provinceName &&
				!options.some((option) => option.value === provinceCode)
			) {
				options.push({
					name: provinceName,
					regionCode,
					regionName: regionName ?? "",
					value: provinceCode,
				});
			}

			return options.sort(
				(first, second) => first.name.localeCompare(second.name),
			);
		},
		[
			provinceCode,
			provinceName,
			provincesQuery.data,
			regionCode,
			regionName,
			regionsQuery.data,
		],
	);
	const canLoadCitiesMunicipalities =
		Boolean(regionCode) && Boolean(provinceCode);
	const citiesMunicipalitiesQuery = useQuery({
		queryKey: AddressReferenceQueryKeys.citiesMunicipalities(provinceCode),
		queryFn: () =>
			GetAddressCitiesMunicipalities({
				provinceCode: provinceCode === regionCode ? undefined : provinceCode,
				regionCode,
			}),
		enabled: canLoadCitiesMunicipalities,
		staleTime: AddressReferenceStaleTime,
	});
	const barangaysQuery = useQuery({
		queryKey: AddressReferenceQueryKeys.barangays(cityMunicipalityCode),
		queryFn: () => GetAddressBarangays(cityMunicipalityCode),
		enabled: Boolean(cityMunicipalityCode),
		staleTime: AddressReferenceStaleTime,
	});

	const regionOptions = useMemo<AppAdvancedDropdownOption[]>(
		() =>
			(regionsQuery.data ?? []).map((region) => ({
				name: region.name,
				value: region.regionCode,
			})),
		[regionsQuery.data],
	);
	const cityMunicipalityOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
		const options = (citiesMunicipalitiesQuery.data ?? []).map(
			(cityMunicipality) => ({
				name: cityMunicipality.name,
				value: cityMunicipality.cityMunicipalityCode,
			}),
		);

		if (
			cityMunicipalityCode &&
			cityMunicipalityName &&
			!options.some((option) => option.value === cityMunicipalityCode)
		) {
			options.push({ name: cityMunicipalityName, value: cityMunicipalityCode });
		}

		return options;
	}, [
		citiesMunicipalitiesQuery.data,
		cityMunicipalityCode,
		cityMunicipalityName,
	]);
	const barangayOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
		const options = (barangaysQuery.data ?? []).map((barangay) => ({
			name: barangay.name,
			value: barangay.barangayCode,
		}));

		if (
			barangayCode &&
			barangayName &&
			!options.some((option) => option.value === barangayCode)
		) {
			options.push({ name: barangayName, value: barangayCode });
		}

		return options;
	}, [barangayCode, barangayName, barangaysQuery.data]);

	return {
		barangayOptions,
		cityMunicipalityOptions,
		isBarangaysLoading: barangaysQuery.isLoading,
		isCitiesMunicipalitiesLoading: citiesMunicipalitiesQuery.isLoading,
		isProvincesLoading:
			provincesQuery.isLoading || regionsQuery.isLoading,
		isRegionsLoading: regionsQuery.isLoading,
		provinceOptions,
		regionOptions,
	};
}
