import { TermsOfServicePolicy } from "@/app/src/data/legal/LegalPolicyData";
import { LegalPolicyPage } from "@/app/src/ui/legal/LegalPolicyPage";

export default function TermsOfServiceForm() {
  return <LegalPolicyPage policy={TermsOfServicePolicy} />;
}
