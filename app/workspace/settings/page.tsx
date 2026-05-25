import type { Metadata } from "next";
import { AccountSettingsPage } from "@/app/src/ui/shared/account/AccountSettingsPage";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

export const metadata: Metadata = {
  title: `Settings | ${AppName}`,
  description: `Manage workspace settings in ${AppName}.`,
};

export default function SettingsPage() {
  return <AccountSettingsPage scope="workspace" />;
}
