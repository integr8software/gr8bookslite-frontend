import axios from "axios";
import type {
  PhilippineBarangay,
  PhilippineCityMunicipality,
  PhilippineProvince,
  PhilippineRegion,
} from "@/app/src/types/shared/address/ph/PhilippineAddressTypes";

const PhilippineAddressApiClient = axios.create({
  baseURL: "https://psgc.gitlab.io/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const PhilippineAddressQueryKeys = {
  barangays: (cityMunicipalityCode: string) =>
    ["philippine-address", "barangays", cityMunicipalityCode] as const,
  citiesMunicipalities: (regionCode: string, provinceCode: string) =>
    [
      "philippine-address",
      "cities-municipalities",
      regionCode,
      provinceCode,
    ] as const,
  provinces: (regionCode: string) =>
    ["philippine-address", "provinces", regionCode] as const,
  regions: () => ["philippine-address", "regions"] as const,
};

export async function GetPhilippineRegions() {
  return sortByName(await getList<PhilippineRegion>("/regions/"));
}

export async function GetPhilippineProvincesByRegion(regionCode: string) {
  if (!regionCode) {
    return [];
  }

  try {
    return sortByName(
      await getList<PhilippineProvince>(`/regions/${regionCode}/provinces/`),
    );
  } catch {
    const provinces = await getList<PhilippineProvince>("/provinces/");

    return sortByName(
      provinces.filter((province) => province.regionCode === regionCode),
    );
  }
}

export async function GetPhilippineCitiesMunicipalities({
  provinceCode,
  regionCode,
}: {
  provinceCode: string;
  regionCode: string;
}) {
  if (!regionCode) {
    return [];
  }

  if (provinceCode) {
    try {
      return sortByName(
        await getList<PhilippineCityMunicipality>(
          `/provinces/${provinceCode}/cities-municipalities/`,
        ),
      );
    } catch {
      const citiesMunicipalities = await getList<PhilippineCityMunicipality>(
        "/cities-municipalities/",
      );

      return sortByName(
        citiesMunicipalities.filter(
          (cityMunicipality) => cityMunicipality.provinceCode === provinceCode,
        ),
      );
    }
  }

  try {
    return sortByName(
      await getList<PhilippineCityMunicipality>(
        `/regions/${regionCode}/cities-municipalities/`,
      ),
    );
  } catch {
    const citiesMunicipalities = await getList<PhilippineCityMunicipality>(
      "/cities-municipalities/",
    );

    return sortByName(
      citiesMunicipalities.filter(
        (cityMunicipality) => cityMunicipality.regionCode === regionCode,
      ),
    );
  }
}

export async function GetPhilippineBarangaysByCityMunicipality(
  cityMunicipalityCode: string,
) {
  if (!cityMunicipalityCode) {
    return [];
  }

  try {
    return sortByName(
      await getFirstAvailableList<PhilippineBarangay>([
        `/cities-municipalities/${cityMunicipalityCode}/barangays/`,
        `/cities/${cityMunicipalityCode}/barangays/`,
        `/municipalities/${cityMunicipalityCode}/barangays/`,
      ]),
    );
  } catch {
    const barangays = await getList<PhilippineBarangay>("/barangays/");

    return sortByName(
      barangays.filter(
        (barangay) =>
          barangay.cityCode === cityMunicipalityCode ||
          barangay.municipalityCode === cityMunicipalityCode ||
          getStringValue(barangay, "cityMunicipalityCode") ===
            cityMunicipalityCode,
      ),
    );
  }
}

async function getFirstAvailableList<TRecord>(paths: string[]) {
  let lastError: unknown;

  for (const path of paths) {
    try {
      return await getList<TRecord>(path);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function getList<TRecord>(path: string) {
  const response = await PhilippineAddressApiClient.get<TRecord[]>(path);

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data;
}

function sortByName<TRecord extends { name: string }>(records: TRecord[]) {
  return [...records].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

function getStringValue(record: object, key: string) {
  const value = (record as Record<string, unknown>)[key];

  return typeof value === "string" ? value : "";
}
