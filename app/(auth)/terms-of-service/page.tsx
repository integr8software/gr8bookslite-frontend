import type { Metadata } from "next";
import TermsOfServiceForm from "@/app/src/ui/auth/TermsOfServiceForm";

export const metadata: Metadata = {
  title: "Terms of Service | GR8BooksLite",
};

export default function TermsOfServicePage() {
  return <TermsOfServiceForm />;
}
