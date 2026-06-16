import type { Metadata } from "next";
import { PaymentTypeListPage } from "@/app/src/ui/modules/maintenance/financial-management/payment-type/PaymentTypeListPage";

const PageTitle = "Payment Type";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function MaintenanceFinancialManagementPaymentTypePage() {
	return <PaymentTypeListPage />;
}
