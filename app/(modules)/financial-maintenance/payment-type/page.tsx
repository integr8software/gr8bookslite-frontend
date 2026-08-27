import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PaymentTypeListPage } from "@/app/src/ui/modules/financial-maintenance/payment-type/PaymentTypeListPage";

const PageTitle = "Payment Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementPaymentTypePage() {
  return <PaymentTypeListPage />;
}
