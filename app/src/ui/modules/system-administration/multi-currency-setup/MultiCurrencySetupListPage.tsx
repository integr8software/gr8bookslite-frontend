"use client";

import { Settings } from "lucide-react";
import {
	DefaultWantedCurrencyCode,
	MultiCurrencyCatalog,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import { useMultiCurrencySetupListPage } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetupListPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { MultiCurrencySetupTable } from "@/app/src/ui/modules/system-administration/multi-currency-setup/MultiCurrencySetupTable";

export function MultiCurrencySetupListPage() {
	const page = useMultiCurrencySetupListPage();

	function handleBaseCurrencyChange(value: string) {
		page.setPreferredBaseCurrencyCode(value);

		const nextWantedCode =
			MultiCurrencyCatalog.find((currency) => currency.code !== value)
				?.code ?? DefaultWantedCurrencyCode;

		page.setWantedCurrencyCode(nextWantedCode);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Multi-Currency Setup"
				description="Manage currencies and daily BSP reference exchange rates from one screen."
				eyebrow={
					<>
						<Settings className="h-3.5 w-3.5" aria-hidden="true" />
						Administrative settings
					</>
				}
			/>

			<MultiCurrencySetupTable
				isLoading={page.isLoading}
				lastSyncedAt={page.lastSyncedAt}
				records={page.filteredRecords}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,2fr)_minmax(13rem,1fr)]">
						<ModuleTableSearch
							label="Search currencies"
							value={page.query}
							onChange={page.setQuery}
							placeholder="Search by currency, rate, or symbol"
						/>
						<ModuleTableFilterSelect
							label="Base Currency"
							value={page.preferredBaseCurrencyCode}
							options={MultiCurrencyCatalog.map((currency) => ({
								label: `${currency.code} - ${currency.name}`,
								value: currency.code,
							}))}
							onChange={handleBaseCurrencyChange}
						/>
					</ModuleTableToolbar>
				}
			/>
		</section>
	);
}
