"use client";

import type { ChangeEvent } from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PurchaseRequestFormSignatoryModuleCodes } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveFormSignatorySetup } from "@/app/src/services/modules/maintenance/form-signatory/FormSignatoryApi";
import { FormSignatoryQueryKeys } from "@/app/src/services/modules/maintenance/form-signatory/FormSignatoryQueryKeys";
import { ReadFileAsDataUrl } from "@/app/src/services/shared/media/ImageCropper";
import type {
	PurchaseRequestFormSignatoryOption,
	PurchaseRequestUpdateField,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

export function usePurchaseRequestSummaryPanel(
	updateField: PurchaseRequestUpdateField,
) {
	const accessToken = useAppStore((state) => state.accessToken);
	const activeBranchId = useAppStore((state) => state.activeBranchId);
	const isAuthSessionReady = useAppStore((state) => state.isAuthSessionReady);
	const resolvedSetupQuery = useQuery({
		queryKey: FormSignatoryQueryKeys.resolve(
			activeBranchId,
			PurchaseRequestFormSignatoryModuleCodes,
		),
		queryFn: () =>
			ResolveFormSignatorySetup(
				accessToken,
				activeBranchId ?? 0,
				PurchaseRequestFormSignatoryModuleCodes,
			),
		enabled:
			isAuthSessionReady && Boolean(accessToken) && activeBranchId != null,
		refetchOnMount: true,
	});
	const formSignatoryRows = useMemo(
		() => getPurchaseRequestFormSignatoryRows(resolvedSetupQuery.data),
		[resolvedSetupQuery.data],
	);
	const preparedByOptions = useMemo(
		() =>
			getPreferredSignatoryOptions(
				formSignatoryRows,
				"Prepared by",
			),
		[formSignatoryRows],
	);
	const approvedByOptions = useMemo(
		() =>
			getPreferredSignatoryOptions(
				formSignatoryRows,
				"Approved by",
			),
		[formSignatoryRows],
	);

	return {
		approvedByOptions,
		clearApprovedBy: () => {
			updateField("approvedBy", "");
			updateField("approvedByLabel", "Approved by");
			updateField("approvedBySignatureFileName", "");
			updateField("approvedBySignatureImageUrl", "");
		},
		clearLogoImage: () => {
			updateField("logoFileName", "");
			updateField("logoImageUrl", "");
		},
		clearPreparedBy: () => {
			updateField("preparedBy", "");
			updateField("preparedByLabel", "Prepared by");
			updateField("preparedBySignatureFileName", "");
			updateField("preparedBySignatureImageUrl", "");
		},
		handleApprovedByChange: (option: PurchaseRequestFormSignatoryOption) => {
			updateField("approvedBy", option.name);
			updateField("approvedByLabel", getDisplaySignatoryLabel(option));
			updateField("approvedBySignatureFileName", option.signatureName);
			updateField("approvedBySignatureImageUrl", option.signaturePreview);
		},
		handleLogoImageChange: (event: ChangeEvent<HTMLInputElement>) =>
			handleLogoImageChange(event, updateField),
		handlePreparedByChange: (option: PurchaseRequestFormSignatoryOption) => {
			updateField("preparedBy", option.name);
			updateField("preparedByLabel", getDisplaySignatoryLabel(option));
			updateField("preparedBySignatureFileName", option.signatureName);
			updateField("preparedBySignatureImageUrl", option.signaturePreview);
		},
		isLoadingSignatories: resolvedSetupQuery.isLoading,
		preparedByOptions,
	};
}

function getPurchaseRequestFormSignatoryRows(
	setup: Awaited<ReturnType<typeof ResolveFormSignatorySetup>> | undefined,
) {
	const seenRows = new Set<string>();

	return (setup?.rows ?? [])
		.filter((row) => row.name.trim())
		.map((row) => ({
			...row,
			branch: setup?.branch ?? "",
			setupId: setup?.id ?? row.setupId ?? "",
		}))
		.filter((row) => {
			const key = `${row.name}:${row.signatureName}:${row.signaturePreview}`;

			if (seenRows.has(key)) {
				return false;
			}

			seenRows.add(key);
			return true;
		});
}

function getPreferredSignatoryOptions(
	rows: PurchaseRequestFormSignatoryOption[],
	label: string,
) {
	return rows.filter(
		(row) => row.label === label,
	);
}

function getDisplaySignatoryLabel(row: PurchaseRequestFormSignatoryOption) {
	return row.isThisTemporary === true ? `Temporary ${row.label}` : row.label;
}

async function handleLogoImageChange(
	event: ChangeEvent<HTMLInputElement>,
	updateField: PurchaseRequestUpdateField,
) {
	const file = event.target.files?.[0];
	event.target.value = "";

	if (!file || !file.type.startsWith("image/")) {
		return;
	}

	const dataUrl = await ReadFileAsDataUrl(file);
	updateField("logoFileName", file.name);
	updateField("logoImageUrl", dataUrl);
}
