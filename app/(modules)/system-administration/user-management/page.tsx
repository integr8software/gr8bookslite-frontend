import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";

const PageTitle = "User Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserManagementPage() {
  redirect(UserListHref);
}


