import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberManagementListPage } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementListPage";

export const metadata: Metadata = {
  title: `Subscriber Management | ${AppName}`,
  description: `Master subscriber management and billing review for ${AppName}.`,
};

export default function MasterSubscriberManagementPage() {
  return <MasterSubscriberManagementListPage />;
}
