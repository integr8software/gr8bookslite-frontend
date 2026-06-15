import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { UnitOfMeasurementListPage } from "@/app/src/ui/modules/maintenance/item-management/unit-of-measurement/UnitOfMeasurementPage";

const PageTitle = "Unit of Measurement";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function UnitOfMeasurementPage() {
	return <UnitOfMeasurementListPage />;
}
