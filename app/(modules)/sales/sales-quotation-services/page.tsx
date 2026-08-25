import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesQuotationServicesPage } from "@/app/src/ui/modules/sales/sales-quotation-services/SalesQuotationServicesPage";
export const metadata: Metadata = { title: `Service Quotation | ${AppName}` };
export default function Page() { return <SalesQuotationServicesPage />; }
