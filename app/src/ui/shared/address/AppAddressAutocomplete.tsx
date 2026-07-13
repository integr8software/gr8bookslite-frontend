"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import {
	GetAddressAutocomplete,
} from "@/app/src/services/shared/address/AddressReferenceApi";
import type {
	AddressAutocompleteDetails,
	AddressAutocompleteItem,
} from "@/app/src/types/shared/address/AddressTypes";
import { AppSearchSuggestions } from "@/app/src/ui/shared/search-suggestions/AppSearchSuggestions";

export type AppAddressAutocompleteValue = {
	addressLine1?: string;
	addressLine2?: string;
	barangay?: string;
	barangayCode?: string;
	cityMunicipality?: string;
	cityMunicipalityCode?: string;
	completeAddress?: string;
	province?: string;
	provinceCode?: string;
};

export function AppAddressAutocomplete({
	disabled = false,
	id,
	label = "Search Address",
	placeholder = "Type barangay, city, province, or code",
	required = false,
	syncDetailsOnQueryChange = false,
	value,
	onCompleteAddressChange,
	onDetailsChange,
	onSelect,
}: {
	disabled?: boolean;
	id: string;
	label?: string;
	placeholder?: string;
	required?: boolean;
	syncDetailsOnQueryChange?: boolean;
	value: AppAddressAutocompleteValue;
	onCompleteAddressChange?: (completeAddress: string) => void;
	onDetailsChange?: (details: AddressAutocompleteDetails) => void;
	onSelect?: (
		address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
	) => void;
}) {
	return (
		<StatefulAddressAutocomplete
			disabled={disabled}
			id={id}
			label={label}
			placeholder={placeholder}
			required={required}
			syncDetailsOnQueryChange={syncDetailsOnQueryChange}
			value={value}
			onCompleteAddressChange={onCompleteAddressChange}
			onDetailsChange={onDetailsChange}
			onSelect={onSelect}
		/>
	);
}

function StatefulAddressAutocomplete({
	disabled,
	id,
	label,
	placeholder,
	required,
	syncDetailsOnQueryChange,
	value,
	onCompleteAddressChange,
	onDetailsChange,
	onSelect,
}: {
	disabled: boolean;
	id: string;
	label: string;
	placeholder: string;
	required: boolean;
	syncDetailsOnQueryChange: boolean;
	value: AppAddressAutocompleteValue;
	onCompleteAddressChange?: (completeAddress: string) => void;
	onDetailsChange?: (details: AddressAutocompleteDetails) => void;
	onSelect?: (
		address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
	) => void;
}) {
	const formattedSelectedAddress = useMemo(
		() => formatSelectedAddress(value),
		[value],
	);
	const [editingQuery, setEditingQuery] = useState(formattedSelectedAddress);
	const [committedQuery, setCommittedQuery] = useState(formattedSelectedAddress);
	const [addresses, setAddresses] = useState<AddressAutocompleteItem[]>([]);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isResultsOpen, setIsResultsOpen] = useState(false);
	const [error, setError] = useState("");
	const query = isEditing
		? editingQuery
		: formattedSelectedAddress || committedQuery;
	const searchQuery = (
		isEditing
			? getAutocompleteSearchTerm(query)
			: value.cityMunicipality || value.province || query
	).trim();
	const sortedAddresses = useMemo(
		() =>
			addresses
				.filter(
					(candidate) =>
						!isEditing || matchesAutocompleteQuery(candidate, query),
				)
				.sort((first, second) => {
					const relevanceDifference =
						getAutocompleteRelevanceScore(second, query) -
						getAutocompleteRelevanceScore(first, query);

					return (
						relevanceDifference ||
						formatAutocompleteAddress(first).localeCompare(
							formatAutocompleteAddress(second),
						)
					);
				}),
		[addresses, isEditing, query],
	);

	useEffect(() => {
		if (disabled || !isResultsOpen || searchQuery.length < 2) {
			return;
		}

		let isCurrent = true;
		const timeoutId = window.setTimeout(async () => {
			setIsLoading(true);
			setError("");

			try {
				const nextAddresses = await GetAddressAutocomplete({
					query: searchQuery,
				});

				if (isCurrent) {
					setAddresses(nextAddresses);
				}
			} catch (requestError) {
				if (isCurrent) {
					setAddresses([]);
					setError(getAddressAutocompleteError(requestError));
				}
			} finally {
				if (isCurrent) {
					setIsLoading(false);
				}
			}
		}, 250);

		return () => {
			isCurrent = false;
			window.clearTimeout(timeoutId);
		};
	}, [disabled, isResultsOpen, searchQuery]);

	if (disabled) {
		return null;
	}

	return (
		<div className="grid gap-2">
			<label htmlFor={id} className="text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</label>
			<AppSearchSuggestions
				compact
				emptyMessage="No address options found."
				floatingResults
				getKey={(address) => address.barangay.code}
				getTitle={(address) => formatAutocompleteSuggestion(address, query)}
				id={id}
				inputLabel={label}
				isLoading={isLoading}
				isResultsOpen={isResultsOpen}
				items={sortedAddresses}
				maxVisibleItems={25}
				minQueryLength={2}
				placeholder={placeholder}
				query={query}
				resultIcon={MapPin}
				onInputFocus={() => {
					if (query.trim().length >= 2) {
						setIsResultsOpen(true);
					}
				}}
				onQueryChange={(nextQuery) => {
					setEditingQuery(nextQuery);
					setCommittedQuery(nextQuery);
					setIsEditing(true);
					setIsResultsOpen(nextQuery.trim().length >= 2);
					onCompleteAddressChange?.(nextQuery);

					if (syncDetailsOnQueryChange) {
						onDetailsChange?.(
							getAutocompleteAddressDetails(nextQuery, value, {
								preserveCurrentDetails: false,
							}),
						);
					}

					if (nextQuery.trim().length < 2) {
						setAddresses([]);
						setError("");
						setIsLoading(false);
					}
				}}
				onResultsClose={() => setIsResultsOpen(false)}
				onSelect={(selectedAddress) => {
					const selectedDetails = getAutocompleteAddressDetails(query, value, {
						preserveCurrentDetails: !hasAutocompleteDetailParts(query),
					});
					const selectedCompleteAddress = formatAutocompleteSuggestion(
						selectedAddress,
						query,
					);

					setEditingQuery(selectedCompleteAddress);
					setCommittedQuery(selectedCompleteAddress);
					setIsEditing(false);
					setIsResultsOpen(false);
					onCompleteAddressChange?.(selectedCompleteAddress);
					onSelect?.(selectedAddress, selectedDetails);
				}}
			/>
			{error ? (
				<span className="text-xs font-medium text-coralpink">{error}</span>
			) : null}
		</div>
	);
}

