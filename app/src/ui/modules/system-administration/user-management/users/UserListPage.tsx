"use client";

import { useSearchParams } from "next/navigation";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import { UserListHeader } from "@/app/src/ui/modules/system-administration/user-management/users/UserListHeader";
import { UserListTable } from "@/app/src/ui/modules/system-administration/user-management/users/UserListTable";
import { UserListSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/users/UserListSpotlightTutorial";

const BranchUsersNameParam = "branchName";
const CompanyUsersNameParam = "companyName";

export function UserListPage() {
  const searchParams = useSearchParams();
  const users = useUserManagementStore((state) => state.users);
  const userRoles = useUserManagementStore((state) => state.userRoles);
  const updateUser = useUserManagementStore((state) => state.updateUser);
  const branchName = searchParams.get(BranchUsersNameParam);
  const companyName = searchParams.get(CompanyUsersNameParam);
  const description =
    branchName && companyName
      ? `Review users and assign roles for ${branchName} in ${companyName}.`
      : "Review users and assign the right role for each account.";

  return (
    <section className="grid gap-5">
      <UserListSpotlightTutorial />
      <UserListHeader
        description={description}
        title="Users"
      />
      <UserListTable
        users={users}
        userRoles={userRoles}
        onRoleChange={(user, userRoleId) =>
          updateUser({
            ...user,
            userRoleId,
          })
        }
      />
    </section>
  );
}
