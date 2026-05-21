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
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import {
	PartyAtcCodeOptions,
	PartyInformationInitialFormValues,
	createPartyInformationFormValues,
	createPartyInformationRecord,
	createPartySubmitPayload,
	isKnownPartyType,
	isPartyInformationFormSubmittable,
	updatePartyInformationRecord,
	validatePartyInformationForm,
} from "@/app/src/data/modules/maintenance/party-management/party-management/PartyManagementData";
import type {
	PartyAddress,
	PartyInformationActionMode,
	PartyInformationFormErrors,
	PartyInformationFormValues,
	PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
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
	const [partyTypeQuery, setPartyTypeQuery] = useState("");
	const [atcQuery, setAtcQuery] = useState("");
	const isReadonly = mode === "view";
	const isClassificationSelected = Boolean(values.classification);
	const isSubmittable =
		!isReadonly && isPartyInformationFormSubmittable(values);
	const selectedAtcOption = PartyAtcCodeOptions.find(
		(option) => option.code === values.atcCode,
	);
	const atcOptions = useMemo(() => {
		const query = atcQuery.trim().toLowerCase();

		if (!query) {
			return PartyAtcCodeOptions;
		}

		return PartyAtcCodeOptions.filter(
			(option) =>
				option.code.toLowerCase().includes(query) ||
				option.label.toLowerCase().includes(query) ||
				option.category.toLowerCase().includes(query),
		);
	}, [atcQuery]);
	const submitPayload = useMemo(
		() => createPartySubmitPayload(values),
		[values],
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
		updateField(field, event.target.value as never);
	}

	function handleAddressInputChange(event: ChangeEvent<HTMLInputElement>) {
		updateAddressField(event.target.name as keyof PartyAddress, event.target.value);
	}

	function togglePartyType(type: PartyType) {
		if (isReadonly || !isClassificationSelected) {
			return;
		}

		setValues((current) => {
			const partyTypes = current.partyTypes.includes(type)
				? current.partyTypes.filter((item) => item !== type)
				: [...current.partyTypes, type];

			return {
				...current,
				partyTypes,
			};
		});
		setErrors((current) => ({ ...current, partyTypes: undefined }));
	}

	function removePartyType(type: PartyType) {
		if (isReadonly || !isClassificationSelected) {
			return;
		}

		setValues((current) => ({
			...current,
			partyTypes: current.partyTypes.filter((item) => item !== type),
		}));
	}

	function handlePartyTypeQueryChange(value: string) {
		setPartyTypeQuery(value);
	}

	function selectAtcCode(code: string) {
		if (isReadonly || !isClassificationSelected) {
			return;
		}

		setValues((current) => ({
			...current,
			atcCode: code,
		}));
		setErrors((current) => ({ ...current, atcCode: undefined }));
		setAtcQuery("");
	}

	function handleAtcQueryChange(value: string) {
		setAtcQuery(value);
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
		atcOptions,
		atcQuery,
		cancelHref,
		editHref,
		errors,
		existingRecord,
		handleAddressInputChange,
		handleAtcQueryChange,
		handleInputChange,
		handlePartyTypeQueryChange,
		handleSubmit,
		isClassificationSelected,
		isReadonly,
		isSubmittable,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		partyTypeOptions: getFilteredPartyTypes(partyTypeQuery),
		partyTypeQuery,
		removePartyType,
		selectedAtcOption,
		selectAtcCode,
		submitPayload,
		togglePartyType,
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

function getFilteredPartyTypes(query: string) {
	const normalizedQuery = query.trim().toLowerCase();
	const partyTypes = ["Vendor", "Customer", "Employee"];

	if (!normalizedQuery) {
		return partyTypes.filter(isKnownPartyType);
	}

	return partyTypes.filter(
		(type): type is PartyType =>
			isKnownPartyType(type) && type.toLowerCase().includes(normalizedQuery),
	);
}
