import type { Metadata } from "next";
import { AccountProfilePage } from "@/app/src/ui/shared/account/AccountProfilePage";

export const metadata: Metadata = {
  title: "Profile | Gr8Books Lite",
  description: "Manage your profile details in Gr8Books Lite.",
};

export default function Page() {
  return <AccountProfilePage />;
}
