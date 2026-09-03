"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	TaxQueryKeys,
	fetchTaxDefaultAccountOptionGroups,
	fetchTaxes,
} from "@/app/src/services/shared/tax/TaxApi";
import type {
	PartyTaxDefaultOptions,
	Tax,
	TaxDefaultAccountOption,
	TaxDefaultAccountOptionClassification,
	TaxDefaultAccountOptionGroup,
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
const PartyTaxDefaultGroupKeyByClassification: Partial<Record<TaxDefaultAccountOptionClassification, keyof PartyTaxDefaultOptions>> = {
	"input-purchases": "defaultPurchaseInputVatTaxSourceKey",
	"output-sales": "defaultSalesOutputVatTaxSourceKey",
	"purchase-ewt": "defaultPurchaseEwtTaxSourceKey",
	"purchase-fwt": "defaultPurchaseFwtTaxSourceKey",
	"purchase-wvat": "defaultPurchaseWvatTaxSourceKey",
	"sales-cwt": "defaultSalesCwtTaxSourceKey",
	"sales-wvat": "defaultSalesWvatTaxSourceKey",
};

export type TaxDefaultOptionFormatting = {
	includeRateInName?: boolean;
	nameFormat?: "description" | "codeRate";
	showDescription?: boolean;
	sortBy?: "name" | "rate";
	sortByName?: boolean;
};

type TaxOptionFormattingSource = Pick<Tax, "taxExempt" | "taxRate" | "taxType">;
type TaxOptionDisplaySource = Pick<Tax, "taxCode" | "taxDescription" | "taxExempt" | "taxRate" | "taxType"> & {
	displayCode?: string;
	natureOfIncome?: string | null;
	officialAtcCode?: string | null;
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

export function useTaxDefaultAccountOptionGroups(
	classification?: TaxDefaultAccountOptionClassification,
) {
	return useQuery({
		queryKey: TaxQueryKeys.defaultAccountOptions(classification),
		queryFn: () => fetchTaxDefaultAccountOptionGroups(classification),
		staleTime: 5 * 60 * 1000,
	});
}

export function usePartyTaxDefaultOptions() {
	const defaultAccountOptionsQuery = useTaxDefaultAccountOptionGroups();

	const options = useMemo(() => {
		return createPartyTaxDefaultOptionsFromAccountGroups(defaultAccountOptionsQuery.data ?? []);
	}, [defaultAccountOptionsQuery.data]);

	return {
		isError: defaultAccountOptionsQuery.isError,
		isLoading: defaultAccountOptionsQuery.isLoading,
		options,
		refetch: () => {
			void defaultAccountOptionsQuery.refetch();
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

function getPartyAtcDescription(taxCode: TaxOptionDisplaySource) {
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
	const codeRateName = formatTaxDefaultCodeRateName(displayCode, rate);
	const displayName = getPartyTaxDefaultDisplayName(tax, description);
	const showDescription = formatting.showDescription ?? true;

	return {
		code: tax.sourceKey,
		description: showDescription ? displayName : "",
		disabled: tax.status === "INACTIVE",
		label: "",
		name: getTaxDefaultOptionName(tax, displayName, codeRateName, rate, formatting),
		selectedDetails: codeRateName,
		value: tax.sourceKey,
	};
}

export function createTaxDefaultAccountDropdownOption(
	tax: TaxDefaultAccountOption,
	formatting: TaxDefaultOptionFormatting = getDefaultTaxDefaultFormatting(tax),
): TaxDefaultOption {
	const rate = formatPercentage(tax.taxRate);
	const description = getPartyAtcDescription(tax);
	const displayCode = tax.displayCode || tax.taxCode;
	const codeRateName = formatTaxDefaultCodeRateName(displayCode, rate);
	const displayName = getPartyTaxDefaultDisplayName(tax, description);
	const showDescription = formatting.showDescription ?? true;

	return {
		code: tax.sourceKey,
		defaultAccountCode: tax.defaultAccountCode,
		defaultAccountRole: tax.defaultAccountRole,
		defaultAccountTitle: tax.defaultAccountTitle,
		description: showDescription ? displayName : "",
		disabled: tax.status === "INACTIVE",
		label: tax.defaultAccountTitle ?? "",
		name: getTaxDefaultOptionName(tax, displayName, codeRateName, rate, formatting),
		selectedDetails: tax.defaultAccountTitle ?? codeRateName,
		value: tax.sourceKey,
	};
}

function createPartyTaxDefaultOptionsFromAccountGroups(
	groups: TaxDefaultAccountOptionGroup[],
): PartyTaxDefaultOptions {
	const entries = Object.values(PartyTaxDefaultGroupKeyByClassification).map((key) => [key, []]);
	const options = Object.fromEntries(entries) as PartyTaxDefaultOptions;

	groups.forEach((group) => {
		const key = PartyTaxDefaultGroupKeyByClassification[group.classification];

		if (!key) {
			return;
		}

		options[key] = group.options
			.map((tax) =>
				createTaxDefaultAccountDropdownOption(
					tax,
					getPartyTaxDefaultFormatting(tax, {
						key,
						label: group.label,
						taxTypes: [tax.taxType],
						transactionType: tax.transactionType,
					}),
				),
			)
			.sort((first, second) => first.name.localeCompare(second.name));
	});

	return options;
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

function getDefaultTaxDefaultFormatting(tax: TaxOptionFormattingSource): TaxDefaultOptionFormatting {
	const isVatDefault = isVatDefaultTaxType(tax.taxType);

	return {
		includeRateInName: isVatDefault,
		showDescription: !isVatDefault,
		sortByName: false,
	};
}

function getPartyTaxDefaultFormatting(
	tax: TaxOptionFormattingSource,
	classification: TaxDefaultClassification,
): TaxDefaultOptionFormatting {
	const isVatDefault = isVatDefaultTaxType(tax.taxType);

	return {
		includeRateInName:
			isVatDefault || shouldUseTitleOnlyTaxDefault(classification.key),
		nameFormat: isVatDefault ? undefined : "codeRate",
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
	tax: TaxOptionFormattingSource,
	displayName: string,
	codeRateName: string,
	rate: string,
	formatting: TaxDefaultOptionFormatting,
) {
	if (formatting.nameFormat === "codeRate") {
		return codeRateName;
	}

	if ((formatting.includeRateInName ?? false) && !tax.taxExempt) {
		return `${displayName} (${rate})`;
	}

	return displayName;
}

function formatTaxDefaultCodeRateName(
	displayCode: string,
	rate: string,
) {
	return [displayCode, rate ? `(${rate})` : ""].filter(Boolean).join(" ");
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
	tax: TaxOptionDisplaySource,
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
