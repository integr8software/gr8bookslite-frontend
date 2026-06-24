import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { StatementOfAccountAction } from "@/app/src/ui/modules/sales/statement-of-account/Action";

const PageTitle = "View Statement Of Account";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesStatementOfAccountViewPage() {
  return <StatementOfAccountAction />;
}


