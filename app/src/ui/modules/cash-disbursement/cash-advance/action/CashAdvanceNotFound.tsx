import { FileX2 } from "lucide-react";
import { CashAdvanceLink } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function CashAdvanceNotFound() {
  return (
    <ModuleNotFound
      actionHref={CashAdvanceLink}
      actionLabel="Back to cash advances"
      icon={<FileX2 className="h-5 w-5" aria-hidden="true" />}
      title="Cash advance not found"
      description="The cash advance may have been removed or the link is no longer valid."
    />
  );
}
