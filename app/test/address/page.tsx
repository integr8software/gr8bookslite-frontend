"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	LocateFixed,
	MapPin,
	RefreshCcw,
	Search,
	Signpost,
} from "lucide-react";
import {
	GetAddressAutocomplete,
	GetAddressBarangays,
	GetAddressCitiesMunicipalities,
	GetAddressProvinces,
	GetAddressRegions,
	type AddressAutocompleteItem,
	type AddressBarangay,
	type AddressCityMunicipality,
	type AddressProvince,
	type AddressRegion,
} from "@/app/src/services/shared/address/AddressReferenceApi";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type FlowState = {
	barangayCode: string;
	cityMunicipalityCode: string;
	provinceCode: string;
	regionCode: string;
	street: string;
};

const EmptyFlowState: FlowState = {
	barangayCode: "",
	cityMunicipalityCode: "",
	provinceCode: "",
	regionCode: "",
	street: "",
};

const FieldClassName =
	"h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export default function AddressTestPage() {
	const [regions, setRegions] = useState<AddressRegion[]>([]);
	const [isLoadingRegions, setIsLoadingRegions] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		void loadRegions();
	}, []);

	async function loadRegions() {
		setIsLoadingRegions(true);
		setError("");

		try {
			setRegions(await GetAddressRegions());
		} catch (requestError) {
			setError(getErrorMessage(requestError));
		} finally {
			setIsLoadingRegions(false);
		}
	}

	return (
		<main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
			<div className="mx-auto grid max-w-7xl gap-6">
				<header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
					<div>
						<div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-700">
							<MapPin className="h-4 w-4" aria-hidden="true" />
							Address API test
						</div>
						<h1 className="text-2xl font-bold text-slate-950">
							Address Reference Sandbox
						</h1>
						<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
							Test region, province, city/municipality, barangay, street, and
							autocomplete flows before applying the address selector to real
							pages.
						</p>
					</div>
					<button
						type="button"
						className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
						disabled={isLoadingRegions}
						onClick={loadRegions}
					>
						<RefreshCcw className="h-4 w-4" aria-hidden="true" />
						Reload
					</button>
				</header>

				{error ? (
					<div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
						{error}
					</div>
				) : null}

				<div className="grid gap-5 xl:grid-cols-2">
					<AddressHierarchyTester
						initialMode="region"
						regions={regions}
						title="From Region to Street"
					/>
					<AddressHierarchyTester
						initialMode="province"
						regions={regions}
						title="From Province to Street"
					/>
					<AddressHierarchyTester
						initialMode="municipality"
						regions={regions}
						title="From Municipality to Street"
					/>
					<AutocompleteTester regions={regions} withRegion />
					<AutocompleteTester regions={regions} />
				</div>
			</div>
		</main>
	);
}

