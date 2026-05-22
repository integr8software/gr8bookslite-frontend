"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	GetPhilippineBarangaysByCityMunicipality,
	GetPhilippineCitiesMunicipalities,
	GetPhilippineProvincesByRegion,
	GetPhilippineRegions,
	PhilippineAddressQueryKeys,
} from "@/app/src/services/shared/address/ph/PhilippineAddressApi";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

const PhilippineAddressStaleTime = 24 * 60 * 60 * 1000;

export function usePhilippineAddressOptions({
	cityMunicipalityCode,
	provinceCode,
	regionCode,
}: {
	cityMunicipalityCode: string;
	provinceCode: string;
	regionCode: string;
}) {
	const regionsQuery = useQuery({
		queryKey: PhilippineAddressQueryKeys.regions(),
		queryFn: GetPhilippineRegions,
		staleTime: PhilippineAddressStaleTime,
	});
	const provincesQuery = useQuery({
		queryKey: PhilippineAddressQueryKeys.provinces(regionCode),
		queryFn: () => GetPhilippineProvincesByRegion(regionCode),
		enabled: Boolean(regionCode),
		staleTime: PhilippineAddressStaleTime,
	});
	const provinceOptions = useMemo(
		() =>
			(provincesQuery.data ?? []).map((province) => ({
				name: province.name,
				value: province.code,
			})),
		[provincesQuery.data],
	);
	const requiresProvince =
		Boolean(regionCode) && !provincesQuery.isLoading && provinceOptions.length > 0;
	const canLoadCitiesMunicipalities =
		Boolean(regionCode) &&
		!provincesQuery.isLoading &&
		(!requiresProvince || Boolean(provinceCode));
	const citiesMunicipalitiesQuery = useQuery({
		queryKey: PhilippineAddressQueryKeys.citiesMunicipalities(
			regionCode,
			provinceCode,
		),
		queryFn: () =>
			GetPhilippineCitiesMunicipalities({
				provinceCode,
				regionCode,
			}),
		enabled: canLoadCitiesMunicipalities,
		staleTime: PhilippineAddressStaleTime,
	});
	const barangaysQuery = useQuery({
		queryKey: PhilippineAddressQueryKeys.barangays(cityMunicipalityCode),
		queryFn: () =>
			GetPhilippineBarangaysByCityMunicipality(cityMunicipalityCode),
		enabled: Boolean(cityMunicipalityCode),
		staleTime: PhilippineAddressStaleTime,
	});

	const regionOptions = useMemo<AppAdvancedDropdownOption[]>(
		() =>
			(regionsQuery.data ?? []).map((region) => ({
				description:
					region.regionName && region.regionName !== region.name
						? region.regionName
						: undefined,
				name: region.name,
				value: region.code,
			})),
		[regionsQuery.data],
	);
	const cityMunicipalityOptions = useMemo<AppAdvancedDropdownOption[]>(
		() =>
			(citiesMunicipalitiesQuery.data ?? []).map((cityMunicipality) => ({
				name: cityMunicipality.name,
				value: cityMunicipality.code,
			})),
		[citiesMunicipalitiesQuery.data],
	);
	const barangayOptions = useMemo<AppAdvancedDropdownOption[]>(
		() =>
			(barangaysQuery.data ?? []).map((barangay) => ({
				name: barangay.name,
				value: barangay.code,
			})),
		[barangaysQuery.data],
	);

	return {
		barangayOptions,
		cityMunicipalityOptions,
		isBarangaysLoading: barangaysQuery.isLoading,
		isCitiesMunicipalitiesLoading: citiesMunicipalitiesQuery.isLoading,
		isProvincesLoading: provincesQuery.isLoading,
		isRegionsLoading: regionsQuery.isLoading,
		provinceOptions,
		regionOptions,
		requiresProvince,
	};
}
