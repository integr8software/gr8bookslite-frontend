"use client";

import {
	useMemo,
	useState,
	type ChangeEvent,
	type FormEvent,
} from "react";
import { PartyTypeOptions } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
	PartyInformationInitialFormValues,
	createPartyInformationRecord,
	getPartyAtcCodeOptionsByClassification,
	isKnownPartyType,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import { usePhilippineAddressOptions } from "@/app/src/hooks/shared/address/ph/usePhilippineAddressOptions";
import type {
	PartyAddress,
	PartyInformationFormErrors,
	PartyInformationFormValues,
	PartyInformationRecord,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { validatePartyInformationForm } from "@/app/src/validations/modules/maintenance/party-management/PartyManagementValidation";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { PartyInformationDetailsFields } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationDetailsFields";

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
	const [errors, setErrors] = useState<PartyInformationFormErrors>({});
	const addressOptions = usePhilippineAddressOptions({
		cityMunicipalityCode: values.address.cityMunicipalityCode,
		provinceCode: values.address.provinceCode,
		regionCode: values.address.regionCode,
	});
	const isClassificationSelected = Boolean(values.classification);
	const atcOptions = useMemo(
		() => getPartyAtcCodeOptionsByClassification(values.classification),
		[values.classification],
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
					tradingName: "",
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
			address: {
				...current.address,
				[field]: value,
			},
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
		updateAddressField(event.target.name as keyof PartyAddress, event.target.value);
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

	function selectRegion(value: string | string[]) {
		if (!isClassificationSelected) {
			return;
		}

		const code = getSingleSelectedValue(value);
		const option = addressOptions.regionOptions.find(
			(region) => region.value === code,
		);

		setValues((current) => ({
			...current,
			address: {
				...current.address,
				barangay: "",
				barangayCode: "",
				cityMunicipality: "",
				cityMunicipalityCode: "",
				province: "",
				provinceCode: "",
				region: option?.name ?? "",
				regionCode: code,
			},
		}));
		clearAddressErrors([
			"regionCode",
			"provinceCode",
			"cityMunicipalityCode",
			"barangayCode",
		]);
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
			address: {
				...current.address,
				barangay: "",
				barangayCode: "",
				cityMunicipality: "",
				cityMunicipalityCode: "",
				province: option?.name ?? "",
				provinceCode: code,
			},
		}));
		clearAddressErrors(["provinceCode", "cityMunicipalityCode", "barangayCode"]);
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
			address: {
				...current.address,
				barangay: "",
				barangayCode: "",
				cityMunicipality: option?.name ?? "",
				cityMunicipalityCode: code,
			},
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
			address: {
				...current.address,
				barangay: option?.name ?? "",
				barangayCode: code,
			},
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
			<div
				id={PartyDrawerFormId}
				className="px-6 py-5"
			>
				<PartyInformationDetailsFields
					addressOptions={addressOptions}
					atcOptions={atcOptions}
					errors={errors}
					isClassificationSelected={isClassificationSelected}
					isReadonly={false}
					partyTypeOptions={PartyTypeOptions}
					values={values}
					onAddressInputChange={handleAddressInputChange}
					onInputChange={handleInputChange}
					onPartyTypesChange={handlePartyTypesChange}
					onSelectBarangay={selectBarangay}
					onSelectAtcCode={selectAtcCode}
					onSelectCityMunicipality={selectCityMunicipality}
					onSelectProvince={selectProvince}
					onSelectRegion={selectRegion}
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
