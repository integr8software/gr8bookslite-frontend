import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { StatementOfAccountAction } from "@/app/src/ui/modules/sales/statement-of-account/Action";

const PageTitle = "Edit Statement Of Account";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesStatementOfAccountEditPage() {
  return <StatementOfAccountAction />;
}


