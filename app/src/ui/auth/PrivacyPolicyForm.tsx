import { PrivacyPolicy } from "@/app/src/data/legal/LegalPolicyData";
import { LegalPolicyPage } from "@/app/src/ui/legal/LegalPolicyPage";

export default function PrivacyPolicyForm() {
  return <LegalPolicyPage policy={PrivacyPolicy} />;
}
