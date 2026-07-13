"use client";

import { useMemo, useState } from "react";
import {
	DefaultPreferredBaseCurrencyCode,
	DefaultWantedCurrencyCode,
	MultiCurrencyCatalog,
	createMultiCurrencySetupTableRecords,
	findCurrencyByCode,
	findFetchedRate,
	formatExchangeRate,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import { useMultiCurrencySetupRates } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetupRates";
import { useMultiCurrencySetupStore } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetup";

export function useMultiCurrencySetupListPage() {
	const records = useMultiCurrencySetupStore((state) => state.records);
	const isLoading = useMultiCurrencySetupStore((state) => state.isLoading);
	const lastSyncedAt = useMultiCurrencySetupStore(
		(state) => state.lastSyncedAt,
	);
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
		() =>
			records.filter(
				(record) => record.baseCurrencyCode === preferredBaseCurrencyCode,
			),
		[preferredBaseCurrencyCode, records],
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
	const enabledCurrencies = MultiCurrencyCatalog.filter(
		(currency) => currency.isEnabled,
	);
	const defaultCurrency =
		findCurrencyByCode(preferredBaseCurrencyCode) ?? MultiCurrencyCatalog[0];

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
		isLoading: isLoading || ratesQuery.isLoading,
		lastSyncedAt: Math.max(lastSyncedAt, ratesQuery.dataUpdatedAt),
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
