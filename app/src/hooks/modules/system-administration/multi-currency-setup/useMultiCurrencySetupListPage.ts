"use client";

import { useMemo, useState } from "react";
import {
	DefaultPreferredBaseCurrencyCode,
	DefaultWantedCurrencyCode,
	createMultiCurrencyCatalogFromFetchedRates,
	createMultiCurrencySetupRecordsFromFetchedRates,
	createMultiCurrencySetupTableRecords,
	findFetchedRate,
	formatExchangeRate,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import { useMultiCurrencySetupRates } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetupRates";

export function useMultiCurrencySetupListPage() {
	const [preferredBaseCurrencyCode, setPreferredBaseCurrencyCode] = useState(
		DefaultPreferredBaseCurrencyCode,
	);
	const [wantedCurrencyCode, setWantedCurrencyCode] = useState(
		DefaultWantedCurrencyCode,
	);
	const [query, setQuery] = useState("");
	const ratesQuery = useMultiCurrencySetupRates(preferredBaseCurrencyCode);
	const fetchedRates = useMemo(
		() => ratesQuery.data ?? [],
		[ratesQuery.data],
	);
	const wantedRate = findFetchedRate(fetchedRates, wantedCurrencyCode);
	const baseRecords = useMemo(
		() => createMultiCurrencySetupRecordsFromFetchedRates(fetchedRates),
		[fetchedRates],
	);
	const tableRecords = useMemo(
		() => createMultiCurrencySetupTableRecords(baseRecords, fetchedRates),
		[baseRecords, fetchedRates],
	);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return tableRecords;
		}

		return tableRecords.filter((record) =>
			[
				record.currencyCode,
				record.currencyDescription,
				record.currencySymbol,
				record.dailyExchangeRateDisplay,
				record.notes,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [query, tableRecords]);
	const wantedRateDisplay = wantedRate
		? formatExchangeRate(wantedRate.exchangeRate)
		: "0.000000";
	const wantedInverseDisplay = wantedRate
		? formatExchangeRate(wantedRate.inverseExchangeRate)
		: "0.000000";
	const enabledCurrencies = useMemo(
		() => createMultiCurrencyCatalogFromFetchedRates(fetchedRates),
		[fetchedRates],
	);
	const defaultCurrency = enabledCurrencies.find(
		(currency) => currency.code === preferredBaseCurrencyCode,
	);

	function resetFilters() {
		setPreferredBaseCurrencyCode(DefaultPreferredBaseCurrencyCode);
		setWantedCurrencyCode(DefaultWantedCurrencyCode);
		setQuery("");
	}

	return {
		baseRecords,
		defaultCurrency,
		enabledCurrencies,
		fetchedRates,
		filteredRecords,
		isLoading: ratesQuery.isLoading,
		lastSyncedAt: ratesQuery.dataUpdatedAt,
		preferredBaseCurrencyCode,
		query,
		resetFilters,
		setPreferredBaseCurrencyCode,
		setQuery,
		setWantedCurrencyCode,
		tableRecords,
		wantedCurrencyCode,
		wantedInverseDisplay,
		wantedRate,
		wantedRateDisplay,
	};
}

export type UseMultiCurrencySetupListPage = ReturnType<
	typeof useMultiCurrencySetupListPage
>;
