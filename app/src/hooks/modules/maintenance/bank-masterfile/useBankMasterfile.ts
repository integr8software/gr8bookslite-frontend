"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import {
	createBank,
	fetchBanks,
	fetchNextBankAccountCode,
	importBanks,
	updateBank,
	updateBankStatus,
	type BankMasterfilePermissions,
	type BankMasterfileStatistics,
} from "@/app/src/services/modules/maintenance/bank-masterfile/BankMasterfileApi";
import { BankMasterfileQueryKeys } from "@/app/src/services/modules/maintenance/bank-masterfile/BankMasterfileQueryKeys";
import type {
	BankMasterfile,
	BankMasterfileFormValues,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

type BankMasterfileStoreState = {
	banks: BankMasterfile[];
	addBank: (bank: BankMasterfileFormValues) => Promise<BankMasterfile>;
	addBanks: (banks: BankMasterfileFormValues[]) => Promise<BankMasterfile[]>;
	updateBank: (bank: BankMasterfile) => Promise<BankMasterfile>;
	updateBankStatus: (bank: BankMasterfile) => Promise<BankMasterfile>;
	permissions: BankMasterfilePermissions;
	statistics: BankMasterfileStatistics;
	nextAccountCode: string;
	isNextAccountCodeLoading: boolean;
	refreshBanks: () => void;
	refreshNextAccountCode: () => void;
	isLoading: boolean;
	isRefreshing: boolean;
	isMutating: boolean;
};

const EmptyBankPermissions: BankMasterfilePermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canExport: false,
	canImport: false,
};

const ReservedRoleBankPermissions: BankMasterfilePermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canExport: true,
	canImport: true,
};

const EmptyBankStatistics: BankMasterfileStatistics = {
	totalBanks: 0,
	activeBanks: 0,
	inactiveBanks: 0,
	defaultBanks: 0,
};

export function useBankMasterfileStore<TSelected = BankMasterfileStoreState>(
	selector?: (state: BankMasterfileStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const banksQuery = useQuery({
		queryKey: BankMasterfileQueryKeys.banks(),
		queryFn: fetchBanks,
	});
	const nextAccountCodeQuery = useQuery({
		queryKey: BankMasterfileQueryKeys.nextAccountCode(),
		queryFn: fetchNextBankAccountCode,
		retry: false,
	});
	const refreshBanks = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: BankMasterfileQueryKeys.banks(),
		});
	}, [queryClient]);
	const refreshNextAccountCode = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: BankMasterfileQueryKeys.nextAccountCode(),
		});
	}, [queryClient]);
	const addBankMutation = useMutation({
		mutationFn: createBank,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: BankMasterfileQueryKeys.all(),
			});
			toast.success("Bank account created successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create bank account. Please try again.",
			);
		},
	});
	const addBanksMutation = useMutation({
		mutationFn: importBanks,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: BankMasterfileQueryKeys.all(),
			});
			toast.success("Bank accounts imported successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not import bank accounts. Please try again.",
			);
		},
	});
	const updateBankMutation = useMutation({
		mutationFn: updateBank,
		onSuccess: (_, updatedBank) => {
			void queryClient.invalidateQueries({
				queryKey: BankMasterfileQueryKeys.all(),
			});
			toast.success(
				updatedBank.status === "Active"
					? "Bank account updated successfully."
					: "Bank account updated successfully.",
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update bank account. Please try again.",
			);
		},
	});
	const updateBankStatusMutation = useMutation({
		mutationFn: updateBankStatus,
		onSuccess: (_, updatedBank) => {
			void queryClient.invalidateQueries({
				queryKey: BankMasterfileQueryKeys.all(),
			});
			toast.success(
				`Bank account ${updatedBank.status === "Active" ? "activated" : "inactivated"} successfully.`,
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update bank account status. Please try again.",
			);
		},
	});
	const state = useMemo<BankMasterfileStoreState>(() => {
		const effectiveRole = ResolveAuthProfileEffectiveRole(authProfileQuery.data);
		const hasReservedRoleAccess =
			effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

		return {
			banks: banksQuery.data?.banks ?? [],
			permissions: hasReservedRoleAccess
				? ReservedRoleBankPermissions
				: (banksQuery.data?.permissions ?? EmptyBankPermissions),
			statistics: banksQuery.data?.statistics ?? EmptyBankStatistics,
			nextAccountCode: nextAccountCodeQuery.data?.accountCode ?? "",
			isNextAccountCodeLoading: nextAccountCodeQuery.isFetching,
			addBank: (bank) => addBankMutation.mutateAsync(bank),
			addBanks: (banks) => addBanksMutation.mutateAsync(banks),
			updateBank: (bank) => updateBankMutation.mutateAsync(bank),
			updateBankStatus: (bank) => updateBankStatusMutation.mutateAsync(bank),
			refreshBanks,
			refreshNextAccountCode,
			isLoading: banksQuery.isLoading,
			isRefreshing: banksQuery.isFetching && !banksQuery.isLoading,
			isMutating:
				addBankMutation.isPending ||
				addBanksMutation.isPending ||
				updateBankMutation.isPending ||
				updateBankStatusMutation.isPending,
		};
	}, [
		addBankMutation,
		addBanksMutation,
		authProfileQuery.data,
		banksQuery.data,
		banksQuery.isFetching,
		banksQuery.isLoading,
		nextAccountCodeQuery.data,
		nextAccountCodeQuery.isFetching,
		refreshBanks,
		refreshNextAccountCode,
		updateBankMutation,
		updateBankStatusMutation,
	]);

	return selector ? selector(state) : (state as TSelected);
}