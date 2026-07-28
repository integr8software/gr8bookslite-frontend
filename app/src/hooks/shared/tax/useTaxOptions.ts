"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	TaxQueryKeys,
	fetchPartyTaxDefaultClassifications,
	fetchTaxes,
} from "@/app/src/services/shared/tax/TaxApi";
import type {
	PartyTaxDefaultOptions,
	Tax,
	TaxDefaultClassification,
	TaxDefaultOption,
	TaxListQuery,
} from "@/app/src/types/shared/tax/TaxTypes";
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
const PartyTaxDefaultDropdownLimit = 1000;

export type TaxDefaultOptionFormatting = {
	includeRateInName?: boolean;
	showDescription?: boolean;
	sortBy?: "name" | "rate";
	sortByName?: boolean;
};

export function useTaxes(
	query: TaxListQuery = {},
) {
	const normalizedQuery = useMemo(
		() => ({
			limit: AtcDropdownLimit,
			...query,
		}),
		[query],
	);

	return useQuery({
		queryKey: TaxQueryKeys.list(normalizedQuery),
		queryFn: () => fetchTaxes(normalizedQuery),
		staleTime: 5 * 60 * 1000,
	});
}

export function useTaxDefaultOptions<TKey extends string>(
	classifications: TaxDefaultClassification<TKey>[],
	formatOption?: (
		tax: Tax,
		classification: TaxDefaultClassification<TKey>,
	) => TaxDefaultOptionFormatting,
) {
	const taxesQuery = useTaxes({ limit: PartyTaxDefaultDropdownLimit });

	const options = useMemo(
		() => createTaxDefaultOptions(taxesQuery.data ?? [], classifications, formatOption),
		[classifications, formatOption, taxesQuery.data],
	);

	return {
		...taxesQuery,
		options,
	};
}

export function usePartyTaxDefaultOptions() {
	const taxesQuery = useTaxes({ limit: PartyTaxDefaultDropdownLimit });
	const classificationsQuery = useQuery({
		queryKey: TaxQueryKeys.partyDefaultClassifications(),
		queryFn: fetchPartyTaxDefaultClassifications,
		staleTime: 5 * 60 * 1000,
	});

	const options = useMemo(() => {
		const classifications = classificationsQuery.data ?? [];
		const taxes = taxesQuery.data ?? [];

		return createTaxDefaultOptions(
			taxes,
			classifications,
			getPartyTaxDefaultFormatting,
		) as PartyTaxDefaultOptions;
	}, [classificationsQuery.data, taxesQuery.data]);

	return {
		isLoading: taxesQuery.isLoading || classificationsQuery.isLoading,
		options,
		refetch: () => {
			void taxesQuery.refetch();
			void classificationsQuery.refetch();
		},
	};
}

