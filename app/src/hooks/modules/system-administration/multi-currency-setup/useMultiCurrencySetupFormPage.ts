"use client";

import {
	useMemo,
	useState,
	type ChangeEvent,
	type FormEvent,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MultiCurrencySetupHref } from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";
import {
	MultiCurrencySetupInitialFormValues,
	createMultiCurrencySetupFormValues,
	createMultiCurrencySetupRecord,
	findFetchedRate,
	formatExchangeRate,
	updateMultiCurrencySetupRecord,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import { useMultiCurrencySetupRates } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetupRates";
import { useMultiCurrencySetupStore } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetup";
import type {
	MultiCurrencySetupActionMode,
	MultiCurrencySetupFormErrors,
	MultiCurrencySetupFormValues,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";
import { validateMultiCurrencySetupForm } from "@/app/src/validations/modules/system-administration/multi-currency-setup/MultiCurrencySetupValidation";

export function useMultiCurrencySetupFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const records = useMultiCurrencySetupStore((state) => state.records);
	const addRecord = useMultiCurrencySetupStore((state) => state.addRecord);
	const updateRecord = useMultiCurrencySetupStore(
		(state) => state.updateRecord,
	);
	const deleteRecord = useMultiCurrencySetupStore(
		(state) => state.deleteRecord,
	);
	const isMutating = useMultiCurrencySetupStore((state) => state.isMutating);
	const mode = getActionMode(pathname);
	const existingRecord = records.find((record) => record.id === params.recordId);
	const [values, setValues] = useState<MultiCurrencySetupFormValues>(() =>
		existingRecord
			? createMultiCurrencySetupFormValues(existingRecord)
			: MultiCurrencySetupInitialFormValues,
	);
	const [errors, setErrors] = useState<MultiCurrencySetupFormErrors>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const isReadonly = mode === "view";
	const ratesQuery = useMultiCurrencySetupRates(values.baseCurrencyCode);
	const fetchedRates = ratesQuery.data ?? [];
	const fetchedRate = findFetchedRate(
		fetchedRates,
		values.targetCurrencyCode,
	);
	const originalExchangeRate = existingRecord
		? existingRecord.originalExchangeRate
		: fetchedRate?.exchangeRate;
	const originalExchangeRateDisplay =
		originalExchangeRate == null
			? "0.000000"
			: formatExchangeRate(
					originalExchangeRate === 0 ? 0 : 1 / originalExchangeRate,
				);
	const fetchedExchangeRateDisplay = fetchedRate
		? formatExchangeRate(fetchedRate.inverseExchangeRate)
		: "0.000000";
	const inverseExchangeRateDisplay = fetchedRate
		? formatExchangeRate(fetchedRate.exchangeRate)
		: "0.000000";
	const baseOriginalExchangeRateDisplay = fetchedRate
		? formatExchangeRate(fetchedRate.baseOriginalExchangeRate)
		: "1.000000";
	const hasCurrencyPairChanged = useMemo(
		() =>
			Boolean(existingRecord) &&
			(existingRecord?.baseCurrencyCode !== values.baseCurrencyCode ||
				existingRecord?.targetCurrencyCode !== values.targetCurrencyCode),
		[existingRecord, values.baseCurrencyCode, values.targetCurrencyCode],
	);

	function updateField(
		field: keyof MultiCurrencySetupFormValues,
		value:
			| MultiCurrencySetupFormValues[keyof MultiCurrencySetupFormValues]
			| string,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			[field]: value,
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) {
		updateField(
			event.target.name as keyof MultiCurrencySetupFormValues,
			event.target.value,
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateMultiCurrencySetupForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted currency fields.");
			return;
		}

		if (!fetchedRate) {
			toast.error("Could not fetch an exchange rate for that currency pair.");
			return;
		}

		if (mode === "edit" && existingRecord) {
			updateRecord(
				updateMultiCurrencySetupRecord(existingRecord, values, fetchedRate),
			);
		} else if (mode === "edit") {
			toast.error("Could not find the currency setup to update.");
			return;
		} else {
			addRecord(createMultiCurrencySetupRecord(values, fetchedRate));
		}

		router.push(MultiCurrencySetupHref);
	}

	function handleConfirmDelete() {
		if (!existingRecord) {
			toast.error("Could not find the currency setup to delete.");
			return;
		}

		deleteRecord(existingRecord.id);
		setIsDeleteDialogOpen(false);
		router.push(MultiCurrencySetupHref);
	}

	return {
		baseOriginalExchangeRateDisplay,
		errors,
		existingRecord,
		fetchedExchangeRateDisplay,
		fetchedRate,
		handleConfirmDelete,
		handleInputChange,
		handleSubmit,
		hasCurrencyPairChanged,
		inverseExchangeRateDisplay,
		isDeleteDialogOpen,
		isMutating,
		isRateLoading: ratesQuery.isLoading,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		originalExchangeRateDisplay,
		setIsDeleteDialogOpen,
		values,
	};
}

function getActionMode(pathname: string): MultiCurrencySetupActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
