"use client";

import {
	useMemo,
	useState,
	type ChangeEvent,
	type FormEvent,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import {
	FormatPhilippineContactNumber,
} from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import {
	createWorkspaceCompanyBranchFormValues,
	createWorkspaceCompanyBranchFormValuesFromRecord,
	createWorkspaceCompanyUnitPayload,
	getWorkspaceCompanyHeadOfficeBranch,
	getWorkspaceCompanyMainBranchOptions,
} from "@/app/src/data/workspace/companies/WorkspaceCompanyBranchData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	useWorkspaceCompanyContext,
} from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import {
	deactivateWorkspaceCompanyUnit,
	getWorkspaceCompanyUnits,
	updateWorkspaceCompanyUnit,
	type UpdateWorkspaceCompanyUnitRequest,
} from "@/app/src/services/workspace/companies/WorkspaceCompanyUnitApi";
import { WorkspaceCompanyQueryKeys } from "@/app/src/services/workspace/companies/WorkspaceCompanyQueryKeys";
import type {
	WorkspaceCompanyBranchDrawerMode,
	WorkspaceCompanyBranchFormErrors,
	WorkspaceCompanyBranchFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyBranchTypes";
import type {
	WorkspaceCompanyBranchRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
	validateWorkspaceCompanyBranchForm,
} from "@/app/src/validations/workspace/companies/WorkspaceCompanyBranchValidation";

export function useWorkspaceCompanyBranchesPage() {
	const queryClient = useQueryClient();
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const accessToken = storedAccessToken ?? GetAccessToken();
	const { company, companyBranches: cachedBranches, isLoading } =
		useWorkspaceCompanyContext();
	const [drawerMode, setDrawerMode] =
		useState<WorkspaceCompanyBranchDrawerMode | null>(null);
	const [selectedBranch, setSelectedBranch] =
		useState<WorkspaceCompanyBranchRecord | null>(null);
	const [pendingInactiveBranch, setPendingInactiveBranch] =
		useState<WorkspaceCompanyBranchRecord | null>(null);
	const [branchErrors, setBranchErrors] =
		useState<WorkspaceCompanyBranchFormErrors>({});
	const [branchValues, setBranchValues] =
		useState<WorkspaceCompanyBranchFormValues | null>(null);
	const companyId = company?.id ?? "";
	const companyBranchesQuery = useQuery({
		enabled: Boolean(companyId && accessToken),
		queryKey: WorkspaceCompanyQueryKeys.companyBranches(companyId),
		queryFn: async () => getWorkspaceCompanyUnits(companyId),
	});
	const branches = companyBranchesQuery.data ?? cachedBranches;
	const mainBranchOptions = useMemo(
		() => getWorkspaceCompanyMainBranchOptions(branches),
		[branches],
	);
	const headOfficeBranch = useMemo(
		() => getWorkspaceCompanyHeadOfficeBranch(branches),
		[branches],
	);
	const selectedBranchValues =
		branchValues ??
		(selectedBranch && company
			? createWorkspaceCompanyBranchFormValuesFromRecord(
					selectedBranch,
					company,
				)
			: company
				? createWorkspaceCompanyBranchFormValues(company)
				: null);
	const updateBranchMutation = useMutation({
		mutationFn: async ({
			branchId,
			payload,
		}: {
			branchId: string;
			payload: UpdateWorkspaceCompanyUnitRequest;
		}) => {
			if (!accessToken || !companyId) {
				throw new Error("Sign in again before updating this branch.");
			}

			return updateWorkspaceCompanyUnit(companyId, branchId, payload);
		},
		onSuccess: (branch) => {
			updateBranchQueryCache(branch);
			setSelectedBranch(branch);
			setBranchValues(
				company
					? createWorkspaceCompanyBranchFormValuesFromRecord(
							branch,
							company,
						)
					: null,
			);
			setDrawerMode(null);
			setBranchErrors({});
			toast.success("Branch updated.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update branch. Please try again.",
			);
		},
	});
	const deactivateBranchMutation = useMutation({
		mutationFn: async (branchId: string) => {
			if (!accessToken || !companyId) {
				throw new Error("Sign in again before deactivating this branch.");
			}

			return deactivateWorkspaceCompanyUnit(companyId, branchId);
		},
		onSuccess: (branch) => {
			updateBranchQueryCache(branch);
			setPendingInactiveBranch(null);
			toast.success("Branch deactivated.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not deactivate branch. Please try again.",
			);
		},
	});

	function updateBranchQueryCache(branch: WorkspaceCompanyBranchRecord) {
		queryClient.setQueryData<WorkspaceCompanyBranchRecord[]>(
			WorkspaceCompanyQueryKeys.companyBranches(companyId),
			(current = []) =>
				current.map((record) =>
					record.id === branch.id ? branch : record,
				),
		);
		void queryClient.invalidateQueries({
			queryKey: WorkspaceCompanyQueryKeys.branches(),
		});
		void queryClient.invalidateQueries({
			queryKey: WorkspaceCompanyQueryKeys.company(companyId),
		});
		void queryClient.invalidateQueries({
			queryKey: WorkspaceCompanyQueryKeys.companies(),
		});
	}

	function openBranchDrawer(
		mode: WorkspaceCompanyBranchDrawerMode,
		branch: WorkspaceCompanyBranchRecord,
	) {
		setSelectedBranch(branch);
		setDrawerMode(mode);
		setBranchErrors({});
		setBranchValues(
			company
				? createWorkspaceCompanyBranchFormValuesFromRecord(branch, company)
				: null,
		);
	}

	function closeBranchDrawer() {
		if (updateBranchMutation.isPending) {
			return;
		}

		setDrawerMode(null);
		setSelectedBranch(null);
		setBranchErrors({});
		setBranchValues(null);
	}

	function updateBranchField(
		field: keyof WorkspaceCompanyBranchFormValues,
		value: string | boolean,
	) {
		setBranchValues((current) => {
			if (!current) {
				return current;
			}

			return {
				...current,
				[field]: value,
				...(field === "classification" && value === "satellite"
					? {
							isMain: false,
							linkedMainBranchId: headOfficeBranch?.id ?? "",
							tin: "",
						}
					: {}),
				...(field === "classification" && value === "branch"
					? {
							linkedMainBranchId: "",
							tin: current.tin,
						}
					: {}),
			};
		});
		setBranchErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleBranchInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const value =
			event.target.name === "tin"
				? FormatTinNumber(event.target.value)
				: event.target.name === "contactNo"
					? FormatPhilippineContactNumber(event.target.value)
					: event.target.value;

		updateBranchField(
			event.target.name as keyof WorkspaceCompanyBranchFormValues,
			value,
		);
	}

	function handleUpdateBranch(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!selectedBranchValues || !selectedBranch) {
			return;
		}

		const nextErrors =
			validateWorkspaceCompanyBranchForm(selectedBranchValues);

		if (Object.keys(nextErrors).length > 0) {
			setBranchErrors(nextErrors);
			return;
		}

		updateBranchMutation.mutate({
			branchId: selectedBranch.id,
			payload: createWorkspaceCompanyUnitPayload(
				selectedBranchValues,
				headOfficeBranch,
			),
		});
	}

	function confirmDeactivateBranch() {
		if (!pendingInactiveBranch) {
			return;
		}

		deactivateBranchMutation.mutate(pendingInactiveBranch.id);
	}

	return {
		branchErrors,
		branches,
		closeBranchDrawer,
		company,
		confirmDeactivateBranch,
		drawerMode,
		handleBranchInputChange,
		handleUpdateBranch,
		isDeactivatingBranch: deactivateBranchMutation.isPending,
		isLoading: isLoading || companyBranchesQuery.isLoading,
		isUpdatingBranch: updateBranchMutation.isPending,
		mainBranchOptions,
		openBranchDrawer,
		pendingInactiveBranch,
		selectedBranch,
		selectedBranchValues,
		setPendingInactiveBranch,
		updateBranchField,
	};
}
