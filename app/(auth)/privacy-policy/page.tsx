import type { Metadata } from "next";
import PrivacyPolicyForm from "@/app/src/ui/auth/PrivacyPolicyForm";

export const metadata: Metadata = {
  title: "Data Privacy Statement | GR8BooksLite",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyForm />;
}
