"use client";

import type { UserRoleRecord } from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleData";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";

type UserRoleState = {
  userRoles: UserRoleRecord[];
  addUserRole: (userRole: UserRoleRecord) => void;
  updateUserRole: (userRole: UserRoleRecord) => void;
  deleteUserRole: (userRoleId: string) => void;
  isLoading: boolean;
  isMutating: boolean;
};

export function useUserRoleStore<TSelected = UserRoleState>(
  selector?: (state: UserRoleState) => TSelected,
) {
  const state = useUserManagementStore<UserRoleState>((userManagement) => ({
    userRoles: userManagement.userRoles,
    addUserRole: userManagement.addUserRole,
    updateUserRole: userManagement.updateUserRole,
    deleteUserRole: userManagement.deleteUserRole,
    isLoading: userManagement.isLoading,
    isMutating: userManagement.isMutating,
  }));

  return selector ? selector(state) : (state as TSelected);
}
