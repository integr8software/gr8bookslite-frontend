"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  EmptyWorkspaceCompanyBranches,
  EmptyWorkspaceCompanies,
  EmptyWorkspaceCompanyUsers,
  type WorkspaceCompanyManagementStoreState,
} from "@/app/src/hooks/workspace/companies/WorkspaceCompanyManagementTypes";
import { BillingQueryKeys } from "@/app/src/services/billing/BillingQueryKeys";
import {
  CreateWorkspaceCompany,
  DeactivateWorkspaceCompany,
  GetWorkspaceCompanies,
  UpdateWorkspaceCompany,
} from "@/app/src/services/workspace/companies/WorkspaceCompanyApi";
import { WorkspaceCompanyQueryKeys } from "@/app/src/services/workspace/companies/WorkspaceCompanyQueryKeys";
import {
  CancelWorkspaceUserInvitation,
  CreateWorkspaceUser,
  GetWorkspaceUsers,
  ResendWorkspaceUserInvitation,
  UpdateWorkspaceUser,
} from "@/app/src/services/workspace/users/WorkspaceUserApi";
import { WorkspaceUserQueryKeys } from "@/app/src/services/workspace/users/WorkspaceUserQueryKeys";
import type {
  WorkspaceCompanyFormValues,
  WorkspaceCompanyRecord,
  WorkspaceCompanyUserFormValues,
  WorkspaceCompanyUserRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export function useWorkspaceCompanyManagementStore<
  TSelected = WorkspaceCompanyManagementStoreState,
>(
  selector?: (state: WorkspaceCompanyManagementStoreState) => TSelected,
  options: { includeUsers?: boolean } = {},
) {
  const queryClient = useQueryClient();
  const storedAccessToken = useAppStore((state) => state.accessToken);
  const accessToken = storedAccessToken;
  const includeUsers = options.includeUsers ?? true;
  const companiesQuery = useQuery({
    queryKey: WorkspaceCompanyQueryKeys.companies(),
    queryFn: async () => GetWorkspaceCompanies(),
  });
  const usersQuery = useQuery({
    queryKey: WorkspaceUserQueryKeys.users(),
    queryFn: async () => GetWorkspaceUsers(),
    enabled: includeUsers,
  });
  const branches = useMemo(
    () =>
      (companiesQuery.data ?? EmptyWorkspaceCompanies).flatMap(
        (company) => company.branches ?? EmptyWorkspaceCompanyBranches,
      ),
    [companiesQuery.data],
  );

  function setCompanies(
    updater: (companies: WorkspaceCompanyRecord[]) => WorkspaceCompanyRecord[],
  ) {
    queryClient.setQueryData<WorkspaceCompanyRecord[]>(
      WorkspaceCompanyQueryKeys.companies(),
      (current = EmptyWorkspaceCompanies) => updater(current),
    );
  }

  const addCompanyMutation = useMutation({
    mutationFn: async (values: WorkspaceCompanyFormValues) =>
      CreateWorkspaceCompany(values),
    onSuccess: (company) => {
      setCompanies((companies) => [company, ...companies]);
      void queryClient.invalidateQueries({
        queryKey: WorkspaceCompanyQueryKeys.companies(),
      });
      void queryClient.invalidateQueries({
        queryKey: BillingQueryKeys.paymentMethods(),
      });
      toast.success("Company created.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create company. Please try again.",
      );
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({
      companyId,
      values,
    }: {
      companyId: string;
      values: WorkspaceCompanyFormValues;
    }) => {
      if (!accessToken) {
        throw new Error("Sign in again before updating this company.");
      }

      return UpdateWorkspaceCompany(companyId, values);
    },
    onSuccess: (company) => {
      setCompanies((companies) =>
        companies.map((current) =>
          current.id === company.id ? company : current,
        ),
      );
      queryClient.setQueryData(
        WorkspaceCompanyQueryKeys.company(company.id),
        company,
      );
      void queryClient.invalidateQueries({
        queryKey: WorkspaceCompanyQueryKeys.companies(),
      });
      toast.success("Company updated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update company. Please try again.",
      );
    },
  });

  const deactivateCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      if (!accessToken) {
        throw new Error("Sign in again before deactivating this company.");
      }

      return DeactivateWorkspaceCompany(companyId);
    },
    onSuccess: (company) => {
      setCompanies((companies) =>
        companies.map((current) =>
          current.id === company.id ? company : current,
        ),
      );
      queryClient.setQueryData(
        WorkspaceCompanyQueryKeys.company(company.id),
        company,
      );
      void queryClient.invalidateQueries({
        queryKey: WorkspaceCompanyQueryKeys.companies(),
      });
      toast.success("Company deactivated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not deactivate company. Please try again.",
      );
    },
  });

  const addCompanyUserMutation = useMutation({
    mutationFn: async (values: WorkspaceCompanyUserFormValues) =>
      CreateWorkspaceUser(values),
    onSuccess: (user) => {
      queryClient.setQueryData<WorkspaceCompanyUserRecord[]>(
        WorkspaceUserQueryKeys.users(),
        (current = EmptyWorkspaceCompanyUsers) => [user, ...current],
      );
      void queryClient.invalidateQueries({
        queryKey: WorkspaceUserQueryKeys.users(),
      });
      void queryClient.invalidateQueries({
        queryKey: WorkspaceCompanyQueryKeys.companies(),
      });
      toast.success("Workspace user created.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create workspace user. Please try again.",
      );
    },
  });

  const updateCompanyUserMutation = useMutation({
    mutationFn: async ({
      userId,
      values,
    }: {
      userId: string;
      values: WorkspaceCompanyUserFormValues;
    }) => UpdateWorkspaceUser(userId, values),
    onSuccess: (user) => {
      queryClient.setQueryData<WorkspaceCompanyUserRecord[]>(
        WorkspaceUserQueryKeys.users(),
        (current = EmptyWorkspaceCompanyUsers) =>
          current.map((record) => (record.id === user.id ? user : record)),
      );
      void queryClient.invalidateQueries({
        queryKey: WorkspaceUserQueryKeys.users(),
      });
      void queryClient.invalidateQueries({
        queryKey: WorkspaceCompanyQueryKeys.companies(),
      });
      toast.success("Workspace user updated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update workspace user. Please try again.",
      );
    },
  });

  const resendCompanyUserInvitationMutation = useMutation({
    mutationFn: async (userId: string) =>
      ResendWorkspaceUserInvitation(userId),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: WorkspaceUserQueryKeys.users(),
      });
      toast.success(response.message || "Invitation resent.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not resend the invitation. Please try again.",
      );
    },
  });

  const cancelCompanyUserInvitationMutation = useMutation({
    mutationFn: async (userId: string) =>
      CancelWorkspaceUserInvitation(userId),
    onSuccess: (response) => {
      queryClient.setQueryData<WorkspaceCompanyUserRecord[]>(
        WorkspaceUserQueryKeys.users(),
        (current = EmptyWorkspaceCompanyUsers) =>
          current.filter((record) => record.id !== String(response.id)),
      );
      void queryClient.invalidateQueries({
        queryKey: WorkspaceUserQueryKeys.users(),
      });
      void queryClient.invalidateQueries({
        queryKey: WorkspaceCompanyQueryKeys.companies(),
      });
      toast.success(response.message || "Invitation cancelled.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not cancel the invitation. Please try again.",
      );
    },
  });

  const state = useMemo<WorkspaceCompanyManagementStoreState>(
    () => ({
      addCompany: (values) => addCompanyMutation.mutateAsync(values),
      addCompanyUser: (values) => addCompanyUserMutation.mutateAsync(values),
      branches,
      cancelCompanyUserInvitation: (userId) =>
        cancelCompanyUserInvitationMutation.mutateAsync(userId),
      companies: companiesQuery.data ?? EmptyWorkspaceCompanies,
      deactivateCompany: (companyId) =>
        deactivateCompanyMutation.mutateAsync(companyId),
      deleteCompany: (companyId) =>
        deactivateCompanyMutation.mutateAsync(companyId),
      isLoading:
        companiesQuery.isLoading || (includeUsers && usersQuery.isLoading),
      isMutating:
        addCompanyMutation.isPending ||
        addCompanyUserMutation.isPending ||
        cancelCompanyUserInvitationMutation.isPending ||
        deactivateCompanyMutation.isPending ||
        resendCompanyUserInvitationMutation.isPending ||
        updateCompanyMutation.isPending ||
        updateCompanyUserMutation.isPending,
      resendCompanyUserInvitation: (userId) =>
        resendCompanyUserInvitationMutation.mutateAsync(userId),
      updateCompany: (companyId, values) =>
        updateCompanyMutation.mutateAsync({ companyId, values }),
      updateCompanyUser: (userId, values) =>
        updateCompanyUserMutation.mutateAsync({ userId, values }),
      users: includeUsers
        ? (usersQuery.data ?? EmptyWorkspaceCompanyUsers)
        : EmptyWorkspaceCompanyUsers,
    }),
    [
      addCompanyMutation,
      addCompanyUserMutation,
      branches,
      cancelCompanyUserInvitationMutation,
      companiesQuery.data,
      companiesQuery.isLoading,
      deactivateCompanyMutation,
      includeUsers,
      resendCompanyUserInvitationMutation,
      updateCompanyMutation,
      updateCompanyUserMutation,
      usersQuery.data,
      usersQuery.isLoading,
    ],
  );

  return selector ? selector(state) : (state as TSelected);
}
