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
	createWorkspaceCompanyUnitPayload,
	getWorkspaceCompanyHeadOfficeBranch,
	getWorkspaceCompanyMainBranchOptions,
} from "@/app/src/data/workspace/companies/WorkspaceCompanyBranchData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	createWorkspaceCompanyUnit,
	getWorkspaceCompanyUnits,
	type CreateWorkspaceCompanyUnitRequest,
} from "@/app/src/services/workspace/companies/WorkspaceCompanyUnitApi";
import { WorkspaceCompanyQueryKeys } from "@/app/src/services/workspace/companies/WorkspaceCompanyQueryKeys";
import type {
	WorkspaceCompanyBranchFormErrors,
	WorkspaceCompanyBranchFormValues,
	WorkspaceCompanyBranchManagementPanelProps,
} from "@/app/src/types/workspace/WorkspaceCompanyBranchTypes";
import type {
	WorkspaceCompanyBranchRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
	validateWorkspaceCompanyBranchForm,
} from "@/app/src/validations/workspace/companies/WorkspaceCompanyBranchValidation";

export function useWorkspaceCompanyBranchManagementPanel({
	cachedBranches,
	company,
}: WorkspaceCompanyBranchManagementPanelProps) {
	const queryClient = useQueryClient();
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const accessToken = storedAccessToken ?? GetAccessToken();
	const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
	const [branchErrors, setBranchErrors] =
		useState<WorkspaceCompanyBranchFormErrors>({});
	const [branchValues, setBranchValues] =
		useState<WorkspaceCompanyBranchFormValues>(() =>
			createWorkspaceCompanyBranchFormValues(company),
		);
	const branchInitialValues = useMemo(
		() => createWorkspaceCompanyBranchFormValues(company),
		[company],
	);
	const companyBranchesQuery = useQuery({
		enabled: Boolean(company.id && accessToken),
		queryKey: WorkspaceCompanyQueryKeys.companyBranches(company.id),
		queryFn: async () => getWorkspaceCompanyUnits(accessToken, company.id),
	});
	const branches = companyBranchesQuery.data ?? cachedBranches;
	const branchCount = companyBranchesQuery.isSuccess
		? branches.length
		: (company.totalBranches ?? cachedBranches.length);
	const mainBranchOptions = useMemo(
		() => getWorkspaceCompanyMainBranchOptions(branches),
		[branches],
	);
	const headOfficeBranch = useMemo(
		() => getWorkspaceCompanyHeadOfficeBranch(branches),
		[branches],
	);
	const createBranchMutation = useMutation({
		mutationFn: async (payload: CreateWorkspaceCompanyUnitRequest) => {
			if (!accessToken) {
				throw new Error("Sign in again before adding a branch.");
			}

			return createWorkspaceCompanyUnit(accessToken, company.id, payload);
		},
		onSuccess: (branch) => {
			queryClient.setQueryData<WorkspaceCompanyBranchRecord[]>(
				WorkspaceCompanyQueryKeys.companyBranches(company.id),
				(current = []) => [...current, branch],
			);
			void queryClient.invalidateQueries({
				queryKey: WorkspaceCompanyQueryKeys.branches(),
			});
			void queryClient.invalidateQueries({
				queryKey: WorkspaceCompanyQueryKeys.company(company.id),
			});
			void queryClient.invalidateQueries({
				queryKey: WorkspaceCompanyQueryKeys.companies(),
			});
			setBranchValues(branchInitialValues);
			setBranchErrors({});
			setIsAddBranchOpen(false);
			toast.success("Branch created.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create branch. Please try again.",
			);
		},
	});

	function openAddBranchDrawer() {
		setBranchValues(branchInitialValues);
		setBranchErrors({});
		setIsAddBranchOpen(true);
	}

	function closeAddBranchDrawer() {
		if (createBranchMutation.isPending) {
			return;
		}

		setIsAddBranchOpen(false);
		setBranchValues(branchInitialValues);
		setBranchErrors({});
	}

	function updateBranchField(
		field: keyof WorkspaceCompanyBranchFormValues,
		value: string | boolean,
	) {
		setBranchValues((current) => ({
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
		}));
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

	function handleCreateBranch(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateWorkspaceCompanyBranchForm(branchValues);

		if (Object.keys(nextErrors).length > 0) {
			setBranchErrors(nextErrors);
			return;
		}

		createBranchMutation.mutate(
			createWorkspaceCompanyUnitPayload(branchValues, headOfficeBranch),
		);
	}

	return {
		branchCount,
		branchErrors,
		branches,
		branchValues,
		closeAddBranchDrawer,
		handleBranchInputChange,
		handleCreateBranch,
		isAddBranchOpen,
		isCreatingBranch: createBranchMutation.isPending,
		isLoadingBranches: companyBranchesQuery.isLoading,
		mainBranchOptions,
		openAddBranchDrawer,
		updateBranchField,
	};
}
