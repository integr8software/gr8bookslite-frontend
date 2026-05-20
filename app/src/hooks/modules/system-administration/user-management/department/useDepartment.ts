"use client";

import type { DepartmentRecord } from "@/app/src/data/modules/system-administration/user-management/department/DepartmentData";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";

type DepartmentState = {
  departments: DepartmentRecord[];
  addDepartment: (department: DepartmentRecord) => void;
  updateDepartment: (department: DepartmentRecord) => void;
  deleteDepartment: (departmentId: string) => void;
  isLoading: boolean;
  isMutating: boolean;
};

export function useDepartmentStore<TSelected = DepartmentState>(
  selector?: (state: DepartmentState) => TSelected,
) {
  const state = useUserManagementStore<DepartmentState>((userManagement) => ({
    departments: userManagement.departments,
    addDepartment: userManagement.addDepartment,
    updateDepartment: userManagement.updateDepartment,
    deleteDepartment: userManagement.deleteDepartment,
    isLoading: userManagement.isLoading,
    isMutating: userManagement.isMutating,
  }));

  return selector ? selector(state) : (state as TSelected);
}
