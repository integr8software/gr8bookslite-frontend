"use client";

import {
	useMemo,
	useState,
	type ChangeEvent,
	type FormEvent,
} from "react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	PartyManagementEditFromParam,
	PartyManagementEditFromViewQuery,
	PartyManagementEditFromViewValue,
	PartyManagementHref,
	PartyTypeOptions,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { FormatTinNumber } from "@/app/src/data/shared/TaxData";
import {
	PartyInformationInitialFormValues,
	createPartyInformationFormValues,
	createPartyInformationRecord,
	getPartyAtcCodeOptionsByClassification,
	isKnownPartyType,
	updatePartyInformationRecord,
} from "@/app/src/data/modules/maintenance/party-management/party-management/PartyManagementData";
import { usePhilippineAddressOptions } from "@/app/src/hooks/shared/address/ph/usePhilippineAddressOptions";
import type {
	PartyAddress,
	PartyInformationActionMode,
	PartyInformationFormErrors,
	PartyInformationFormValues,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import {
	isPartyInformationFormSubmittable,
	validatePartyInformationForm,
} from "@/app/src/validations/modules/maintenance/party-management/party-management/PartyManagementValidation";
import { usePartyManagementStore } from "./usePartyManagement";

export function usePartyManagementAction() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const records = usePartyManagementStore((state) => state.records);
	const addRecord = usePartyManagementStore((state) => state.addRecord);
	const updateRecord = usePartyManagementStore((state) => state.updateRecord);
	const mode = getActionMode(pathname);
	const openedFromView =
		mode === "edit" &&
		searchParams.get(PartyManagementEditFromParam) ===
			PartyManagementEditFromViewValue;
	const existingRecord = records.find((record) => record.id === params.recordId);
	const [values, setValues] = useState<PartyInformationFormValues>(() =>
		existingRecord
			? createPartyInformationFormValues(existingRecord)
			: PartyInformationInitialFormValues,
	);
	const [errors, setErrors] = useState<PartyInformationFormErrors>({});
	const addressOptions = usePhilippineAddressOptions({
		cityMunicipalityCode: values.address.cityMunicipalityCode,
		provinceCode: values.address.provinceCode,
		regionCode: values.address.regionCode,
	});
	const isReadonly = mode === "view";
	const isClassificationSelected = Boolean(values.classification);
	const isSubmittable =
		!isReadonly && isPartyInformationFormSubmittable(values);
	const atcOptions = useMemo(
		() => getPartyAtcCodeOptionsByClassification(values.classification),
		[values.classification],
	);
	const viewHref = existingRecord
		? `${PartyManagementHref}/view/${existingRecord.id}`
		: PartyManagementHref;
	const cancelHref =
		mode === "edit" && openedFromView ? viewHref : PartyManagementHref;
	const editHref = existingRecord
		? `${PartyManagementHref}/edit/${existingRecord.id}?${PartyManagementEditFromViewQuery}`
		: undefined;

	function updateField<TKey extends keyof PartyInformationFormValues>(
		field: TKey,
		value: PartyInformationFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			if (field === "classification") {
				return {
					...current,
					classification: value as PartyInformationFormValues["classification"],
					partyName: "",
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
		if (isReadonly || !isClassificationSelected) {
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
			field === "tin" ? FormatTinNumber(event.target.value) : event.target.value;

		updateField(field, value as never);
	}

	function handleAddressInputChange(event: ChangeEvent<HTMLInputElement>) {
		updateAddressField(event.target.name as keyof PartyAddress, event.target.value);
	}

	function handlePartyTypesChange(value: string | string[]) {
		if (isReadonly || !isClassificationSelected) {
			return;
		}

		const values = Array.isArray(value) ? value : [value];
		const partyTypes = values.filter(isKnownPartyType);

		setValues((current) => ({
			...current,
			partyTypes,
		}));
		setErrors((current) => ({ ...current, partyTypes: undefined }));
	}

	function selectAtcCode(value: string | string[]) {
		if (isReadonly || !isClassificationSelected) {
			return;
		}

		const code = getSingleSelectedValue(value);

		setValues((current) => ({
			...current,
			atcCode: code,
		}));
		setErrors((current) => ({ ...current, atcCode: undefined }));
	}

	function selectRegion(value: string | string[]) {
		if (isReadonly || !isClassificationSelected) {
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
	}

	function selectProvince(value: string | string[]) {
		if (isReadonly || !isClassificationSelected) {
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
	}

	function selectCityMunicipality(value: string | string[]) {
		if (isReadonly || !isClassificationSelected) {
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
	}

	function selectBarangay(value: string | string[]) {
		if (isReadonly || !isClassificationSelected) {
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
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validatePartyInformationForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingRecord) {
			updateRecord(updatePartyInformationRecord(existingRecord, values));
		} else {
			addRecord(createPartyInformationRecord(values));
		}

		router.push(mode === "edit" && openedFromView ? viewHref : PartyManagementHref);
	}

	return {
		addressOptions,
		atcOptions,
		cancelHref,
		editHref,
		errors,
		existingRecord,
		handleAddressInputChange,
		handleInputChange,
		handlePartyTypesChange,
		handleSubmit,
		isClassificationSelected,
		isReadonly,
		isSubmittable,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		partyTypeOptions: PartyTypeOptions,
		selectBarangay,
		selectCityMunicipality,
		selectProvince,
		selectRegion,
		selectAtcCode,
		updateField,
		values,
	};
}

function getActionMode(pathname: string): PartyInformationActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

function getSingleSelectedValue(value: string | string[]) {
	return Array.isArray(value) ? (value[0] ?? "") : value;
}
