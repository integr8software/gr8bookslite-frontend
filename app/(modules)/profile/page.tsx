import type { Metadata } from "next";
import { AccountProfilePage } from "@/app/src/ui/shared/account/AccountProfilePage";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
  title: `Profile | ${AppName}`,
  description: `Manage your profile details in ${AppName}.`,
};

export default function Page() {
  return <AccountProfilePage />;
}
