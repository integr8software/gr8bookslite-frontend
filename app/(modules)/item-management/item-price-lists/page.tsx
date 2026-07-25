import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PriceListsListPage } from "@/app/src/ui/modules/item-management/item-price-lists/PriceListsListPage";

const PageTitle = "Item Price List";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PriceListsPage() {
  return <PriceListsListPage />;
}
