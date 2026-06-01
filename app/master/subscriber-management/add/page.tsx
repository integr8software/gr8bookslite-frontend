import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberManagementFormPage } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementFormPage";

export const metadata: Metadata = {
	title: `Add Subscriber | ${AppName}`,
	description: `Create a master subscriber record for ${AppName}.`,
};

export default function Page() {
	return <MasterSubscriberManagementFormPage mode="add" />;
}
