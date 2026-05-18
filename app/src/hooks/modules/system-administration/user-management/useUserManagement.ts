"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  InitialUserGroups,
  InitialUserTypes,
  InitialUsers,
  type UserGroupRecord,
  type UserManagementRecord,
  type UserTypeRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { UserManagementQueryKeys } from "@/app/src/services/modules/system-administration/user-management/UserManagementQueryKeys";

type UserManagementState = {
  users: UserManagementRecord[];
  userTypes: UserTypeRecord[];
  userGroups: UserGroupRecord[];
  addUser: (user: UserManagementRecord) => void;
  updateUser: (user: UserManagementRecord) => void;
  deleteUser: (userId: string) => void;
  addUserType: (userType: UserTypeRecord) => void;
  updateUserType: (userType: UserTypeRecord) => void;
  deleteUserType: (userTypeId: string) => void;
  addUserGroup: (userGroup: UserGroupRecord) => void;
  updateUserGroup: (userGroup: UserGroupRecord) => void;
  deleteUserGroup: (userGroupId: string) => void;
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
  const userTypesQuery = useQuery({
    queryKey: UserManagementQueryKeys.userTypes(),
    queryFn: async () => InitialUserTypes,
    initialData: InitialUserTypes,
  });
  const userGroupsQuery = useQuery({
    queryKey: UserManagementQueryKeys.userGroups(),
    queryFn: async () => InitialUserGroups,
    initialData: InitialUserGroups,
  });

  function setUsers(updater: (users: UserManagementRecord[]) => UserManagementRecord[]) {
    queryClient.setQueryData<UserManagementRecord[]>(
      UserManagementQueryKeys.users(),
      (current = InitialUsers) => updater(current),
    );
  }

  function setUserTypes(updater: (userTypes: UserTypeRecord[]) => UserTypeRecord[]) {
    queryClient.setQueryData<UserTypeRecord[]>(
      UserManagementQueryKeys.userTypes(),
      (current = InitialUserTypes) => updater(current),
    );
  }

  function setUserGroups(updater: (userGroups: UserGroupRecord[]) => UserGroupRecord[]) {
    queryClient.setQueryData<UserGroupRecord[]>(
      UserManagementQueryKeys.userGroups(),
      (current = InitialUserGroups) => updater(current),
    );
  }

  const addUserMutation = useMutation({
    mutationFn: async (user: UserManagementRecord) => user,
    onSuccess: (user) => setUsers((users) => [...users, user]),
  });
  const updateUserMutation = useMutation({
    mutationFn: async (user: UserManagementRecord) => user,
    onSuccess: (user) =>
      setUsers((users) =>
        users.map((current) => (current.id === user.id ? user : current)),
      ),
  });
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => userId,
    onSuccess: (userId) =>
      setUsers((users) => users.filter((user) => user.id !== userId)),
  });
  const addUserTypeMutation = useMutation({
    mutationFn: async (userType: UserTypeRecord) => userType,
    onSuccess: (userType) => setUserTypes((userTypes) => [...userTypes, userType]),
  });
  const updateUserTypeMutation = useMutation({
    mutationFn: async (userType: UserTypeRecord) => userType,
    onSuccess: (userType) =>
      setUserTypes((userTypes) =>
        userTypes.map((current) =>
          current.id === userType.id ? userType : current,
        ),
      ),
  });
  const deleteUserTypeMutation = useMutation({
    mutationFn: async (userTypeId: string) => userTypeId,
    onSuccess: (userTypeId) =>
      setUserTypes((userTypes) =>
        userTypes.filter((userType) => userType.id !== userTypeId),
      ),
  });
  const addUserGroupMutation = useMutation({
    mutationFn: async (userGroup: UserGroupRecord) => userGroup,
    onSuccess: (userGroup) =>
      setUserGroups((userGroups) => [...userGroups, userGroup]),
  });
  const updateUserGroupMutation = useMutation({
    mutationFn: async (userGroup: UserGroupRecord) => userGroup,
    onSuccess: (userGroup) =>
      setUserGroups((userGroups) =>
        userGroups.map((current) =>
          current.id === userGroup.id ? userGroup : current,
        ),
      ),
  });
  const deleteUserGroupMutation = useMutation({
    mutationFn: async (userGroupId: string) => userGroupId,
    onSuccess: (userGroupId) =>
      setUserGroups((userGroups) =>
        userGroups.filter((userGroup) => userGroup.id !== userGroupId),
      ),
  });

  const state = useMemo<UserManagementState>(
    () => ({
      users: usersQuery.data,
      userTypes: userTypesQuery.data,
      userGroups: userGroupsQuery.data,
      addUser: (user) => addUserMutation.mutate(user),
      updateUser: (user) => updateUserMutation.mutate(user),
      deleteUser: (userId) => deleteUserMutation.mutate(userId),
      addUserType: (userType) => addUserTypeMutation.mutate(userType),
      updateUserType: (userType) => updateUserTypeMutation.mutate(userType),
      deleteUserType: (userTypeId) => deleteUserTypeMutation.mutate(userTypeId),
      addUserGroup: (userGroup) => addUserGroupMutation.mutate(userGroup),
      updateUserGroup: (userGroup) => updateUserGroupMutation.mutate(userGroup),
      deleteUserGroup: (userGroupId) =>
        deleteUserGroupMutation.mutate(userGroupId),
      isLoading:
        usersQuery.isLoading ||
        userTypesQuery.isLoading ||
        userGroupsQuery.isLoading,
      isMutating:
        addUserMutation.isPending ||
        updateUserMutation.isPending ||
        deleteUserMutation.isPending ||
        addUserTypeMutation.isPending ||
        updateUserTypeMutation.isPending ||
        deleteUserTypeMutation.isPending ||
        addUserGroupMutation.isPending ||
        updateUserGroupMutation.isPending ||
        deleteUserGroupMutation.isPending,
    }),
    [
      addUserGroupMutation,
      addUserMutation,
      addUserTypeMutation,
      deleteUserGroupMutation,
      deleteUserMutation,
      deleteUserTypeMutation,
      updateUserGroupMutation,
      updateUserMutation,
      updateUserTypeMutation,
      userGroupsQuery.data,
      userGroupsQuery.isLoading,
      userTypesQuery.data,
      userTypesQuery.isLoading,
      usersQuery.data,
      usersQuery.isLoading,
    ],
  );

  return selector ? selector(state) : (state as TSelected);
}
