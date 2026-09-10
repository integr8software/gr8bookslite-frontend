import type {
  PurchaseRequestFieldUpdater,
  PurchaseRequestFormValues,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { PurchaseRequestSupplierFields } from "@/app/src/ui/modules/purchasing/purchase-request/form/PurchaseRequestField";

type PurchaseRequestDetailsFormProps = {
  isReadonly: boolean;
  partyOptions: AppAdvancedDropdownOption[];
  projectOptions: AppAdvancedDropdownOption[];
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  values: PurchaseRequestFormValues;
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onOpenResponsibilityCenterDrawer: () => void;
  onSelectParty: (partyCode: string, partyName: string) => void;
  onSelectProject: (projectCode: string, projectName: string) => void;
  onSelectResponsibilityCenter: (centerId: string, centerName: string) => void;
  onUpdateField: PurchaseRequestFieldUpdater<PurchaseRequestFormValues>;
};

export function PurchaseRequestDetailsForm({
  isReadonly,
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onOpenResponsibilityCenterDrawer,
  onSelectParty,
  onSelectProject,
  onSelectResponsibilityCenter,
  onUpdateField,
  partyOptions,
  projectOptions,
  responsibilityCenterOptions,
  values,
}: PurchaseRequestDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <PurchaseRequestSupplierFields
        isReadonly={isReadonly}
        partyOptions={partyOptions}
        projectOptions={projectOptions}
        responsibilityCenterOptions={responsibilityCenterOptions}
        values={values}
        onOpenPartyDrawer={onOpenPartyDrawer}
        onOpenProjectDrawer={onOpenProjectDrawer}
        onOpenResponsibilityCenterDrawer={onOpenResponsibilityCenterDrawer}
        onSelectParty={onSelectParty}
        onSelectProject={onSelectProject}
        onSelectResponsibilityCenter={onSelectResponsibilityCenter}
        onUpdateField={onUpdateField}
      />
    </section>
  );
}
