import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BeginningBalanceUploaderActionPage } from "@/app/src/ui/modules/beginning-balance-uploader/BeginningBalanceUploaderActionPage";

export const metadata: Metadata = {
  title: `Edit Beginning Balance | ${AppName}`,
};

export default function Page() {
  return <BeginningBalanceUploaderActionPage />;
}
