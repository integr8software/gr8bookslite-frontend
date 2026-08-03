"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	AlphanumericTaxCodeQueryKeys,
	fetchAlphanumericTaxCodes,
} from "@/app/src/services/shared/tax/AlphanumericTaxCodeApi";
import type {
	AlphanumericTaxCode,
	AlphanumericTaxCodeListQuery,
} from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import {
	getAtcPartyClassification,
	normalizeAtcCode,
} from "@/app/src/data/shared/tax/AtcCode";
import type {
	PartyAtcCodeOption,
	PartyClassification,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { formatPercentage } from "@/app/src/utils/percentage.util";

const AtcDropdownLimit = 1000;

export function useAlphanumericTaxCodes(
	query: AlphanumericTaxCodeListQuery = {},
) {
	const normalizedQuery = useMemo(
		() => ({
			limit: AtcDropdownLimit,
			...query,
		}),
		[query],
	);

	return useQuery({
		queryKey: AlphanumericTaxCodeQueryKeys.list(normalizedQuery),
		queryFn: () => fetchAlphanumericTaxCodes(normalizedQuery),
		staleTime: 5 * 60 * 1000,
	});
}

export function usePartyAtcCodeOptions(
	classification: PartyClassification | "",
) {
	const taxCodesQuery = useAlphanumericTaxCodes();

	const options = useMemo(
		() =>
			classification
				? createPartyAtcCodeOptions(taxCodesQuery.data ?? []).filter((option) =>
						option.classifications.includes(classification),
					)
				: [],
		[classification, taxCodesQuery.data],
	);

	return {
		...taxCodesQuery,
		options,
	};
}

export function createPartyAtcCodeOptions(
	taxCodes: AlphanumericTaxCode[],
): PartyAtcCodeOption[] {
	const optionsByCode = new Map<
		string,
		{ option: PartyAtcCodeOption; priority: number }
	>();

	for (const taxCode of taxCodes) {
		if (!taxCode.officialAtcCode) {
			continue;
		}

		const option = createPartyAtcCodeOption(taxCode);
		const priority = getPartyAtcRowPriority(taxCode);
		const currentOption = optionsByCode.get(option.code);

		if (!currentOption || priority > currentOption.priority) {
			optionsByCode.set(option.code, { option, priority });
		}
	}

	return [...optionsByCode.values()]
		.map(({ option }) => option)
		.sort((first, second) => first.code.localeCompare(second.code));
}

function createPartyAtcCodeOption(taxCode: AlphanumericTaxCode) {
	const officialAtcCode = normalizeAtcCode(
		taxCode.officialAtcCode ?? taxCode.taxCode,
	);

	return {
		category: getPartyAtcCategory(taxCode, officialAtcCode),
		classifications: getPartyAtcClassifications(officialAtcCode),
		code: officialAtcCode,
		description: getPartyAtcDescription(taxCode),
		label: formatPercentage(taxCode.taxRate),
	};
}

function getPartyAtcCategory(
	taxCode: AlphanumericTaxCode,
	officialAtcCode: string,
) {
	if (officialAtcCode.startsWith("WV ")) {
		return "VAT Withholding";
	}

	if (taxCode.taxType === "CWT") {
		return "Creditable Withholding Tax";
	}

	if (officialAtcCode.startsWith("WB ")) {
		return "Business Tax Withholding";
	}

	if (taxCode.taxType === "EWT") {
		return "Expanded Withholding Tax";
	}

	return taxCode.taxType;
}

function getPartyAtcClassifications(code: string): PartyClassification[] {
	const classification = getAtcPartyClassification(code);

	if (classification === "individual") {
		return ["Individual"];
	}

	if (classification === "nonIndividual") {
		return ["Non-Individual"];
	}

	return ["Individual", "Non-Individual"];
}

function getPartyAtcDescription(taxCode: AlphanumericTaxCode) {
	return (
		taxCode.natureOfIncome?.trim() ||
		taxCode.taxDescription.replace(/^[A-Z]{2}\s?\d{3}\s*\|\s*/, "").trim()
	);
}

function getPartyAtcRowPriority(taxCode: AlphanumericTaxCode) {
	const isDirectAtcRow =
		taxCode.officialAtcCode === normalizeAtcCode(taxCode.taxCode);

	return (
		(isDirectAtcRow ? 1_000_000 : 0) + getPartyAtcDescription(taxCode).length
	);
}
