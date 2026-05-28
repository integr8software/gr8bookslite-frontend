import type { Metadata } from "next";
import { BeginningBalanceUploaderFormPage } from "@/app/src/ui/modules/beginning-balance-uploader/BeginningBalanceUploaderFormPage";

export const metadata: Metadata = {
  title: "Beginning Balance Uploader | GR8BooksLite",
};

export default function BeginningBalanceUploaderRoutePage() {
  return <BeginningBalanceUploaderFormPage />;
}
