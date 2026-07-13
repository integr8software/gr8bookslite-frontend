import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BeginningBalanceUploaderListPage } from "@/app/src/ui/modules/beginning-balance-uploader/BeginningBalanceUploaderListPage";

export const metadata: Metadata = {
  title: `Beginning Balance Uploader | ${AppName}`,
};

export default function Page() {
  return <BeginningBalanceUploaderListPage />;
}