export function usePartyAtcCodeOptions(
	classification: PartyClassification | "",
) {
	const taxCodesQuery = useTaxes();

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
	taxCodes: Tax[],
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

function createPartyAtcCodeOption(taxCode: Tax) {
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
	taxCode: Tax,
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

function getPartyAtcDescription(taxCode: Tax) {
	return (
		taxCode.natureOfIncome?.trim() ||
		taxCode.taxDescription.replace(/^[A-Z]{2}\s?\d{3}\s*\|\s*/, "").trim()
	);
}

function getPartyAtcRowPriority(taxCode: Tax) {
	const isDirectAtcRow =
		taxCode.officialAtcCode === normalizeAtcCode(taxCode.taxCode);

	return (
		(isDirectAtcRow ? 1_000_000 : 0) + getPartyAtcDescription(taxCode).length
	);
}

export function createTaxDefaultOptions<TKey extends string>(
	taxes: Tax[],
	classifications: TaxDefaultClassification<TKey>[],
	formatOption: (
		tax: Tax,
		classification: TaxDefaultClassification<TKey>,
	) => TaxDefaultOptionFormatting = getDefaultTaxDefaultFormatting,
) {
	return Object.fromEntries(
		classifications.map((classification) => {
			const formattedOptions = taxes
				.filter((tax) => isTaxInDefaultClassification(tax, classification))
				.map((tax) => {
					const formatting = formatOption(tax, classification);

					return {
						formatting,
						option: createTaxDefaultOption(tax, formatting),
						tax,
					};
				});

			const options = formattedOptions.map(({ option }) => option);
			const sortMode = getTaxDefaultSortMode(
				formattedOptions.map(({ formatting }) => formatting),
			);

			if (sortMode === "rate") {
				formattedOptions.sort((first, second) =>
					compareTaxDefaultRates(first.tax, second.tax) ||
					first.option.name.localeCompare(second.option.name),
				);

				return [
					classification.key,
					formattedOptions.map(({ option }) => option),
				];
			}

			if (sortMode === "name") {
				options.sort((first, second) => first.name.localeCompare(second.name));
			}

			return [classification.key, options];
		}),
	) as Record<TKey, TaxDefaultOption[]>;
}

export function createTaxDefaultOption(
	tax: Tax,
	formatting: TaxDefaultOptionFormatting = getDefaultTaxDefaultFormatting(tax),
): TaxDefaultOption {
	const rate = formatPercentage(tax.taxRate);
	const description = getPartyAtcDescription(tax);
	const displayCode = tax.officialAtcCode || tax.taxCode;
	const displayName = getPartyTaxDefaultDisplayName(tax, description);
	const showDescription = formatting.showDescription ?? true;

	return {
		code: tax.sourceKey,
		description:
			showDescription
				? [tax.transactionType, tax.taxType, displayCode, rate]
						.filter(Boolean)
						.join(" - ")
				: "",
		label: "",
		name: getTaxDefaultOptionName(tax, displayName, rate, formatting),
		selectedDetails: `${displayCode} - ${tax.transactionType} ${tax.taxType}`,
		value: tax.sourceKey,
	};
}

function isTaxInDefaultClassification<TKey extends string>(
	tax: Tax,
	classification: TaxDefaultClassification<TKey>,
) {
	return (
		tax.transactionType === classification.transactionType &&
		classification.taxTypes.includes(tax.taxType) &&
		(!classification.officialAtcCodePrefix ||
			tax.officialAtcCode?.startsWith(classification.officialAtcCodePrefix))
	);
}

function getDefaultTaxDefaultFormatting(tax: Tax): TaxDefaultOptionFormatting {
	const isVatDefault = isVatDefaultTaxType(tax.taxType);

	return {
		includeRateInName: isVatDefault,
		showDescription: !isVatDefault,
		sortByName: false,
	};
}

function getPartyTaxDefaultFormatting(
	tax: Tax,
	classification: TaxDefaultClassification,
): TaxDefaultOptionFormatting {
	const isVatDefault = isVatDefaultTaxType(tax.taxType);

	return {
		includeRateInName:
			isVatDefault || shouldUseTitleOnlyTaxDefault(classification.key),
		showDescription: !isVatDefault,
		sortBy: getTaxDefaultSortModeForClassification(classification.key),
		sortByName: shouldSortTaxDefaultByName(classification.key),
	};
}

function getTaxDefaultSortMode(
	formattingOptions: TaxDefaultOptionFormatting[],
) {
	if (formattingOptions.some((formatting) => formatting.sortBy === "rate")) {
		return "rate";
	}

	if (
		formattingOptions.some(
			(formatting) => formatting.sortBy === "name" || formatting.sortByName,
		)
	) {
		return "name";
	}

	return "";
}

function compareTaxDefaultRates(first: Tax, second: Tax) {
	return Number(first.taxRate) - Number(second.taxRate);
}

function getTaxDefaultOptionName(
	tax: Tax,
	displayName: string,
	rate: string,
	formatting: TaxDefaultOptionFormatting,
) {
	if ((formatting.includeRateInName ?? false) && !tax.taxExempt) {
		return `${displayName} (${rate})`;
	}

	return displayName;
}

function shouldUseTitleOnlyTaxDefault(classificationKey: string) {
	return [
		"defaultSalesCwtTaxSourceKey",
		"defaultSalesWvatTaxSourceKey",
	].includes(classificationKey);
}

function shouldSortTaxDefaultByName(classificationKey: string) {
	return ![
		"defaultPurchaseInputVatTaxSourceKey",
		"defaultSalesOutputVatTaxSourceKey",
		"defaultPurchaseWvatTaxSourceKey",
		"defaultSalesCwtTaxSourceKey",
		"defaultSalesWvatTaxSourceKey",
	].includes(classificationKey);
}

function getTaxDefaultSortModeForClassification(
	classificationKey: string,
): TaxDefaultOptionFormatting["sortBy"] {
	if (
		[
			"defaultPurchaseWvatTaxSourceKey",
			"defaultSalesCwtTaxSourceKey",
			"defaultSalesWvatTaxSourceKey",
		].includes(classificationKey)
	) {
		return "rate";
	}

	return undefined;
}

function isVatDefaultTaxType(taxType?: string) {
	return taxType === "INPUT VAT" || taxType === "OUTPUT VAT";
}

function getPartyTaxDefaultDisplayName(
	tax: Tax,
	description: string,
) {
	const rawName =
		tax.taxDescription
			.replace(/^[A-Z]{1,3}\s?\d{0,3}(?:\.\d+)?\s*\|\s*/, "")
			.trim() || description;

	const withoutDuplicateRate = rawName
		.replace(/\s*\(?\d+(?:\.\d+)?%\)?\s*$/u, "")
		.trim();

	if (tax.taxType === "INPUT VAT" || tax.taxType === "OUTPUT VAT") {
		return withoutDuplicateRate.replace(/^VAT$/i, `${tax.taxType === "INPUT VAT" ? "Input" : "Output"} VAT`);
	}

	if (tax.taxType === "WVAT") {
		return withoutDuplicateRate.replace(/^Withholding Vatable Tax$/i, "VAT Withholding");
	}

	return withoutDuplicateRate;
}
