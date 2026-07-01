import type { Metadata } from "next";
import PrivacyPolicyForm from "@/app/src/ui/auth/PrivacyPolicyForm";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

export const metadata: Metadata = {
  title: `Data Privacy Statement | ${AppName}`,
  description: `Learn how ${AppName} collects, protects, and uses your data.`,
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyForm />;
}