function formatAutocompleteAddress(address: AddressAutocompleteItem) {
	return [
		removePoblacionMarker(address.barangay.name),
		address.cityMunicipality.name,
		address.province.name,
	]
		.map(normalizeSpacing)
		.filter(Boolean)
		.join(", ");
}

function formatAutocompleteSuggestion(
	address: AddressAutocompleteItem,
	query: string,
) {
	return [
		...getAutocompleteDetailParts(query),
		formatAutocompleteAddress(address),
	]
		.map(normalizeSpacing)
		.filter(Boolean)
		.join(", ");
}

function formatSelectedAddress(value: AppAddressAutocompleteValue) {
	const structuredAddress = [
		value.addressLine1,
		value.addressLine2,
		removePoblacionMarker(value.barangay ?? ""),
		value.cityMunicipality,
		value.province,
	]
		.map((part) => normalizeSpacing(part ?? ""))
		.filter(Boolean)
		.join(", ");

	return structuredAddress || normalizeSpacing(value.completeAddress ?? "");
}

function getAutocompleteSearchTerm(query: string) {
	const parts = getAutocompleteAdministrativeParts(query);
	const barangayIndex = parts.findIndex((part) =>
		/^(barangay|brgy\.?|bgy\.?)\b/i.test(part),
	);

	if (barangayIndex >= 0 && parts[barangayIndex + 1]) {
		return normalizeAutocompleteText(parts[barangayIndex + 1]);
	}

	if (parts.length >= 3) {
		return normalizeAutocompleteText(parts[0]);
	}

	if (parts.length >= 2) {
		return normalizeAutocompleteText(parts.at(-2) ?? parts[0]);
	}

	return normalizeAutocompleteText(
		parts.reduce(
			(longestPart, part) =>
				part.length > longestPart.length ? part : longestPart,
			"",
		) || query.trim(),
	);
}

function matchesAutocompleteQuery(
	address: AddressAutocompleteItem,
	query: string,
) {
	const fieldQuery = getAutocompleteFieldQuery(query);

	if (fieldQuery) {
		return (
			matchesAddressField(address.barangay.name, fieldQuery.barangay) &&
			matchesAddressField(
				address.cityMunicipality.name,
				fieldQuery.cityMunicipality,
			) &&
			matchesAddressField(address.province.name, fieldQuery.province)
		);
	}

	const normalizedAddress = normalizeAutocompleteText(
		formatAutocompleteAddress(address),
	);

	return getAutocompleteAdministrativeParts(query).every((part) =>
		normalizedAddress.includes(normalizeAutocompleteText(part)),
	);
}

