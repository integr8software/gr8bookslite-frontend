import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { StatementOfAccountMain } from "@/app/src/ui/modules/sales/statement-of-account/Main";

const PageTitle = "Statement Of Account";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesStatementOfAccountPage() {
  return <StatementOfAccountMain />;
}


