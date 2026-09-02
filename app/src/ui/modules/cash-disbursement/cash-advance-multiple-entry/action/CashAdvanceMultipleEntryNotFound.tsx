import { FileX2 } from "lucide-react";
import { CashAdvanceMultipleEntryLink } from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function CashAdvanceMultipleEntryNotFound() {
  return (
    <ModuleNotFound
      actionHref={CashAdvanceMultipleEntryLink}
      actionLabel="Back to cash advance multiple entries"
      icon={<FileX2 className="h-5 w-5" aria-hidden="true" />}
      title="Cash advance multiple entry not found"
      description="The cash advance multiple entry may have been removed or the link is no longer valid."
    />
  );
}

