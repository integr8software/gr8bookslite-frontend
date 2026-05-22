"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  InitialUserRoles,
  InitialUsers,
  type UserManagementRecord,
  type UserRoleRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { UserManagementQueryKeys } from "@/app/src/services/modules/system-administration/user-management/UserManagementQueryKeys";

type UserManagementState = {
  users: UserManagementRecord[];
  userRoles: UserRoleRecord[];
  addUser: (user: UserManagementRecord) => void;
  updateUser: (user: UserManagementRecord) => void;
  deleteUser: (userId: string) => void;
  addUserRole: (userRole: UserRoleRecord) => void;
  updateUserRole: (userRole: UserRoleRecord) => void;
  deleteUserRole: (userRoleId: string) => void;
  isLoading: boolean;
  isMutating: boolean;
};

export function useUserManagementStore<TSelected = UserManagementState>(
  selector?: (state: UserManagementState) => TSelected,
) {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: UserManagementQueryKeys.users(),
    queryFn: async () => InitialUsers,
    initialData: InitialUsers,
  });
  const userRolesQuery = useQuery({
    queryKey: UserManagementQueryKeys.userRoles(),
    queryFn: async () => InitialUserRoles,
    initialData: InitialUserRoles,
  });

  function setUsers(
    updater: (users: UserManagementRecord[]) => UserManagementRecord[],
  ) {
    queryClient.setQueryData<UserManagementRecord[]>(
      UserManagementQueryKeys.users(),
      (current = InitialUsers) => updater(current),
    );
  }

  function setUserRoles(
    updater: (userRoles: UserRoleRecord[]) => UserRoleRecord[],
  ) {
    queryClient.setQueryData<UserRoleRecord[]>(
      UserManagementQueryKeys.userRoles(),
      (current = InitialUserRoles) => updater(current),
    );
  }

  const addUserMutation = useMutation({
    mutationFn: async (user: UserManagementRecord) => user,
    onSuccess: (user) => {
      setUsers((users) => [...users, user]);
      toast.success("User created.");
    },
    onError: () => {
      toast.error("Could not create user. Please try again.");
    },
  });
  const updateUserMutation = useMutation({
    mutationFn: async (user: UserManagementRecord) => user,
    onSuccess: (user) => {
      setUsers((users) =>
        users.map((current) => (current.id === user.id ? user : current)),
      );
      toast.success("User updated.");
    },
    onError: () => {
      toast.error("Could not update user. Please try again.");
    },
  });
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => userId,
    onSuccess: (userId) => {
      setUsers((users) =>
        users.map((user) =>
          user.id === userId ? { ...user, status: "Inactive" } : user,
        ),
      );
      toast.success("User set as inactive.");
    },
    onError: () => {
      toast.error("Could not update user status. Please try again.");
    },
  });
  const addUserRoleMutation = useMutation({
    mutationFn: async (userRole: UserRoleRecord) => userRole,
    onSuccess: (userRole) => {
      setUserRoles((userRoles) => [...userRoles, userRole]);
      toast.success("User role created.");
    },
    onError: () => {
      toast.error("Could not create user role. Please try again.");
    },
  });
  const updateUserRoleMutation = useMutation({
    mutationFn: async (userRole: UserRoleRecord) => userRole,
    onSuccess: (userRole) => {
      setUserRoles((userRoles) =>
        userRoles.map((current) =>
          current.id === userRole.id ? userRole : current,
        ),
      );
      toast.success("User role updated.");
    },
    onError: () => {
      toast.error("Could not update user role. Please try again.");
    },
  });
  const deleteUserRoleMutation = useMutation({
    mutationFn: async (userRoleId: string) => userRoleId,
    onSuccess: (userRoleId) => {
      setUserRoles((userRoles) =>
        userRoles.map((userRole) =>
          userRole.id === userRoleId
            ? { ...userRole, status: "Inactive" }
            : userRole,
        ),
      );
      toast.success("User role set as inactive.");
    },
    onError: () => {
      toast.error("Could not update user role status. Please try again.");
    },
  });
  const state = useMemo<UserManagementState>(
    () => ({
      users: usersQuery.data,
      userRoles: userRolesQuery.data,
      addUser: (user) => addUserMutation.mutate(user),
      updateUser: (user) => updateUserMutation.mutate(user),
      deleteUser: (userId) => deleteUserMutation.mutate(userId),
      addUserRole: (userRole) => addUserRoleMutation.mutate(userRole),
      updateUserRole: (userRole) => updateUserRoleMutation.mutate(userRole),
      deleteUserRole: (userRoleId) =>
        deleteUserRoleMutation.mutate(userRoleId),
      isLoading: usersQuery.isLoading || userRolesQuery.isLoading,
      isMutating:
        addUserMutation.isPending ||
        updateUserMutation.isPending ||
        deleteUserMutation.isPending ||
        addUserRoleMutation.isPending ||
        updateUserRoleMutation.isPending ||
        deleteUserRoleMutation.isPending,
    }),
    [
      addUserMutation,
      addUserRoleMutation,
      deleteUserMutation,
      deleteUserRoleMutation,
      updateUserMutation,
      updateUserRoleMutation,
      userRolesQuery.data,
      userRolesQuery.isLoading,
      usersQuery.data,
      usersQuery.isLoading,
    ],
  );

  return selector ? selector(state) : (state as TSelected);
}
