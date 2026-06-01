"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import toast from "react-hot-toast";
import {
	CheckCircle2,
	CircleDollarSign,
	Plus,
	RefreshCcw,
	Settings,
} from "lucide-react";
import {
	MultiCurrencySetupStatusOptions,
} from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";
import {
	DefaultWantedCurrencyCode,
	MockMultiCurrencyAuditLogs,
	MockMultiCurrencyRateHistory,
	MockMultiCurrencyRoundingRules,
	MultiCurrencyCatalog,
	MultiCurrencySourceSummary,
	findCurrencyByCode,
	findFetchedRate,
	formatExchangeRate,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import {
	type MultiCurrencySetupPendingDelete,
	type UseMultiCurrencySetupListPage,
	useMultiCurrencySetupListPage,
} from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetupListPage";
import type {
	MultiCurrencyRateUpdateMode,
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
	ModuleTableResetButton,
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
	const [updateMode, setUpdateMode] =
		useState<MultiCurrencyRateUpdateMode>("unmodified");
	const selectedApiRate = findFetchedRate(
		page.fetchedRates,
		drawerValues.targetCurrencyCode,
	);
	const selectedApiRateDisplay = selectedApiRate
		? formatExchangeRate(selectedApiRate.exchangeRate)
		: "0.000000";
	const selectedInverseRateDisplay = selectedApiRate
		? formatExchangeRate(selectedApiRate.inverseExchangeRate)
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
			MultiCurrencyCatalog.find((currency) => currency.code !== value)?.code ??
			DefaultWantedCurrencyCode;

		page.setWantedCurrencyCode(nextWantedCode);
	}

	function handleDrawerChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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
							? formatExchangeRate(nextApiRate.exchangeRate)
							: current.configuredExchangeRate,
				};
			}

			if (name === "source" && value === "API" && selectedApiRate) {
				return {
					...current,
					source: "API",
					configuredExchangeRate: formatExchangeRate(
						selectedApiRate.exchangeRate,
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
			id:
				drawerState?.record?.id ??
				`mcs_${Date.now().toString(36)}`,
			notes: drawerValues.notes.trim() || undefined,
			originalExchangeRate: Number(drawerValues.configuredExchangeRate),
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
				description="Manage currencies, API exchange rates, and manual configured rates from one screen."
				eyebrow={
					<>
						<Settings className="h-3.5 w-3.5" aria-hidden="true" />
						Administrative settings
					</>
				}
				actions={<HeaderActions onAddCurrency={openAddDrawer} />}
			/>

			<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
				<div className="grid gap-5">
					<MultiCurrencySetupTable
						isLoading={page.isLoading}
						records={page.filteredRecords}
						toolbar={
							<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,2fr)_minmax(12rem,1fr)_minmax(10rem,0.8fr)]">
								<ModuleTableSearch
									label="Search currencies"
									value={page.query}
									onChange={page.setQuery}
									placeholder="Search by currency, rate, status, or notes"
								/>
								<ModuleTableFilterSelect
									label="Status"
									value={page.statusFilter}
									options={[
										{ label: "All", value: "All" },
										...MultiCurrencySetupStatusOptions.map((status) => ({
											label: status,
											value: status,
										})),
									]}
									onChange={page.setStatusFilter}
								/>
								<ModuleTableResetButton onClick={page.resetFilters}>
									Reset
								</ModuleTableResetButton>
							</ModuleTableToolbar>
						}
						onConfigureRecord={openEditDrawer}
						onDeleteRecord={setPendingDelete}
						onUpdateRecordRate={page.updateCurrencyFromApi}
					/>
				</div>

				<aside className="grid content-start gap-5">
					<BaseCurrencyCard
						baseCurrencyCode={page.preferredBaseCurrencyCode}
						onBaseCurrencyChange={handleBaseCurrencyChange}
					/>
					<UpdateRatesCard
						isMutating={page.isMutating}
						updateMode={updateMode}
						onUpdateModeChange={setUpdateMode}
						onUpdateRates={() => page.updateRates(updateMode)}
					/>
					<SummaryCard page={page} />
					<SummarizedSettingsCard />
				</aside>
			</div>

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

function BaseCurrencyCard({
	baseCurrencyCode,
	onBaseCurrencyChange,
}: {
	baseCurrencyCode: string;
	onBaseCurrencyChange: (value: string) => void;
}) {
	const baseCurrency = findCurrencyByCode(baseCurrencyCode);

	return (
		<SectionCard>
			<PanelHeader
				title="Base Currency"
				description="Rates below refresh from this currency."
			/>
			<div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
						<CircleDollarSign className="h-5 w-5" aria-hidden="true" />
					</div>
					<div>
						<p className="font-semibold text-darknavy">
							{baseCurrency?.code ?? baseCurrencyCode}
						</p>
						<p className="text-sm text-darknavy/60">
							{baseCurrency?.name ?? "Base currency"}
						</p>
					</div>
				</div>
			</div>
			<label className="mt-4 block">
				<span className="mb-2 block text-sm font-semibold text-darknavy">
					Change Base Currency
				</span>
				<select
					value={baseCurrencyCode}
					onChange={(event) => onBaseCurrencyChange(event.target.value)}
					className={fieldClassName}
				>
					{MultiCurrencyCatalog.map((currency) => (
						<option key={currency.code} value={currency.code}>
							{currency.code} - {currency.name}
						</option>
					))}
				</select>
			</label>
		</SectionCard>
	);
}

function UpdateRatesCard({
	isMutating,
	onUpdateModeChange,
	onUpdateRates,
	updateMode,
}: {
	isMutating: boolean;
	onUpdateModeChange: (mode: MultiCurrencyRateUpdateMode) => void;
	onUpdateRates: () => void;
	updateMode: MultiCurrencyRateUpdateMode;
}) {
	return (
		<SectionCard>
			<PanelHeader
				title="Update Rates"
				description={`Last updated ${MultiCurrencySourceSummary.lastUpdated}.`}
			/>
			<label className="mt-4 block">
				<span className="mb-2 block text-sm font-semibold text-darknavy">
					Apply Update To
				</span>
				<select
					value={updateMode}
					onChange={(event) =>
						onUpdateModeChange(event.target.value as MultiCurrencyRateUpdateMode)
					}
					className={fieldClassName}
				>
					<option value="unmodified">Only unmodified rates</option>
					<option value="overwrite">Overwrite existing rates</option>
				</select>
			</label>
			<button
				type="button"
				disabled={isMutating}
				onClick={onUpdateRates}
				className={moduleHeaderActionClassNames.secondary + " mt-4 w-full"}
			>
				<RefreshCcw className="h-4 w-4" aria-hidden="true" />
				{isMutating ? "Updating..." : "Update Rates"}
			</button>
		</SectionCard>
	);
}

function SummaryCard({ page }: { page: UseMultiCurrencySetupListPage }) {
	return (
		<SectionCard>
			<PanelHeader title="Summary" />
			<div className="mt-4 grid gap-3">
				<SummaryLine label="Base Currency" value={page.preferredBaseCurrencyCode} />
				<SummaryLine label="Configured Currencies" value={String(page.baseRecords.length)} />
				<SummaryLine label="API Rates" value={String(page.fetchedRates.length)} />
				<SummaryLine label="Manual Overrides" value={String(page.manualRateCount)} />
				<SummaryLine label="Rate Source" value={MultiCurrencySourceSummary.primarySource} />
			</div>
		</SectionCard>
	);
}

function SummarizedSettingsCard() {
	return (
		<SectionCard>
			<PanelHeader title="Other Settings" description="Summarized for now." />
			<div className="mt-4 grid gap-3 text-sm text-darknavy/70">
				<CheckLine>
					Preferences: daily rate, transaction date, 2 decimal places
				</CheckLine>
				<CheckLine>
					Rounding rules: {MockMultiCurrencyRoundingRules.length} configured
				</CheckLine>
				<CheckLine>
					Rate history: {MockMultiCurrencyRateHistory.length} recent entries
				</CheckLine>
				<CheckLine>
					Audit logs: {MockMultiCurrencyAuditLogs.length} recent changes
				</CheckLine>
			</div>
		</SectionCard>
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
			description="Review the API rate and set the configured rate used by transactions."
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
							label="API Exchange Rate"
							value={apiRateDisplay}
							helper={`1 ${values.baseCurrencyCode} to ${values.targetCurrencyCode}`}
						/>
						<ReadonlyRate
							label="Inverse Rate"
							value={inverseRateDisplay}
							helper={`1 ${values.targetCurrencyCode} to ${values.baseCurrencyCode}`}
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
							className={fieldClassName}
						>
							{MultiCurrencyCatalog.filter(
								(currency) => currency.code !== values.baseCurrencyCode,
							).map((currency) => (
								<option key={currency.code} value={currency.code}>
									{currency.code} - {currency.name}
								</option>
							))}
						</select>
					</DrawerField>

					<DrawerField
						error={drawerErrors.configuredExchangeRate}
						label="Configured Exchange Rate"
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
						<DrawerField error={drawerErrors.source} label="Source" required>
							<select
								name="source"
								value={values.source}
								onChange={onChange}
								className={fieldClassName}
							>
								<option value="API">API</option>
								<option value="Manual">Manual</option>
							</select>
						</DrawerField>
						<DrawerField error={drawerErrors.status} label="Status" required>
							<select
								name="status"
								value={values.status}
								onChange={onChange}
								className={fieldClassName}
							>
								<option value="Active">Active</option>
								<option value="Inactive">Inactive</option>
							</select>
						</DrawerField>
					</div>

					<DrawerField error={drawerErrors.rateDate} label="Rate Date" required>
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
			? formatExchangeRate(fetchedRate.exchangeRate)
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
		configuredExchangeRate: formatExchangeRate(record.originalExchangeRate),
		notes: record.notes ?? "",
		rateDate: record.rateDate,
		source: record.source ?? "API",
		status: record.status,
		targetCurrencyCode: record.targetCurrencyCode,
	};
}

function SectionCard({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 ${className ?? ""}`}
		>
			{children}
		</div>
	);
}

function PanelHeader({
	description,
	title,
}: {
	description?: ReactNode;
	title: ReactNode;
}) {
	return (
		<div>
			<h2 className="text-base font-semibold text-darknavy">{title}</h2>
			{description ? (
				<p className="mt-1 text-sm leading-6 text-darknavy/60">
					{description}
				</p>
			) : null}
		</div>
	);
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
			<p className="mt-2 truncate font-mono text-base font-semibold text-darknavy">
				{value}
			</p>
			<p className="mt-1 truncate text-xs text-darknavy/55">{helper}</p>
		</div>
	);
}

function SummaryLine({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-start justify-between gap-3 text-sm">
			<span className="text-darknavy/60">{label}</span>
			<span className="max-w-[11rem] text-right font-semibold text-darknavy">
				{value}
			</span>
		</div>
	);
}

function CheckLine({ children }: { children: ReactNode }) {
	return (
		<div className="flex gap-2">
			<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
			<span>{children}</span>
		</div>
	);
}

const fieldClassName =
	"min-h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5";
