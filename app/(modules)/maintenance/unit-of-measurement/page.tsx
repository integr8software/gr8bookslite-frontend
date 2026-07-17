import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { UnitOfMeasurementListPage } from "@/app/src/ui/modules/maintenance/unit-of-measurement/UnitOfMeasurementListPage";

const PageTitle = "Unit of Measurement";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function UnitOfMeasurementPage() {
	return <UnitOfMeasurementListPage />;
}
