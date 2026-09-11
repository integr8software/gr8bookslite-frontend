"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Crosshair,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import type {
  LeafletMouseEvent,
  Map as LeafletMap,
  Marker as LeafletMarker,
} from "leaflet";
import type {
  AddressAutocompleteDetails,
  AddressAutocompleteItem,
  OsmReverseGeocodeResult,
  OsmSearchResult,
} from "@/app/src/types/shared/address/AddressTypes";
import {
  matchWithPsgcAddress,
  reverseGeocodeOsm,
  searchPlacesOsm,
} from "@/app/src/services/shared/address/AddressGeocodingService";

export type AppAddressMapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApplyAddress: (data: {
    addressLine1: string;
    psgcItem?: AddressAutocompleteItem | null;
    rawOsm: OsmReverseGeocodeResult;
    details?: AddressAutocompleteDetails;
  }) => void;
  initialProvince?: string;
  initialCity?: string;
  initialBarangay?: string;
};

// Default center: Manila, Philippines
const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 };
const DEFAULT_ZOOM = 12;

export function AppAddressMapModal({
  isOpen,
  onClose,
  onApplyAddress,
  initialProvince,
  initialCity,
  initialBarangay,
}: AppAddressMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerInstanceRef = useRef<LeafletMarker | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchRequestRef = useRef(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OsmSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<OsmReverseGeocodeResult | null>(null);
  const [psgcMatch, setPsgcMatch] = useState<AddressAutocompleteItem | null>(null);

  // Initialize and render Leaflet map
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function setupMap() {
      if (!mapContainerRef.current) return;

      const L = (await import("leaflet")).default;

      // Ensure container isn't already initialized
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom themed SVG pin icon
      const customPinIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position: relative; transform: translate(-50%, -100%); cursor: grab;">
            <svg width="32" height="40" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
              <path d="M12 0C5.372 0 0 5.372 0 12c0 9 12 18 12 18s12-9 12-18c0-6.628-5.372-12-12-12z" fill="#212738"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 7.8 10 16 10 16s10-8.2 10-16c0-5.523-4.477-10-10-10z" fill="#57c4e5"/>
              <circle cx="12" cy="11" r="4.5" fill="#ffffff"/>
            </svg>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], {
        draggable: true,
        icon: customPinIcon,
      }).addTo(map);

      markerInstanceRef.current = marker;

      // Handle marker drag
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        handlePositionChange(position.lat, position.lng);
      });

      // Handle map click to reposition pin
      map.on("click", (event: LeafletMouseEvent) => {
        const { lat, lng } = event.latlng;
        marker.setLatLng([lat, lng]);
        handlePositionChange(lat, lng);
      });

      // Initial reverse geocoding if initial values exist or for default center
      const initialSearchText = [initialBarangay, initialCity, initialProvince]
        .filter(Boolean)
        .join(", ");

      if (initialSearchText) {
        setSearchQuery(initialSearchText);
        searchPlacesOsm(initialSearchText).then((results) => {
          if (!isMounted) return;
          if (results.length > 0) {
            const first = results[0];
            map.setView([first.lat, first.lng], 15);
            marker.setLatLng([first.lat, first.lng]);
            handlePositionChange(first.lat, first.lng);
          } else {
            handlePositionChange(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
          }
        });
      } else {
        handlePositionChange(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      }

      // Ensure map tiles layout properly on mount
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    setupMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialBarangay, initialCity, initialProvince, isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Position change & reverse geocode handler
  async function handlePositionChange(lat: number, lng: number) {
    setIsLoadingLocation(true);

    try {
      const osmResult = await reverseGeocodeOsm(lat, lng);
      if (osmResult) {
        setGeocodeResult(osmResult);
        const match = await matchWithPsgcAddress({
          barangay: osmResult.barangay,
          cityMunicipality: osmResult.cityMunicipality,
          province: osmResult.province,
        });
        setPsgcMatch(match);
      }
    } finally {
      setIsLoadingLocation(false);
    }
  }

  // Smoothly move map and marker to coordinates
  function flyToCoordinates(lat: number, lng: number, zoom = 16) {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom);
      markerInstanceRef.current.setLatLng([lat, lng]);
      handlePositionChange(lat, lng);
    }
  }

  // Show results only after an explicit search submission.
  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const requestId = ++searchRequestRef.current;
    setSearchResults([]);
    setShowDropdown(true);
    setIsSearching(true);
    try {
      const results = await searchPlacesOsm(query);
      if (requestId !== searchRequestRef.current) return;
      setSearchResults(results);
    } catch (err) {
      if (requestId !== searchRequestRef.current) return;
      console.error("Search error:", err);
      setShowDropdown(false);
      toast.error("Failed to search location. Please check your internet connection.");
    } finally {
      if (requestId === searchRequestRef.current) setIsSearching(false);
    }
  }
  // Select search result from dropdown
  function handleSelectSearchResult(result: OsmSearchResult) {
    searchRequestRef.current += 1;
    setShowDropdown(false);
    setSearchResults([]);
    setSearchQuery(result.displayName);
    flyToCoordinates(result.lat, result.lng);
  }

  // Request a fresh device position with the user's permission.
  function handleLocateMe() {
    if (!window.isSecureContext) {
      toast.error("Location requires a secure connection. Open this site using HTTPS or localhost.");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Your browser does not support device location. Search for your address or place the pin on the map.");
      return;
    }

    setShowDropdown(false);
    setIsLocatingUser(true);
    const activeMap = mapInstanceRef.current;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingUser(false);
        if (!activeMap || mapInstanceRef.current !== activeMap) return;
        const { latitude, longitude, accuracy } = position.coords;
        flyToCoordinates(latitude, longitude, 16);
        toast.success(`Device location detected (accuracy: about ${Math.round(accuracy)} m). Adjust the pin if needed.`);
      },
      (error) => {
        setIsLocatingUser(false);
        if (!activeMap || mapInstanceRef.current !== activeMap) return;
        const message = error.code === 1
          ? "Location access was denied. Allow location for this site in your browser and enable device location services, then try again."
          : error.code === 3
            ? "Your device location request timed out. Try again or place the pin on the map."
            : "Your device location is unavailable. Enable device location services, then try again or place the pin on the map.";
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }
  // Apply selected address to parent form
  function handleApply() {
    if (!geocodeResult) return;

    const road = geocodeResult.road || "";
    const streetLine = road.trim();

    onApplyAddress({
      addressLine1: streetLine,
      psgcItem: psgcMatch,
      rawOsm: geocodeResult,
      details: {
        addressLine1: streetLine,
      },
    });

    onClose();
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-150 flex items-center justify-center bg-slate-950/50 p-2 backdrop-blur-sm sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-map-modal-title"
        className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-darknavy/10 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-darknavy/10 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-skyblue/10 text-skyblue">
              <MapPin className="size-5" />
            </div>
            <div>
              <h2
                id="address-map-modal-title"
                className="text-base font-semibold text-darknavy"
              >
                Pin Address on Map
              </h2>
              <p className="text-xs text-darknavy/60">
                Click or drag the pin anywhere in the Philippines to automatically detect the address.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close map picker"
            className="flex size-8 items-center justify-center rounded-lg text-darknavy/50 transition hover:bg-darknavy/5 hover:text-darknavy"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Top Search & Actions Bar */}
        <div
          ref={searchBarRef}
          className="relative z-[1100] border-b border-darknavy/10 bg-offwhite px-4 py-2.5 sm:px-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <form onSubmit={handleSearch} className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowDropdown(false);
                  }
                }}
                onChange={(e) => {
                  searchRequestRef.current += 1;
                  setSearchQuery(e.target.value);
                  setSearchResults([]);
                  setShowDropdown(false);
                  setIsSearching(false);
                }}
                placeholder="Search street, barangay, municipality, city, or landmark..."
                className="h-10 w-full rounded-lg border border-darknavy/15 bg-white pl-9 pr-20 text-sm text-darknavy placeholder:text-darknavy/40 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
              />
              <Search className="absolute left-3 top-2.5 size-4 text-darknavy/40" />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 top-1.5 inline-flex h-7 items-center rounded-md bg-darknavy px-3 text-xs font-medium text-white transition hover:bg-darknavy/90 disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="size-3 animate-spin" /> : "Search"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocatingUser}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-darknavy/15 bg-white px-3.5 text-xs font-medium text-darknavy shadow-xs transition hover:bg-darknavy/5 disabled:opacity-50"
            >
              {isLocatingUser ? (
                <Loader2 className="size-3.5 animate-spin text-skyblue" />
              ) : (
                <Crosshair className="size-3.5 text-skyblue" />
              )}
              <span>Locate Me</span>
            </button>
          </div>

          {/* Autocomplete suggestions dropdown */}
          {showDropdown && searchQuery.trim().length > 0 && (
            <div className="absolute left-5 right-5 top-full z-[1200] mt-1 max-h-60 overflow-y-auto rounded-xl border border-darknavy/15 bg-white py-1.5 shadow-xl">
              {isSearching ? (
                <div className="flex items-center gap-2.5 px-3.5 py-3 text-xs text-darknavy/60">
                  <Loader2 className="size-4 animate-spin text-skyblue" />
                  <span>Searching locations in the Philippines...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-darknavy/45">
                    Suggested Locations
                  </div>
                  {searchResults.map((item) => (
                    <button
                      key={item.placeId}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className="flex w-full items-start gap-2.5 px-3.5 py-2 text-left text-xs text-darknavy transition hover:bg-skyblue/10"
                    >
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-skyblue" />
                      <span className="line-clamp-2 font-medium">{item.displayName}</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="p-3.5 text-xs text-darknavy/70">
                  <p className="font-semibold text-darknavy">
                    No map locations found for &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-darknavy/60">
                    💡 <strong>Tip:</strong> OpenStreetMap indexes streets, barangays, cities, and landmarks (e.g. <em>&ldquo;Makati&rdquo;</em>, <em>&ldquo;Ortigas&rdquo;</em>, <em>&ldquo;BGC&rdquo;</em>, <em>&ldquo;Ayala&rdquo;</em>). Try searching for the city, town, or street of the location, or click directly on the map.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Middle: Map + Details Area */}
        <div className="relative z-0 flex flex-1 flex-col overflow-hidden md:flex-row">
          {/* Map Container */}
          <div className="relative h-64 flex-1 md:h-full">
            <div ref={mapContainerRef} className="size-full bg-slate-100" />
            <div className="pointer-events-none absolute bottom-2 left-2 z-500 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-darknavy/70 shadow-xs backdrop-blur-xs">
              💡 Tip: Click anywhere or drag the pin to select
            </div>
          </div>

          {/* Location Details Panel */}
          <div className="flex w-full flex-col border-t border-darknavy/10 bg-white p-4 md:w-80 md:border-l md:border-t-0 md:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-darknavy/60">
              Detected Location
            </h3>

            {isLoadingLocation ? (
              <div className="my-auto flex flex-col items-center justify-center gap-2 py-8 text-darknavy/60">
                <Loader2 className="size-6 animate-spin text-skyblue" />
                <span className="text-xs font-medium">Resolving address...</span>
              </div>
            ) : geocodeResult ? (
              <div className="mt-3 flex flex-1 flex-col gap-3">
                {/* Full address summary */}
                <div className="rounded-lg border border-darknavy/10 bg-offwhite p-3">
                  <span className="text-[11px] font-semibold text-darknavy/50">Full Address</span>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-darknavy">
                    {geocodeResult.displayName || "Unknown place"}
                  </p>
                </div>

                {/* Breakdown fields */}
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between border-b border-darknavy/5 pb-1.5">
                    <span className="text-darknavy/55">Barangay</span>
                    <span className="font-semibold text-darknavy">
                      {psgcMatch?.barangay?.name || geocodeResult.barangay || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-darknavy/5 pb-1.5">
                    <span className="text-darknavy/55">City / Municipality</span>
                    <span className="font-semibold text-darknavy">
                      {psgcMatch?.cityMunicipality?.name || geocodeResult.cityMunicipality || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-darknavy/5 pb-1.5">
                    <span className="text-darknavy/55">Province</span>
                    <span className="font-semibold text-darknavy">
                      {psgcMatch?.province?.name || geocodeResult.province || "—"}
                    </span>
                  </div>
                  {geocodeResult.road ? (
                    <div className="flex justify-between border-b border-darknavy/5 pb-1.5">
                      <span className="text-darknavy/55">Road / Street</span>
                      <span className="font-semibold text-darknavy">{geocodeResult.road}</span>
                    </div>
                  ) : null}
                </div>

              </div>
            ) : (
              <div className="my-auto py-8 text-center text-xs text-darknavy/40">
                Click anywhere on the map to detect address details.
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-4 flex gap-2 border-t border-darknavy/10 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-darknavy/15 bg-white py-2 text-xs font-semibold text-darknavy transition hover:bg-darknavy/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!geocodeResult || isLoadingLocation}
                className="flex-1 rounded-lg bg-skyblue py-2 text-xs font-semibold text-white shadow-xs transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply Address
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
