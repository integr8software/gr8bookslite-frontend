import type { Metadata } from "next";
import { AccountSettingsPage } from "@/app/src/ui/shared/account/AccountSettingsPage";

export const metadata: Metadata = {
  title: "Settings | Gr8Books Lite",
  description: "Manage your account settings in Gr8Books Lite.",
};

export default function Page() {
  return <AccountSettingsPage scope="account" />;
}
