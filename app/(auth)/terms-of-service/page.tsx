import type { Metadata } from "next";
import TermsOfServiceForm from "@/app/src/ui/auth/TermsOfServiceForm";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
  title: `Terms of Service | ${AppName}`,
};

export default function TermsOfServicePage() {
  return <TermsOfServiceForm />;
}
