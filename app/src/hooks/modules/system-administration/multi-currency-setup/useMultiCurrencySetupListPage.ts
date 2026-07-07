"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
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
import type {
	MultiCurrencySetupRecord,
	MultiCurrencySetupTableRecord,
	MultiCurrencyRateUpdateMode,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

export function useMultiCurrencySetupListPage() {
	const records = useMultiCurrencySetupStore((state) => state.records);
	const deleteRecord = useMultiCurrencySetupStore(
		(state) => state.deleteRecord,
	);
	const addRecord = useMultiCurrencySetupStore((state) => state.addRecord);
	const updateRecord = useMultiCurrencySetupStore(
		(state) => state.updateRecord,
	);
	const replaceRecords = useMultiCurrencySetupStore(
		(state) => state.replaceRecords,
	);
	const isLoading = useMultiCurrencySetupStore((state) => state.isLoading);
	const lastSyncedAt = useMultiCurrencySetupStore(
		(state) => state.lastSyncedAt,
	);
	const isMutating = useMultiCurrencySetupStore((state) => state.isMutating);
	const [preferredBaseCurrencyCode, setPreferredBaseCurrencyCode] = useState(
		DefaultPreferredBaseCurrencyCode,
	);
	const [wantedCurrencyCode, setWantedCurrencyCode] = useState(
		DefaultWantedCurrencyCode,
	);
	const [statusFilter, setStatusFilter] = useState("All");
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
		() =>
			createMultiCurrencySetupTableRecords(
				baseRecords,
				fetchedRates,
				preferredBaseCurrencyCode,
			),
		[baseRecords, fetchedRates, preferredBaseCurrencyCode],
	);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return tableRecords.filter((record) => {
			if (statusFilter !== "All" && record.status !== statusFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				record.currencyCode,
				record.currencyDescription,
				record.currencySymbol,
				record.dailyExchangeRateDisplay,
				record.status,
				record.notes,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [query, statusFilter, tableRecords]);
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
	const manualRateCount = tableRecords.filter(
		(record) => record.source === "Manual",
	).length;

	function resetFilters() {
		setPreferredBaseCurrencyCode(DefaultPreferredBaseCurrencyCode);
		setWantedCurrencyCode(DefaultWantedCurrencyCode);
		setStatusFilter("All");
		setQuery("");
	}

	function deleteCurrencySetup(record: MultiCurrencySetupRecord) {
		deleteRecord(record.id);
	}

	function addCurrencySetup(record: MultiCurrencySetupRecord) {
		addRecord(record);
	}

	function updateCurrencySetup(record: MultiCurrencySetupRecord) {
		updateRecord(record);
	}

	async function updateCurrencyFromApi(record: MultiCurrencySetupTableRecord) {
		const result = await ratesQuery.refetch();
		const latestRates = result.data ?? fetchedRates;
		const fetchedRate = findFetchedRate(
			latestRates,
			record.targetCurrencyCode,
		);

		if (!fetchedRate) {
			toast.error("Could not fetch the latest Frankfurter rate.");
			return;
		}

		updateRecord({
			...record,
			originalExchangeRate: fetchedRate.exchangeRate,
			rateDate: fetchedRate.rateAsOf,
			source: "API",
		});
	}

	async function updateRates(mode: MultiCurrencyRateUpdateMode) {
		const result = await ratesQuery.refetch();
		const latestRates = result.data ?? fetchedRates;

		if (result.isError && latestRates.length === 0) {
			toast.error("Could not fetch the latest Frankfurter rates.");
			return;
		}

		const nextRecords = records.map((record) => {
			if (record.baseCurrencyCode !== preferredBaseCurrencyCode) {
				return record;
			}

			if (mode === "unmodified" && record.source === "Manual") {
				return record;
			}

			const fetchedRate = findFetchedRate(
				latestRates,
				record.targetCurrencyCode,
			);

			if (!fetchedRate) {
				return record;
			}

			return {
				...record,
				originalExchangeRate: fetchedRate.exchangeRate,
				rateDate: fetchedRate.rateAsOf,
				source: "API" as const,
			};
		});

		replaceRecords(nextRecords);
	}

	return {
		addCurrencySetup,
		baseRecords,
		deleteCurrencySetup,
		defaultCurrency,
		enabledCurrencies,
		fetchedRates,
		filteredRecords,
		isLoading: isLoading || ratesQuery.isLoading,
		lastSyncedAt: Math.max(lastSyncedAt, ratesQuery.dataUpdatedAt),
		isMutating,
		manualRateCount,
		preferredBaseCurrencyCode,
		query,
		resetFilters,
		setPreferredBaseCurrencyCode,
		setQuery,
		setStatusFilter,
		setWantedCurrencyCode,
		statusFilter,
		tableRecords,
		updateCurrencyFromApi,
		updateCurrencySetup,
		updateRates,
		wantedCurrencyCode,
		wantedInverseDisplay,
		wantedRate,
		wantedRateDisplay,
	};
}

export type UseMultiCurrencySetupListPage = ReturnType<
	typeof useMultiCurrencySetupListPage
>;

export type MultiCurrencySetupPendingDelete =
	MultiCurrencySetupTableRecord | null;
