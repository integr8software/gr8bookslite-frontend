import axios from "axios";
import { GetAddressAutocomplete } from "@/app/src/services/shared/address/AddressReferenceApi";
import type {
  AddressAutocompleteItem,
  OsmReverseGeocodeResult,
  OsmSearchResult,
} from "@/app/src/types/shared/address/AddressTypes";

export function extractOsmAddressComponents(addressObj: Record<string, string | undefined>) {
  const road =
    addressObj.road ||
    addressObj.street ||
    addressObj.pedestrian ||
    addressObj.residential ||
    addressObj.path ||
    "";
  const barangay =
    addressObj.village ||
    addressObj.suburb ||
    addressObj.neighbourhood ||
    addressObj.quarter ||
    addressObj.hamlet ||
    "";
  const cityMunicipality =
    addressObj.city ||
    addressObj.town ||
    addressObj.municipality ||
    addressObj.city_district ||
    "";
  const province =
    addressObj.province ||
    addressObj.state_district ||
    addressObj.county ||
    addressObj.state ||
    "";
  const region = addressObj.region || addressObj.state || "";
  const postcode = addressObj.postcode || "";

  return { road, barangay, cityMunicipality, province, region, postcode };
}

export async function reverseGeocodeOsm(
  lat: number,
  lng: number,
): Promise<OsmReverseGeocodeResult | null> {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "jsonv2",
          addressdetails: 1,
        },
        headers: {
          Accept: "application/json",
        },
      },
    );

    const data = response.data;
    if (!data || typeof data !== "object") {
      return null;
    }

    const address = (data.address as Record<string, string | undefined>) || {};
    const extracted = extractOsmAddressComponents(address);

    return {
      placeId: data.place_id,
      lat,
      lng,
      displayName: data.display_name || "",
      ...extracted,
    };
  } catch (error) {
    console.error("OSM reverse geocoding failed:", error);
    return null;
  }
}

export async function searchPlacesOsm(query: string): Promise<OsmSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  // 1. Try Photon (ultra-fast geocoding with typo tolerance, bbox for Philippines)
  try {
    const photonRes = await axios.get("https://photon.komoot.io/api/", {
      params: {
        q: trimmed,
        limit: 6,
        bbox: "114.0,4.0,130.0,22.0",
      },
    });

    const data = photonRes.data as {
      features?: Array<{
        properties?: {
          osm_id?: number;
          name?: string;
          street?: string;
          locality?: string;
          district?: string;
          city?: string;
          state?: string;
          country?: string;
        };
        geometry?: { coordinates?: [number, number] };
      }>;
    };

    if (data?.features && data.features.length > 0) {
      return data.features
        .filter((f) => f.geometry?.coordinates && f.properties?.name)
        .map((f) => {
          const p = f.properties || {};
          const parts = [
            p.name,
            p.street,
            p.locality || p.district,
            p.city,
            p.state || p.country,
          ]
            .filter(Boolean)
            .filter((val, idx, arr) => arr.indexOf(val) === idx);

          return {
            placeId: Number(p.osm_id ?? Math.random()),
            lat: f.geometry!.coordinates![1],
            lng: f.geometry!.coordinates![0],
            displayName: parts.join(", "),
          };
        });
    }
  } catch (photonError) {
    console.warn("Photon search fallback to Nominatim:", photonError);
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: trimmed,
          format: "jsonv2",
          countrycodes: "ph",
          limit: 5,
          addressdetails: 1,
        },
        headers: {
          Accept: "application/json",
        },
      },
    );

    const data = (response.data as Array<Record<string, unknown>>) || [];
    if (data.length > 0) {
      return data.map((item) => ({
        placeId: Number(item.place_id),
        lat: parseFloat(String(item.lat)),
        lng: parseFloat(String(item.lon)),
        displayName: String(item.display_name),
      }));
    }

    // Smart fallback: If compound address with commas returned 0 results, try city/province portion
    if (trimmed.includes(",")) {
      const segments = trimmed
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      if (segments.length > 1) {
        const fallbackQuery = segments.slice(1).join(", ");
        return searchPlacesOsm(fallbackQuery);
      }
    }

    return [];
  } catch (error) {
    console.error("OSM place search failed:", error);
    return [];
  }
}

function normalizeAddressTerm(str?: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/^(barangay|brgy\.?|city of|city)\s+/i, "")
    .replace(/\s+(city)$/i, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

export async function matchWithPsgcAddress(extracted: {
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
}): Promise<AddressAutocompleteItem | null> {
  const normBarangay = normalizeAddressTerm(extracted.barangay);
  const normCity = normalizeAddressTerm(extracted.cityMunicipality);

  // 1. Try querying backend autocomplete with barangay + city
  if (normBarangay && normCity) {
    try {
      const candidates = await GetAddressAutocomplete({
        query: `${extracted.barangay} ${extracted.cityMunicipality}`,
        limit: 10,
      });

      const matched = candidates.find((item) => {
        const itemBarangay = normalizeAddressTerm(item.barangay.name);
        const itemCity = normalizeAddressTerm(item.cityMunicipality.name);
        return (
          (itemBarangay === normBarangay ||
            itemBarangay.includes(normBarangay) ||
            normBarangay.includes(itemBarangay)) &&
          (itemCity === normCity ||
            itemCity.includes(normCity) ||
            normCity.includes(itemCity))
        );
      });

      if (matched) return matched;
      if (candidates.length > 0) return candidates[0];
    } catch {
      // ignore
    }
  }

  // 2. Try querying backend autocomplete with just barangay
  if (normBarangay) {
    try {
      const candidates = await GetAddressAutocomplete({
        query: extracted.barangay ?? "",
        limit: 10,
      });

      if (candidates.length > 0) {
        if (normCity) {
          const matched = candidates.find((item) => {
            const itemCity = normalizeAddressTerm(item.cityMunicipality.name);
            return (
              itemCity === normCity ||
              itemCity.includes(normCity) ||
              normCity.includes(itemCity)
            );
          });
          if (matched) return matched;
        }
        return candidates[0];
      }
    } catch {
      // ignore
    }
  }

  // 3. Try querying backend autocomplete with city
  if (normCity) {
    try {
      const candidates = await GetAddressAutocomplete({
        query: extracted.cityMunicipality ?? "",
        limit: 10,
      });

      if (candidates.length > 0) return candidates[0];
    } catch {
      // ignore
    }
  }

  return null;
}