function getAutocompleteRelevanceScore(
	address: AddressAutocompleteItem,
	query: string,
) {
	const fieldQuery = getAutocompleteFieldQuery(query);

	if (!fieldQuery) {
		return 0;
	}

	return (
		getAddressFieldScore(address.barangay.name, fieldQuery.barangay) * 100 +
		getAddressFieldScore(
			address.cityMunicipality.name,
			fieldQuery.cityMunicipality,
		) *
		10 +
		getAddressFieldScore(address.province.name, fieldQuery.province)
	);
}

function getAutocompleteFieldQuery(query: string) {
	const parts = getAutocompleteAdministrativeParts(query);

	if (!parts[0]) {
		return null;
	}

	if (!/^(barangay|brgy\.?|bgy\.?)\b/i.test(parts[0]) && parts.length < 3) {
		return null;
	}

	return {
		barangay: normalizeAutocompleteText(parts[0]),
		cityMunicipality: normalizeAutocompleteText(parts[1] ?? ""),
		province: normalizeAutocompleteText(parts[2] ?? ""),
	};
}

function matchesAddressField(value: string, query: string) {
	return !query || normalizeAutocompleteText(value).includes(query);
}

function getAddressFieldScore(value: string, query: string) {
	if (!query) {
		return 0;
	}

	const normalizedValue = normalizeAutocompleteText(value);

	if (normalizedValue === query) {
		return 3;
	}

	if (normalizedValue.startsWith(query)) {
		return 2;
	}

	return normalizedValue.includes(query) ? 1 : 0;
}

function getAutocompleteAdministrativeParts(query: string) {
	const parts = splitAutocompleteQuery(query).filter(
		(part) => !isCountryPart(part),
	);
	const barangayIndex = parts.findIndex((part) =>
		/^(barangay|brgy\.?|bgy\.?)\b/i.test(part),
	);

	if (barangayIndex >= 0) {
		return parts.slice(barangayIndex, barangayIndex + 3);
	}

	if (parts.length > 3) {
		return parts.slice(-3);
	}

	return parts.filter((part) => !isLikelyStreetAddress(part));
}

function getAutocompleteAddressDetails(
	query: string,
	currentValue: AppAddressAutocompleteValue,
	options: { preserveCurrentDetails?: boolean } = {},
): AddressAutocompleteDetails {
	const preserveCurrentDetails = options.preserveCurrentDetails ?? true;
	const cleanedCurrentAddressLine1Parts = getUniqueAutocompleteParts(
		splitAutocompleteQuery(currentValue.addressLine1 ?? ""),
	);
	const cleanedCurrentAddressLine2Parts = getUniqueAutocompleteParts(
		splitAutocompleteQuery(currentValue.addressLine2 ?? ""),
	).filter(
		(part) =>
			!cleanedCurrentAddressLine1Parts.some((currentPart) =>
				areSameAutocompletePart(part, currentPart),
			),
	);
	const currentDetailParts = [
		...cleanedCurrentAddressLine1Parts,
		...cleanedCurrentAddressLine2Parts,
	];
	const detailParts = getUniqueAutocompleteParts(
		getAutocompleteDetailParts(query).filter((part) => {
			if (!preserveCurrentDetails) {
				return true;
			}

			return !currentDetailParts.some((currentPart) =>
				areSameAutocompletePart(part, currentPart),
			);
		}),
	);
	const { addressLine1Parts, addressLine2Parts } =
		getAutocompleteAddressDetailLines(detailParts);
	const cleanedCurrentAddressLine1 =
		cleanedCurrentAddressLine1Parts.join(", ");
	const cleanedCurrentAddressLine2 =
		cleanedCurrentAddressLine2Parts.join(", ");
	const parsedAddressLine1 = addressLine1Parts.join(", ");
	const parsedAddressLine2 = addressLine2Parts.join(", ");

	if (!preserveCurrentDetails) {
		return {
			addressLine1: parsedAddressLine1,
			addressLine2: parsedAddressLine2,
		};
	}

	return {
		addressLine1:
			parsedAddressLine1 ||
			getChangedAutocompleteDetailLine(
				currentValue.addressLine1 ?? "",
				cleanedCurrentAddressLine1,
			),
		addressLine2:
			parsedAddressLine2 ||
			getChangedAutocompleteDetailLine(
				currentValue.addressLine2 ?? "",
				cleanedCurrentAddressLine2,
			),
	};
}

