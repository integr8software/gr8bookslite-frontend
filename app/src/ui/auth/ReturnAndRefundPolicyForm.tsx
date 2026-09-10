import { ReturnAndRefundPolicy } from "@/app/src/data/legal/LegalPolicyData";
import { LegalPolicyPage } from "@/app/src/ui/legal/LegalPolicyPage";

export default function ReturnAndRefundPolicyForm() {
  return <LegalPolicyPage policy={ReturnAndRefundPolicy} />;
}
