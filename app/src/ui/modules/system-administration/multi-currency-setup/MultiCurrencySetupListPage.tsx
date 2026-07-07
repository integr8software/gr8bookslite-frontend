"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Plus, RefreshCcw, Settings } from "lucide-react";
import { MultiCurrencySetupStatusOptions } from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";
import {
	DefaultWantedCurrencyCode,
	MultiCurrencyCatalog,
	findFetchedRate,
	formatExchangeRate,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import {
	type MultiCurrencySetupPendingDelete,
	type UseMultiCurrencySetupListPage,
	useMultiCurrencySetupListPage,
} from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetupListPage";
import type {
	MultiCurrencySetupDrawerMode,
	MultiCurrencySetupDrawerValues,
	MultiCurrencySetupTableRecord,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";
import { validateMultiCurrencySetupDrawer } from "@/app/src/validations/modules/system-administration/multi-currency-setup/MultiCurrencySetupValidation";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { MultiCurrencySetupTable } from "@/app/src/ui/modules/system-administration/multi-currency-setup/MultiCurrencySetupTable";

type DrawerState = {
	mode: MultiCurrencySetupDrawerMode;
	record: MultiCurrencySetupTableRecord | null;
};

export function MultiCurrencySetupListPage() {
	const page = useMultiCurrencySetupListPage();
	const [pendingDelete, setPendingDelete] =
		useState<MultiCurrencySetupPendingDelete>(null);
	const [drawerState, setDrawerState] = useState<DrawerState | null>(null);
	const [drawerValues, setDrawerValues] =
		useState<MultiCurrencySetupDrawerValues>(() =>
			createEmptyDrawerValues(page),
		);
	const [drawerErrors, setDrawerErrors] = useState<
		Partial<Record<keyof MultiCurrencySetupDrawerValues, string>>
	>({});
	const selectedApiRate = findFetchedRate(
		page.fetchedRates,
		drawerValues.targetCurrencyCode,
	);
	const selectedApiRateDisplay = selectedApiRate
		? formatExchangeRate(selectedApiRate.inverseExchangeRate)
		: "0.000000";
	const selectedInverseRateDisplay = selectedApiRate
		? formatExchangeRate(selectedApiRate.exchangeRate)
		: "0.000000";
	const drawerTitle =
		drawerState?.mode === "edit" ? "Configure Currency" : "Add Currency";

	function openAddDrawer() {
		setDrawerValues(createEmptyDrawerValues(page));
		setDrawerErrors({});
		setDrawerState({ mode: "add", record: null });
	}

	function openEditDrawer(record: MultiCurrencySetupTableRecord) {
		setDrawerValues(createRecordDrawerValues(record));
		setDrawerErrors({});
		setDrawerState({ mode: "edit", record });
	}

	function closeDrawer() {
		setDrawerState(null);
		setDrawerErrors({});
	}

	function handleConfirmDelete() {
		if (!pendingDelete) {
			return;
		}

		page.deleteCurrencySetup(pendingDelete);
		setPendingDelete(null);
	}

	function handleBaseCurrencyChange(value: string) {
		page.setPreferredBaseCurrencyCode(value);

		const nextWantedCode =
			MultiCurrencyCatalog.find((currency) => currency.code !== value)
				?.code ?? DefaultWantedCurrencyCode;

		page.setWantedCurrencyCode(nextWantedCode);
	}

	function handleDrawerChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) {
		const { name, value } = event.target;

		setDrawerValues((current) => {
			if (name === "targetCurrencyCode") {
				const nextApiRate = findFetchedRate(page.fetchedRates, value);

				return {
					...current,
					targetCurrencyCode: value,
					configuredExchangeRate:
						current.source === "API" && nextApiRate
							? formatExchangeRate(nextApiRate.inverseExchangeRate)
							: current.configuredExchangeRate,
				};
			}

			if (name === "source" && value === "API" && selectedApiRate) {
				return {
					...current,
					source: "API",
					configuredExchangeRate: formatExchangeRate(
						selectedApiRate.inverseExchangeRate,
					),
				};
			}

			if (name === "configuredExchangeRate") {
				return {
					...current,
					configuredExchangeRate: value,
					source: "Manual",
				};
			}

			return {
				...current,
				[name]: value,
			};
		});
		setDrawerErrors((current) => ({
			...current,
			[name as keyof MultiCurrencySetupDrawerValues]: undefined,
		}));
	}

	function handleSaveDrawer() {
		const nextErrors = validateMultiCurrencySetupDrawer(drawerValues);

		if (Object.keys(nextErrors).length > 0) {
			setDrawerErrors(nextErrors);
			toast.error("Please fix the highlighted currency fields.");
			return;
		}

		const nextRecord = {
			baseCurrencyCode: drawerValues.baseCurrencyCode,
			id: drawerState?.record?.id ?? `mcs_${Date.now().toString(36)}`,
			notes: drawerValues.notes.trim() || undefined,
			originalExchangeRate:
				1 / Number(drawerValues.configuredExchangeRate),
			rateDate: drawerValues.rateDate,
			source: drawerValues.source,
			status: drawerValues.status,
			targetCurrencyCode: drawerValues.targetCurrencyCode,
		};

		if (drawerState?.mode === "edit") {
			page.updateCurrencySetup(nextRecord);
		} else {
			page.addCurrencySetup(nextRecord);
		}

		closeDrawer();
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Multi-Currency Setup"
				description="Manage currencies and daily Frankfurter exchange rates from one screen."
				eyebrow={
					<>
						<Settings className="h-3.5 w-3.5" aria-hidden="true" />
						Administrative settings
					</>
				}
				actions={<HeaderActions onAddCurrency={openAddDrawer} />}
			/>

			<MultiCurrencySetupTable
				isLoading={page.isLoading}
				lastSyncedAt={page.lastSyncedAt}
				records={page.filteredRecords}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,2fr)_minmax(11rem,0.8fr)_minmax(13rem,1fr)_minmax(10rem,0.8fr)]">
						<ModuleTableSearch
							label="Search currencies"
							value={page.query}
							onChange={page.setQuery}
							placeholder="Search by currency, rate, availability, or notes"
						/>
						<ModuleTableFilterSelect
							label="Availability"
							value={page.statusFilter}
							options={[
								{ label: "All", value: "All" },
								...MultiCurrencySetupStatusOptions.map((status) => ({
									label:
										status === "Active"
											? "Enabled"
											: "Disabled",
									value: status,
								})),
							]}
							onChange={page.setStatusFilter}
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
						<button
							type="button"
							disabled={page.isMutating}
							onClick={() => page.updateRates("unmodified")}
							className={`${moduleHeaderActionClassNames.secondary} h-12 w-full rounded-lg`}
						>
							<RefreshCcw
								className={`h-4 w-4 ${page.isMutating ? "animate-spin" : ""}`}
								aria-hidden="true"
							/>
							{page.isMutating ? "Updating..." : "Update Rates"}
						</button>
					</ModuleTableToolbar>
				}
				onConfigureRecord={openEditDrawer}
				onDeleteRecord={setPendingDelete}
				onUpdateRecordRate={page.updateCurrencyFromApi}
			/>

			<CurrencySetupDrawer
				apiRateDisplay={selectedApiRateDisplay}
				drawerErrors={drawerErrors}
				inverseRateDisplay={selectedInverseRateDisplay}
				isOpen={Boolean(drawerState)}
				title={drawerTitle}
				values={drawerValues}
				onChange={handleDrawerChange}
				onClose={closeDrawer}
				onSave={handleSaveDrawer}
			/>

			<AppDialog
				isOpen={Boolean(pendingDelete)}
				isPending={page.isMutating}
				title="Delete currency setup?"
				description={`This will remove ${pendingDelete?.baseCurrencyCode ?? "the selected base"} to ${pendingDelete?.targetCurrencyCode ?? "configured currency"}.`}
				confirmLabel="Delete Setup"
				tone="danger"
				onCancel={() => setPendingDelete(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}

function HeaderActions({ onAddCurrency }: { onAddCurrency: () => void }) {
	return (
		<button
			type="button"
			className={moduleHeaderActionClassNames.primary}
			onClick={onAddCurrency}
		>
			<Plus className="h-4 w-4" aria-hidden="true" />
			Add Currency
		</button>
	);
}

function CurrencySetupDrawer({
	apiRateDisplay,
	drawerErrors,
	inverseRateDisplay,
	isOpen,
	onChange,
	onClose,
	onSave,
	title,
	values,
}: {
	apiRateDisplay: string;
	drawerErrors: Partial<Record<keyof MultiCurrencySetupDrawerValues, string>>;
	inverseRateDisplay: string;
	isOpen: boolean;
	onChange: (
		event: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => void;
	onClose: () => void;
	onSave: () => void;
	title: string;
	values: MultiCurrencySetupDrawerValues;
}) {
	return (
		<ModuleDrawer
			isOpen={isOpen}
			title={title}
			description="Review the automatic rate and set the daily rate used by transactions."
			eyebrow="Multi-currency"
			onClose={onClose}
			maxWidthClassName="max-w-xl"
			footer={
				<div className="flex justify-end gap-2">
					<button
						type="button"
						className={moduleHeaderActionClassNames.secondary}
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						type="button"
						className={moduleHeaderActionClassNames.primary}
						onClick={onSave}
					>
						Save
					</button>
				</div>
			}
		>
			<div className="grid gap-5 p-6">
				<div className="grid gap-3 rounded-lg border border-darknavy/10 bg-offwhite/65 p-4">
					<div className="grid gap-3 sm:grid-cols-2">
						<ReadonlyRate
							label="Frankfurter Rate"
							value={apiRateDisplay}
							helper={`1 ${values.targetCurrencyCode} = ${apiRateDisplay} ${values.baseCurrencyCode}`}
						/>
						<ReadonlyRate
							label="Inverse Rate"
							value={inverseRateDisplay}
							helper={`1 ${values.baseCurrencyCode} = ${inverseRateDisplay} ${values.targetCurrencyCode}`}
						/>
					</div>
				</div>

				<div className="grid gap-4">
					<DrawerField
						error={drawerErrors.targetCurrencyCode}
						label="Currency"
						required
					>
						<select
							name="targetCurrencyCode"
							value={values.targetCurrencyCode}
							onChange={onChange}
							className={selectFieldClassName}
						>
							{MultiCurrencyCatalog.filter(
								(currency) =>
									currency.code !== values.baseCurrencyCode,
							).map((currency) => (
								<option
									key={currency.code}
									value={currency.code}
								>
									{currency.code} - {currency.name}
								</option>
							))}
						</select>
					</DrawerField>

					<DrawerField
						error={drawerErrors.configuredExchangeRate}
						label={`Daily Exchange Rate (${values.baseCurrencyCode})`}
						required
					>
						<input
							name="configuredExchangeRate"
							type="number"
							step="0.000001"
							value={values.configuredExchangeRate}
							onChange={onChange}
							className={fieldClassName}
						/>
					</DrawerField>

					<div className="grid gap-4 sm:grid-cols-2">
						<DrawerField
							error={drawerErrors.source}
							label="Rate Type"
							required
						>
							<select
								name="source"
								value={values.source}
								onChange={onChange}
								className={selectFieldClassName}
							>
								<option value="API">Automatic</option>
								<option value="Manual">Manual</option>
							</select>
							<p className="mt-1.5 text-xs leading-5 text-darknavy/50">
								{values.source === "API"
									? "Automatic rates refresh from Frankfurter."
									: "Manual rates stay unchanged when “Keep manual rates” is selected during an update."}
							</p>
						</DrawerField>
						<DrawerField
							error={drawerErrors.status}
							label="Availability"
							required
						>
							<select
								name="status"
								value={values.status}
								onChange={onChange}
								className={selectFieldClassName}
							>
								<option value="Active">Enabled</option>
								<option value="Inactive">Disabled</option>
							</select>
						</DrawerField>
					</div>

					<DrawerField
						error={drawerErrors.rateDate}
						label="Rate Date"
						required
					>
						<input
							name="rateDate"
							type="date"
							value={values.rateDate}
							onChange={onChange}
							className={fieldClassName}
						/>
					</DrawerField>

					<DrawerField error={drawerErrors.notes} label="Notes">
						<textarea
							name="notes"
							value={values.notes}
							onChange={onChange}
							rows={4}
							className={`${fieldClassName} min-h-28 resize-y py-3`}
							placeholder="Rate source, bank reference, or reason"
						/>
					</DrawerField>
				</div>
			</div>
		</ModuleDrawer>
	);
}

function createEmptyDrawerValues(
	page: UseMultiCurrencySetupListPage,
): MultiCurrencySetupDrawerValues {
	const targetCurrencyCode =
		MultiCurrencyCatalog.find(
			(currency) => currency.code !== page.preferredBaseCurrencyCode,
		)?.code ?? DefaultWantedCurrencyCode;
	const fetchedRate = findFetchedRate(page.fetchedRates, targetCurrencyCode);

	return {
		baseCurrencyCode: page.preferredBaseCurrencyCode,
		configuredExchangeRate: fetchedRate
			? formatExchangeRate(fetchedRate.inverseExchangeRate)
			: "1.000000",
		notes: "",
		rateDate: fetchedRate?.rateAsOf ?? "2026-06-01",
		source: "API",
		status: "Active",
		targetCurrencyCode,
	};
}

function createRecordDrawerValues(
	record: MultiCurrencySetupTableRecord,
): MultiCurrencySetupDrawerValues {
	return {
		baseCurrencyCode: record.baseCurrencyCode,
		configuredExchangeRate: formatExchangeRate(
			record.originalExchangeRate === 0
				? 0
				: 1 / record.originalExchangeRate,
		),
		notes: record.notes ?? "",
		rateDate: record.rateDate,
		source: record.source ?? "API",
		status: record.status,
		targetCurrencyCode: record.targetCurrencyCode,
	};
}

function DrawerField({
	children,
	error,
	label,
	required,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

function ReadonlyRate({
	helper,
	label,
	value,
}: {
	helper: string;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-md border border-darknavy/10 bg-white p-3">
			<p className="text-xs font-semibold uppercase text-darknavy/50">
				{label}
			</p>
			<p className="mt-2 truncate text-base font-semibold text-darknavy">
				{value}
			</p>
			<p className="mt-1 truncate text-xs text-darknavy/55">{helper}</p>
		</div>
	);
}

const fieldClassName =
	"app-theme-field min-h-10 w-full rounded-md border px-3 text-sm font-medium outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-60";

const selectFieldClassName = `app-select-control ${fieldClassName}`;
