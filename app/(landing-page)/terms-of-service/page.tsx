import type { Metadata } from "next";
import TermsOfServiceForm from "@/app/src/ui/auth/TermsOfServiceForm";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

export const metadata: Metadata = {
  title: `Terms of Service | ${AppName}`,
  description: `Review the terms and conditions for using ${AppName}.`,
};

export default function TermsOfServicePage() {
  return <TermsOfServiceForm />;
}
