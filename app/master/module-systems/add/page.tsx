import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterModuleSystemFormPage } from "@/app/src/ui/master/module-systems/MasterModuleSystemPage";

export const metadata: Metadata = {
	title: `Add System | ${AppName}`,
	description: `Add master module system for ${AppName}.`,
};

export default function AddModuleSystemPage() {
	return <MasterModuleSystemFormPage mode="add" />;
}