function AddressHierarchyTester({
	initialMode,
	regions,
	title,
}: {
	initialMode: "municipality" | "province" | "region";
	regions: AddressRegion[];
	title: string;
}) {
	const [state, setState] = useState<FlowState>(EmptyFlowState);
	const [provinces, setProvinces] = useState<AddressProvince[]>([]);
	const [citiesMunicipalities, setCitiesMunicipalities] = useState<
		AddressCityMunicipality[]
	>([]);
	const [barangays, setBarangays] = useState<AddressBarangay[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const selectedRegion = regions.find(
		(region) => region.regionCode === state.regionCode,
	);
	const selectedProvince = provinces.find(
		(province) => province.provinceCode === state.provinceCode,
	);
	const selectedCityMunicipality = citiesMunicipalities.find(
		(cityMunicipality) =>
			cityMunicipality.cityMunicipalityCode === state.cityMunicipalityCode,
	);
	const selectedBarangay = barangays.find(
		(barangay) => barangay.barangayCode === state.barangayCode,
	);
	const composedAddress = composeAddress({
		barangay: selectedBarangay?.name,
		cityMunicipality: selectedCityMunicipality?.name,
		province: selectedProvince?.name,
		region: selectedRegion?.name,
		street: state.street,
	});

	const loadAllProvinces = useCallback(async () => {
		setIsLoading(true);
		setError("");

		try {
			setProvinces(await GetAddressProvinces());
		} catch (requestError) {
			setError(getErrorMessage(requestError));
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loadAllCitiesMunicipalities = useCallback(async () => {
		setIsLoading(true);
		setError("");

		try {
			setCitiesMunicipalities(await GetAddressCitiesMunicipalities({}));
		} catch (requestError) {
			setError(getErrorMessage(requestError));
		} finally {
			setIsLoading(false);
		}
	}, []);

	async function selectRegion(regionCode: string) {
		setState({
			...state,
			barangayCode: "",
			cityMunicipalityCode: "",
			provinceCode: "",
			regionCode,
		});
		setProvinces([]);
		setCitiesMunicipalities([]);
		setBarangays([]);

		if (!regionCode) {
			return;
		}

		await loadIntoState(() => GetAddressProvinces(regionCode), setProvinces);
	}

	async function selectProvince(provinceCode: string) {
		const province = provinces.find(
			(candidate) => candidate.provinceCode === provinceCode,
		);

		setState({
			...state,
			barangayCode: "",
			cityMunicipalityCode: "",
			provinceCode,
			regionCode: state.regionCode || province?.regionCode || "",
		});
		setCitiesMunicipalities([]);
		setBarangays([]);

		if (!provinceCode) {
			return;
		}

		await loadIntoState(
			() => GetAddressCitiesMunicipalities({ provinceCode }),
			setCitiesMunicipalities,
		);
	}

	async function selectCityMunicipality(cityMunicipalityCode: string) {
		const cityMunicipality = citiesMunicipalities.find(
			(candidate) =>
				candidate.cityMunicipalityCode === cityMunicipalityCode,
		);

		setState({
			...state,
			barangayCode: "",
			cityMunicipalityCode,
			provinceCode: state.provinceCode || cityMunicipality?.provinceCode || "",
			regionCode: state.regionCode || cityMunicipality?.regionCode || "",
		});
		setBarangays([]);

		if (!cityMunicipalityCode) {
			return;
		}

		await loadIntoState(
			() => GetAddressBarangays(cityMunicipalityCode),
			setBarangays,
		);
	}

	async function loadIntoState<TRecord>(
		loader: () => Promise<TRecord[]>,
		setter: (records: TRecord[]) => void,
	) {
		setIsLoading(true);
		setError("");

		try {
			setter(await loader());
		} catch (requestError) {
			setError(getErrorMessage(requestError));
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<TestPanel
			icon={<Signpost className="h-4 w-4" aria-hidden="true" />}
			title={title}
		>
			{error ? <InlineError message={error} /> : null}

			<div className="grid gap-4 md:grid-cols-2">
				{initialMode === "region" ? (
				<DropdownField
					label="Region"
					value={state.regionCode}
					options={regions.map((region) => ({
						name: region.name,
						value: region.regionCode,
					}))}
					placeholder="Select region"
					onChange={(value) => void selectRegion(value)}
					/>
				) : null}

				{initialMode !== "municipality" ? (
				<DropdownField
					disabled={initialMode === "region" && !state.regionCode}
					label="Province"
					value={state.provinceCode}
					options={provinces.map((province) => ({
						name: province.name,
						value: province.provinceCode,
					}))}
					placeholder="Select province"
						onFocus={() => {
							if (initialMode === "province" && provinces.length === 0) {
								void loadAllProvinces();
							}
						}}
						onChange={(value) => void selectProvince(value)}
					/>
				) : null}

				<DropdownField
					disabled={initialMode !== "municipality" && !state.provinceCode}
					label="City/Municipality"
					value={state.cityMunicipalityCode}
					options={citiesMunicipalities.map((cityMunicipality) => ({
						name: cityMunicipality.name,
						value: cityMunicipality.cityMunicipalityCode,
					}))}
					placeholder="Select city or municipality"
					onFocus={() => {
						if (
							initialMode === "municipality" &&
							citiesMunicipalities.length === 0
						) {
							void loadAllCitiesMunicipalities();
						}
					}}
					onChange={(value) => void selectCityMunicipality(value)}
				/>

				<DropdownField
					disabled={!state.cityMunicipalityCode}
					label="Barangay"
					value={state.barangayCode}
					options={barangays.map((barangay) => ({
						name: barangay.name,
						value: barangay.barangayCode,
					}))}
					placeholder="Select barangay"
					onChange={(barangayCode) =>
						setState({ ...state, barangayCode })
					}
				/>

				<TextField
					label="Street"
					placeholder="House no., building, street"
					value={state.street}
					onChange={(street) => setState({ ...state, street })}
				/>
			</div>

			<AddressPreview
				address={composedAddress}
				isLoading={isLoading}
				payload={{
					barangay: selectedBarangay ?? null,
					cityMunicipality: selectedCityMunicipality ?? null,
					province: selectedProvince ?? null,
					region: selectedRegion ?? null,
					street: state.street || null,
				}}
			/>
		</TestPanel>
	);
}

function AutocompleteTester({
	regions,
	withRegion = false,
}: {
	regions: AddressRegion[];
	withRegion?: boolean;
}) {
	const [query, setQuery] = useState("");
	const [regionCode, setRegionCode] = useState("");
	const [resolvedState, setResolvedState] = useState<FlowState>(EmptyFlowState);
	const [provinces, setProvinces] = useState<AddressProvince[]>([]);
	const [citiesMunicipalities, setCitiesMunicipalities] = useState<
		AddressCityMunicipality[]
	>([]);
	const [barangays, setBarangays] = useState<AddressBarangay[]>([]);
	const [addresses, setAddresses] = useState<AddressAutocompleteItem[]>([]);
	const [selectedAddress, setSelectedAddress] =
		useState<AddressAutocompleteItem | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const selectedRegion = useMemo(
		() => regions.find((region) => region.regionCode === regionCode),
		[regionCode, regions],
	);

	const searchAutocomplete = useCallback(async (searchQuery: string) => {
		setIsLoading(true);
		setError("");

		try {
			const nextAddresses = await GetAddressAutocomplete({
				query: searchQuery,
				regionCode: withRegion ? regionCode : undefined,
			});

			setAddresses(nextAddresses);
		} catch (requestError) {
			setError(getErrorMessage(requestError));
		} finally {
			setIsLoading(false);
		}
	}, [regionCode, withRegion]);

	useEffect(() => {
		const trimmedQuery = query.trim();

		if (trimmedQuery.length < 2) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			void searchAutocomplete(trimmedQuery);
		}, 250);

		return () => window.clearTimeout(timeoutId);
	}, [query, regionCode, searchAutocomplete]);

	async function selectAutocompleteAddress(address: AddressAutocompleteItem) {
		setSelectedAddress(address);
		setIsLoading(true);
		setError("");

		try {
			const [nextProvinces, nextCitiesMunicipalities, nextBarangays] =
				await Promise.all([
					GetAddressProvinces(address.region.code),
					GetAddressCitiesMunicipalities({
						provinceCode: address.province.code,
					}),
					GetAddressBarangays(address.cityMunicipality.code),
				]);

			setRegionCode(address.region.code);
			setProvinces(nextProvinces);
			setCitiesMunicipalities(nextCitiesMunicipalities);
			setBarangays(nextBarangays);
			setResolvedState({
				barangayCode: address.barangay.code,
				cityMunicipalityCode: address.cityMunicipality.code,
				provinceCode: address.province.code,
				regionCode: address.region.code,
				street: "",
			});
		} catch (requestError) {
			setError(getErrorMessage(requestError));
		} finally {
			setIsLoading(false);
		}
	}

	async function selectResolvedRegion(nextRegionCode: string) {
		setRegionCode(nextRegionCode);
		setResolvedState({
			...resolvedState,
			barangayCode: "",
			cityMunicipalityCode: "",
			provinceCode: "",
			regionCode: nextRegionCode,
		});
		setProvinces([]);
		setCitiesMunicipalities([]);
		setBarangays([]);
		setSelectedAddress(null);

		if (!nextRegionCode) {
			return;
		}

		await loadAutocompleteDropdownOptions(
			() => GetAddressProvinces(nextRegionCode),
			setProvinces,
		);
	}

	async function selectResolvedProvince(nextProvinceCode: string) {
		const province = provinces.find(
			(candidate) => candidate.provinceCode === nextProvinceCode,
		);

		setResolvedState({
			...resolvedState,
			barangayCode: "",
			cityMunicipalityCode: "",
			provinceCode: nextProvinceCode,
			regionCode: resolvedState.regionCode || province?.regionCode || "",
		});
		setCitiesMunicipalities([]);
		setBarangays([]);
		setSelectedAddress(null);

		if (!nextProvinceCode) {
			return;
		}

		await loadAutocompleteDropdownOptions(
			() => GetAddressCitiesMunicipalities({ provinceCode: nextProvinceCode }),
			setCitiesMunicipalities,
		);
	}

	async function selectResolvedCityMunicipality(
		nextCityMunicipalityCode: string,
	) {
		const cityMunicipality = citiesMunicipalities.find(
			(candidate) =>
				candidate.cityMunicipalityCode === nextCityMunicipalityCode,
		);

		setResolvedState({
			...resolvedState,
			barangayCode: "",
			cityMunicipalityCode: nextCityMunicipalityCode,
			provinceCode:
				resolvedState.provinceCode || cityMunicipality?.provinceCode || "",
			regionCode: resolvedState.regionCode || cityMunicipality?.regionCode || "",
		});
		setBarangays([]);
		setSelectedAddress(null);

		if (!nextCityMunicipalityCode) {
			return;
		}

		await loadAutocompleteDropdownOptions(
			() => GetAddressBarangays(nextCityMunicipalityCode),
			setBarangays,
		);
	}

	async function loadAutocompleteDropdownOptions<TRecord>(
		loader: () => Promise<TRecord[]>,
		setter: (records: TRecord[]) => void,
	) {
		setIsLoading(true);
		setError("");

		try {
			setter(await loader());
		} catch (requestError) {
			setError(getErrorMessage(requestError));
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<TestPanel
			icon={<Search className="h-4 w-4" aria-hidden="true" />}
			title={
				withRegion ? "Autocomplete with Region" : "Autocomplete without Region"
			}
		>
			{error ? <InlineError message={error} /> : null}

			<div className="grid gap-4">
				<TextField
					label="Search"
					placeholder="Type barangay, city, province, or code"
					value={query}
					onChange={(value) => {
						setQuery(value);
						setSelectedAddress(null);
						setResolvedState(EmptyFlowState);
						setProvinces([]);
						setCitiesMunicipalities([]);
						setBarangays([]);
						if (value.trim().length < 2) {
							setAddresses([]);
						}
					}}
				/>
			</div>

			<div className="grid gap-3">
				<div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
					<span>Results</span>
					<span>{isLoading ? "Loading" : `${addresses.length} matches`}</span>
				</div>
				<div className="max-h-72 overflow-auto rounded-lg border border-slate-200 bg-slate-50">
					{addresses.length > 0 ? (
						addresses.map((address) => (
							<button
								key={address.barangay.code}
								type="button"
								className="block w-full border-b border-slate-200 px-4 py-3 text-left transition last:border-b-0 hover:bg-white"
								onClick={() => void selectAutocompleteAddress(address)}
							>
								<span className="block text-sm font-semibold text-slate-900">
									{formatAutocompleteLabel(address, withRegion)}
								</span>
								<span className="mt-1 block text-xs text-slate-500">
									{withRegion
										? "Includes region in label"
										: "Region omitted from label"}
								</span>
							</button>
						))
					) : (
						<div className="px-4 py-6 text-sm text-slate-500">
							{query.trim().length < 2
								? "Type at least two characters."
								: "No matches yet."}
						</div>
					)}
				</div>
			</div>

			<div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
				<DropdownField
					label="Region"
					value={resolvedState.regionCode}
					options={regions.map((region) => ({
						name: region.name,
						value: region.regionCode,
					}))}
					placeholder="Auto-filled region"
					onChange={(value) => void selectResolvedRegion(value)}
				/>

				<DropdownField
					disabled={!resolvedState.regionCode}
					label="Province"
					value={resolvedState.provinceCode}
					options={provinces.map((province) => ({
						name: province.name,
						value: province.provinceCode,
					}))}
					placeholder="Auto-filled province"
					onChange={(value) => void selectResolvedProvince(value)}
				/>

				<DropdownField
					disabled={!resolvedState.provinceCode}
					label="City/Municipality"
					value={resolvedState.cityMunicipalityCode}
					options={citiesMunicipalities.map((cityMunicipality) => ({
						name: cityMunicipality.name,
						value: cityMunicipality.cityMunicipalityCode,
					}))}
					placeholder="Auto-filled city or municipality"
					onChange={(value) => void selectResolvedCityMunicipality(value)}
				/>

				<DropdownField
					disabled={!resolvedState.cityMunicipalityCode}
					label="Barangay"
					value={resolvedState.barangayCode}
					options={barangays.map((barangay) => ({
						name: barangay.name,
						value: barangay.barangayCode,
					}))}
					placeholder="Auto-filled barangay"
					onChange={(barangayCode) => {
						setResolvedState({ ...resolvedState, barangayCode });
						setSelectedAddress(null);
					}}
				/>
			</div>

			<AddressPreview
				address={
					selectedAddress
						? formatAutocompleteLabel(selectedAddress, withRegion)
						: selectedRegion
							? `Filtered by ${selectedRegion.name}`
							: ""
				}
				isLoading={isLoading}
				payload={{
					autoFilled: resolvedState,
					selectedAddress,
				}}
			/>
		</TestPanel>
	);
}

function TestPanel({
	children,
	icon,
	title,
}: {
	children: React.ReactNode;
	icon: React.ReactNode;
	title: string;
}) {
	return (
		<section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
			<div className="flex items-center gap-2">
				<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
					{icon}
				</span>
				<h2 className="text-lg font-bold text-slate-950">{title}</h2>
			</div>
			{children}
		</section>
	);
}

function DropdownField({
	disabled = false,
	label,
	onChange,
	onFocus,
	options,
	placeholder,
	value,
}: {
	disabled?: boolean;
	label: string;
	onChange: (value: string) => void;
	onFocus?: () => void;
	options: AppAdvancedDropdownOption[];
	placeholder: string;
	value: string;
}) {
	return (
		<label className="grid gap-2" onFocus={onFocus} onPointerDown={onFocus}>
			<span className="text-sm font-semibold text-slate-700">{label}</span>
			<AppAdvancedDropdown
				className="min-h-11"
				disabled={disabled}
				emptyMessage="No address options found."
				options={options}
				placeholder={placeholder}
				searchPlaceholder={`Search ${label.toLowerCase()}`}
				value={value}
				onChange={(nextValue) =>
					onChange(Array.isArray(nextValue) ? (nextValue[0] ?? "") : nextValue)
				}
			/>
		</label>
	);
}

function TextField({
	label,
	onChange,
	placeholder,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	placeholder: string;
	value: string;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-slate-700">{label}</span>
			<input
				className={FieldClassName}
				placeholder={placeholder}
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}

function AddressPreview({
	address,
	isLoading,
	payload,
}: {
	address: string;
	isLoading: boolean;
	payload: unknown;
}) {
	return (
		<div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2 text-sm font-bold text-slate-800">
					<LocateFixed className="h-4 w-4 text-sky-700" aria-hidden="true" />
					Selected address
				</div>
				{isLoading ? (
					<span className="text-xs font-semibold text-sky-700">Loading</span>
				) : null}
			</div>
			<p className="min-h-6 text-sm font-medium text-slate-700">
				{address || "No address selected yet."}
			</p>
			<pre className="max-h-56 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-100">
				{JSON.stringify(payload, null, 2)}
			</pre>
		</div>
	);
}

function InlineError({ message }: { message: string }) {
	return (
		<div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
			{message}
		</div>
	);
}

function composeAddress({
	barangay,
	cityMunicipality,
	province,
	region,
	street,
}: {
	barangay?: string;
	cityMunicipality?: string;
	province?: string;
	region?: string;
	street?: string;
}) {
	return [street, barangay, cityMunicipality, province, region]
		.map((part) => part?.trim())
		.filter(Boolean)
		.join(", ");
}

function composeAutocompleteShortLabel(address: AddressAutocompleteItem) {
	return [
		address.barangay.name,
		address.cityMunicipality.name,
		address.province.name,
	]
		.filter(Boolean)
		.join(", ");
}

function composeAutocompleteFullLabel(address: AddressAutocompleteItem) {
	return [
		address.barangay.name,
		address.cityMunicipality.name,
		address.province.name,
		address.region.name,
	]
		.filter(Boolean)
		.join(", ");
}

function formatAutocompleteLabel(
	address: AddressAutocompleteItem,
	withRegion: boolean,
) {
	return withRegion
		? composeAutocompleteFullLabel(address)
		: composeAutocompleteShortLabel(address);
}

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Address API request failed.";
}
