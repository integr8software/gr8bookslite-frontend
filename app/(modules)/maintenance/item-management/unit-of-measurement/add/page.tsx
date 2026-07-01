import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { UnitOfMeasurementActionPage } from "@/app/src/ui/modules/maintenance/item-management/unit-of-measurement/UnitOfMeasurementPage";

const PageTitle = "Add Unit of Measurement";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function UnitOfMeasurementAddPage() {
	return <UnitOfMeasurementActionPage />;
}
