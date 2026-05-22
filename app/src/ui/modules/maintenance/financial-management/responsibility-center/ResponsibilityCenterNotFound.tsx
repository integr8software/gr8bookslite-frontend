import { ArrowLeft } from "lucide-react";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function ResponsibilityCenterNotFound() {
  return (
    <ModuleNotFound
      align="center"
      title="Responsibility center not found"
      description="The selected responsibility center may have been deleted or the link is no longer valid."
      descriptionClassName="mx-auto mt-2 max-w-lg text-sm leading-6 text-darknavy/55"
      actionHref={ResponsibilityCenterHref}
      actionLabel="Back to Responsibility Center"
      actionIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
    />
  );
}