function getAutocompleteAddressDetailLines(detailParts: string[]) {
	const buildingParts = detailParts.filter(isBuildingAddressPart);

	if (buildingParts.length > 0) {
		return {
			addressLine1Parts: buildingParts,
			addressLine2Parts: detailParts.filter(
				(part) => !isBuildingAddressPart(part),
			),
		};
	}

	const streetParts = detailParts.filter(isLikelyStreetAddress);

	if (streetParts.length > 0) {
		return {
			addressLine1Parts: detailParts.filter(
				(part) => !isLikelyStreetAddress(part),
			),
			addressLine2Parts: streetParts,
		};
	}

	return {
		addressLine1Parts: detailParts,
		addressLine2Parts: [],
	};
}

function getAutocompleteDetailParts(query: string) {
	const parts = splitAutocompleteQuery(query);
	const barangayIndex = parts.findIndex((part) =>
		/^(barangay|brgy\.?|bgy\.?)\b/i.test(part),
	);
	const detailParts =
		barangayIndex >= 0
			? parts.slice(0, barangayIndex)
			: getAutocompleteLeadingDetailParts(parts);

	return getUniqueAutocompleteParts(
		detailParts.filter((part) => !isCountryPart(part)),
	);
}

function hasAutocompleteDetailParts(query: string) {
	return getAutocompleteDetailParts(query).length > 0;
}

function getAutocompleteLeadingDetailParts(parts: string[]) {
	const administrativeParts = getAutocompleteAdministrativeParts(
		parts.join(", "),
	);

	if (administrativeParts.length === 0) {
		return parts;
	}

	const administrativeStartIndex = findAutocompletePartsStartIndex(
		parts,
		administrativeParts,
	);

	if (administrativeStartIndex >= 0) {
		return parts.slice(0, administrativeStartIndex);
	}

	return parts.slice(0, Math.max(0, parts.length - administrativeParts.length));
}

function findAutocompletePartsStartIndex(
	parts: string[],
	administrativeParts: string[],
) {
	const normalizedAdministrativeParts = administrativeParts.map(
		normalizeAutocompleteText,
	);

	for (
		let index = 0;
		index <= parts.length - normalizedAdministrativeParts.length;
		index += 1
	) {
		const matches = normalizedAdministrativeParts.every(
			(administrativePart, offset) =>
				normalizeAutocompleteText(parts[index + offset] ?? "") ===
				administrativePart,
		);

		if (matches) {
			return index;
		}
	}

	return -1;
}

function getChangedAutocompleteDetailLine(
	currentValue: string,
	nextValue: string,
) {
	if (!nextValue || normalizeSpacing(currentValue) === nextValue) {
		return undefined;
	}

	return nextValue;
}

function getUniqueAutocompleteParts(parts: string[]) {
	const seenParts = new Set<string>();

	return parts.map(normalizeSpacing).filter((part) => {
		const normalizedPart = normalizeAutocompleteText(part);

		if (!normalizedPart || seenParts.has(normalizedPart)) {
			return false;
		}

		seenParts.add(normalizedPart);
		return true;
	});
}

function areSameAutocompletePart(first: string, second: string) {
	return normalizeAutocompleteText(first) === normalizeAutocompleteText(second);
}

function splitAutocompleteQuery(query: string) {
	return query
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);
}

function isLikelyStreetAddress(value: string) {
	return (
		/^\d/.test(value) ||
		/\b(street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd\.?|highway|hwy\.?|subdivision|village)\b/i.test(
			value,
		)
	);
}

function isBuildingAddressPart(value: string) {
	return /\b(building|bldg\.?|unit|room|floor|flr\.?|lot|block|blk\.?|house|no\.?)\b/i.test(
		value,
	);
}

function isCountryPart(value: string) {
	return /^(philippines|ph)$/i.test(value.trim());
}

function removePoblacionMarker(value: string) {
	return value.replace(/\s*\(\s*pob\.?\s*\)\s*/gi, " ").trim();
}

function normalizeAutocompleteText(value: string) {
	return removePoblacionMarker(value)
		.toLowerCase()
		.replace(/\bphilippines\b/g, "")
		.replace(/\b\d{4}\b/g, "")
		.replace(/\bcity of\b|\bcity\b/g, "")
		.replace(/\bbarangay\b|\bbrgy\.?\b|\bbgy\.?\b/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function normalizeSpacing(value: string) {
	return value
		.replace(/\s+/g, " ")
		.replace(/\s*,\s*/g, ", ")
		.replace(/^[,\s]+|[,\s]+$/g, "")
		.trim();
}

function getAddressAutocompleteError(error: unknown) {
	return error instanceof Error ? error.message : "Unable to search addresses.";
}
