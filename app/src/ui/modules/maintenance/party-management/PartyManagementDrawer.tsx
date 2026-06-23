"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { PartyTypeOptions } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import { formatTermDuration } from "@/app/src/data/modules/maintenance/financial-management/term-management/TermManagementDisplay";
import { getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import {
	MaxPartyAddressCount,
	PartyInformationInitialFormValues,
	createEmptyPartyAddress,
	createPartyInformationRecord,
	getPartyAtcCodeOptionsByClassification,
	isKnownPartyType,
	setPartyDefaultAddress,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import { usePhilippineAddressOptions } from "@/app/src/hooks/shared/address/ph/usePhilippineAddressOptions";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/term-management/useTermManagement";
import type {
	PartyAddress,
	PartyInformationFormErrors,
	PartyInformationFormValues,
	PartyInformationRecord,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { validatePartyInformationForm } from "@/app/src/validations/modules/maintenance/party-management/PartyManagementValidation";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { PartyInformationDetailsFields } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationDetailsFields";
import type {
	AddressAutocompleteDetails,
	AddressAutocompleteItem,
} from "@/app/src/services/shared/address/AddressReferenceApi";

const PartyDrawerFormId = "party-management-drawer-form";

export function PartyManagementDrawer({
	description = "Create a party record from the party-management fields, then use it on this transaction.",
	isOpen,
	isPending,
	onAddRecord,
	onClose,
	onCreateParty,
	records,
	title = "Add Party Code",
}: {
	description?: string;
	isOpen: boolean;
	isPending: boolean;
	onAddRecord: (record: PartyInformationRecord) => void;
	onClose: () => void;
	onCreateParty: (record: PartyInformationRecord) => void;
	records: PartyInformationRecord[];
	title?: string;
}) {
	const [values, setValues] = useState<PartyInformationFormValues>(() =>
		createPartyDrawerInitialValues(records),
	);
	const terms = useTermManagementStore((state) => state.terms);
	const [errors, setErrors] = useState<PartyInformationFormErrors>({});
	const activeAddress =
		values.addresses.find((address) => address.id === values.activeAddressId) ??
		values.addresses[0] ??
		values.address;
	const addressOptions = usePhilippineAddressOptions({
		barangayCode: activeAddress.barangayCode,
		barangayName: activeAddress.barangay,
		cityMunicipalityCode: activeAddress.cityMunicipalityCode,
		cityMunicipalityName: activeAddress.cityMunicipality,
		provinceCode: activeAddress.provinceCode,
		provinceName: activeAddress.province,
		regionCode: activeAddress.regionCode,
		regionName: activeAddress.region,
	});
	const isClassificationSelected = Boolean(values.classification);
	const atcOptions = useMemo(
		() => getPartyAtcCodeOptionsByClassification(values.classification),
		[values.classification],
	);
	const accountOptions = useMemo(
		() => getModuleChartAccounts({ moduleKey: "maintenance-transaction-type" }),
		[],
	);
	const termOptions = useMemo(
		() =>
			terms
				.filter((term) => term.status === "Active")
				.map((term) => ({
					description: formatTermDuration(term),
					name: term.name,
					value: term.id,
				})),
		[terms],
	);

	function updateField<TKey extends keyof PartyInformationFormValues>(
		field: TKey,
		value: PartyInformationFormValues[TKey],
	) {
		setValues((current) => {
			if (field === "classification") {
				return {
					...current,
					classification: value as PartyInformationFormValues["classification"],
					partyName: "",
					tradeName: "",
					firstName: "",
					middleName: "",
					lastName: "",
					suffixName: "",
					atcCode: "",
				};
			}

			return {
				...current,
				[field]: value,
			};
		});
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function updateAddressField(field: keyof PartyAddress, value: string) {
		if (!isClassificationSelected) {
			return;
		}

		setValues((current) => ({
			...current,
			addresses: current.addresses.map((address) =>
				address.id === current.activeAddressId
					? { ...address, [field]: value }
					: address,
			),
		}));
	}

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) {
		const field = event.target.name as keyof PartyInformationFormValues;
		const value =
			field === "tin"
				? FormatTinNumber(event.target.value)
				: field === "contactNo"
					? FormatPhilippineContactNumber(event.target.value)
					: event.target.value;

		updateField(field, value as never);
	}

	function handleAddressInputChange(event: ChangeEvent<HTMLInputElement>) {
		updateAddressField(
			event.target.name as keyof PartyAddress,
			event.target.value,
		);
	}

	function handlePartyTypesChange(value: string | string[]) {
		const selectedValues = Array.isArray(value) ? value : [value];
		const partyTypes = selectedValues.filter(isKnownPartyType);

		setValues((current) => ({
			...current,
			partyTypes,
		}));
		setErrors((current) => ({ ...current, partyTypes: undefined }));
	}

	function selectAtcCode(value: string | string[]) {
		if (!isClassificationSelected) {
			return;
		}

		setValues((current) => ({
			...current,
			atcCode: getSingleSelectedValue(value),
		}));
		setErrors((current) => ({ ...current, atcCode: undefined }));
	}

	function selectProvince(value: string | string[]) {
		if (!isClassificationSelected) {
			return;
		}

		const code = getSingleSelectedValue(value);
		const option = addressOptions.provinceOptions.find(
			(province) => province.value === code,
		);

		setValues((current) => ({
			...current,
			addresses: current.addresses.map((address) =>
				address.id === current.activeAddressId
					? {
						...address,
						barangay: "",
						barangayCode: "",
						cityMunicipality: "",
						cityMunicipalityCode: "",
						province: option?.name ?? "",
						provinceCode: code,
						region: option?.regionName ?? "",
						regionCode: option?.regionCode ?? "",
					}
					: address,
			),
		}));
		clearAddressErrors([
			"regionCode",
			"provinceCode",
			"cityMunicipalityCode",
			"barangayCode",
		]);
	}

	function selectAutocompleteAddress(
		address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
	) {
		if (!isClassificationSelected) {
			return;
		}

		setValues((current) => ({
			...current,
			addresses: current.addresses.map((currentAddress) =>
				currentAddress.id === current.activeAddressId
					? {
						...currentAddress,
						addressLine1:
							details?.addressLine1 ?? currentAddress.addressLine1,
						addressLine2:
							details?.addressLine2 ?? currentAddress.addressLine2,
						barangay: address.barangay.name,
						barangayCode: address.barangay.code,
						cityMunicipality: address.cityMunicipality.name,
						cityMunicipalityCode: address.cityMunicipality.code,
						province: address.province.name,
						provinceCode: address.province.code,
						region: address.region.name,
						regionCode: address.region.code,
					}
					: currentAddress,
			),
		}));
		clearAddressErrors([
			"regionCode",
			"provinceCode",
			"cityMunicipalityCode",
			"barangayCode",
		]);
	}

	function syncAutocompleteAddressDetails(details: AddressAutocompleteDetails) {
		if (!isClassificationSelected) {
			return;
		}

		setValues((current) => ({
			...current,
			addresses: current.addresses.map((currentAddress) =>
				currentAddress.id === current.activeAddressId
					? {
						...currentAddress,
						addressLine1: details.addressLine1 ?? currentAddress.addressLine1,
						addressLine2: details.addressLine2 ?? currentAddress.addressLine2,
					}
					: currentAddress,
			),
		}));
	}

	function selectCityMunicipality(value: string | string[]) {
		if (!isClassificationSelected) {
			return;
		}

		const code = getSingleSelectedValue(value);
		const option = addressOptions.cityMunicipalityOptions.find(
			(cityMunicipality) => cityMunicipality.value === code,
		);

		setValues((current) => ({
			...current,
			addresses: current.addresses.map((address) =>
				address.id === current.activeAddressId
					? {
						...address,
						barangay: "",
						barangayCode: "",
						cityMunicipality: option?.name ?? "",
						cityMunicipalityCode: code,
					}
					: address,
			),
		}));
		clearAddressErrors(["cityMunicipalityCode", "barangayCode"]);
	}

	function selectBarangay(value: string | string[]) {
		if (!isClassificationSelected) {
			return;
		}

		const code = getSingleSelectedValue(value);
		const option = addressOptions.barangayOptions.find(
			(barangay) => barangay.value === code,
		);

		setValues((current) => ({
			...current,
			addresses: current.addresses.map((address) =>
				address.id === current.activeAddressId
					? {
						...address,
						barangay: option?.name ?? "",
						barangayCode: code,
					}
					: address,
			),
		}));
		clearAddressErrors(["barangayCode"]);
	}

	function clearAddressErrors(fields: (keyof PartyInformationFormErrors)[]) {
		setErrors((current) => {
			const nextErrors = { ...current };

			for (const field of fields) {
				nextErrors[field] = undefined;
			}

			return nextErrors;
		});
	}

	function selectTerm(value: string | string[]) {
		const termId = getSingleSelectedValue(value);
		const term = terms.find((currentTerm) => currentTerm.id === termId);

		setValues((current) => ({
			...current,
			termId,
			termName: term?.name ?? "",
		}));
	}

	function addAddress() {
		const id = `address-${Date.now().toString(36)}`;

		setValues((current) =>
			current.addresses.length >= MaxPartyAddressCount
				? current
				: {
					...current,
					activeAddressId: id,
					addresses: [
						...current.addresses,
						createEmptyPartyAddress({
							id,
							addressName: `Address ${current.addresses.length + 1}`,
							isDefault: false,
						}),
					],
				},
		);
	}

	function removeAddress(addressId: string) {
		setValues((current) => {
			if (current.addresses.length <= 1) {
				return current;
			}

			const remaining = current.addresses.filter(
				(address) => address.id !== addressId,
			);
			const addresses = setPartyDefaultAddress(remaining);

			return {
				...current,
				activeAddressId:
					current.activeAddressId === addressId
						? (addresses[0]?.id ?? "")
						: current.activeAddressId,
				addresses,
			};
		});
	}

	function selectAddress(addressId: string) {
		setValues((current) => ({ ...current, activeAddressId: addressId }));
	}

	function setDefaultAddress(addressId: string) {
		setValues((current) => ({
			...current,
			activeAddressId: addressId,
			addresses: setPartyDefaultAddress(current.addresses, addressId),
		}));
		setErrors((current) => ({ ...current, addresses: undefined }));
	}

	function updateAddressMeta(
		addressId: string,
		field: "addressName" | "isBilling" | "isDelivery",
		value: string | boolean,
	) {
		setValues((current) => ({
			...current,
			addresses: current.addresses.map((address) =>
				address.id === addressId ? { ...address, [field]: value } : address,
			),
		}));
	}

	function handleSubmit(event?: FormEvent<HTMLFormElement>) {
		event?.preventDefault();

		const nextErrors = validatePartyInformationForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		const record = createPartyInformationRecord(values);

		onAddRecord(record);
		onCreateParty(record);
		onClose();
	}

	return (
		<ModuleDrawer
			description={description}
			footer={
				<div className="flex flex-wrap justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className={moduleDrawerSecondaryActionClassName}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => handleSubmit()}
						disabled={isPending}
						className={moduleDrawerPrimaryActionClassName}
					>
						Save Party
					</button>
				</div>
			}
			isOpen={isOpen}
			maxWidthClassName="max-w-5xl"
			onClose={onClose}
			title={title}
		>
			<div id={PartyDrawerFormId} className="px-6 py-5">
				<PartyInformationDetailsFields
					addressOptions={addressOptions}
					accountOptions={accountOptions}
					atcOptions={atcOptions}
					errors={errors}
					isClassificationSelected={isClassificationSelected}
					isReadonly={false}
					partyTypeOptions={PartyTypeOptions}
					termOptions={termOptions}
					values={values}
					onAddAddress={addAddress}
					onAddressInputChange={handleAddressInputChange}
					onInputChange={handleInputChange}
					onPartyTypesChange={handlePartyTypesChange}
					onRemoveAddress={removeAddress}
					onSelectAddress={selectAddress}
					onSelectBarangay={selectBarangay}
					onSelectAtcCode={selectAtcCode}
					onSelectAutocompleteAddress={selectAutocompleteAddress}
					onSyncAutocompleteAddressDetails={syncAutocompleteAddressDetails}
					onSelectCityMunicipality={selectCityMunicipality}
					onSelectProvince={selectProvince}
					onSelectTerm={selectTerm}
					onSetDefaultAddress={setDefaultAddress}
					onUpdateAddressMeta={updateAddressMeta}
					onUpdateField={updateField}
				/>
			</div>
		</ModuleDrawer>
	);
}

function createPartyDrawerInitialValues(
	records: PartyInformationRecord[],
): PartyInformationFormValues {
	return {
		...PartyInformationInitialFormValues,
		partyCodeNo: createNextPartyCode(records),
		status: "Active",
	};
}

function createNextPartyCode(records: PartyInformationRecord[]) {
	const nextNumber =
		records.reduce((highest, record) => {
			const match = record.partyCodeNo.match(/(\d+)$/);
			const number = match ? Number.parseInt(match[1], 10) : Number.NaN;

			return Number.isFinite(number) ? Math.max(highest, number) : highest;
		}, 0) + 1;

	return `PTY-${nextNumber.toString().padStart(4, "0")}`;
}

function getSingleSelectedValue(value: string | string[]) {
	return Array.isArray(value) ? (value[0] ?? "") : value;
}

const moduleDrawerSecondaryActionClassName =
	"inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15";

const moduleDrawerPrimaryActionClassName =
	"theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-md bg-skyblue px-4 text-sm font-semibold shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45";
