"use client";

import { ShieldCheck } from "lucide-react";
import { UserTypeHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import { UserTypeHeader } from "@/app/src/ui/modules/system-administration/user-management/user-type/UserTypeHeader";
import { UserTypeList } from "@/app/src/ui/modules/system-administration/user-management/user-type/UserTypeList";

export function UserTypePage() {
  const userTypes = useUserManagementStore((state) => state.userTypes);
  const deleteUserType = useUserManagementStore((state) => state.deleteUserType);

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete ${name}?`)) return;
    deleteUserType(id);
  }

  return (
    <section className="grid gap-5">
      <UserTypeHeader
        addHref={`${UserTypeHref}/add`}
        description="Maintain access role templates for users."
        title="User Types"
      />
      <UserTypeList
        baseHref={UserTypeHref}
        icon={ShieldCheck}
        items={userTypes}
        onDelete={handleDelete}
      />
    </section>
  );
}
