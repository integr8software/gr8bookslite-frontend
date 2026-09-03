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
  values: PurchaseRequestFormValues;
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onSelectParty: (partyCode: string, partyName: string) => void;
  onSelectProject: (projectCode: string, projectName: string) => void;
  onUpdateField: PurchaseRequestFieldUpdater<PurchaseRequestFormValues>;
};

export function PurchaseRequestDetailsForm({
  isReadonly,
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onSelectParty,
  onSelectProject,
  onUpdateField,
  partyOptions,
  projectOptions,
  values,
}: PurchaseRequestDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <PurchaseRequestSupplierFields
        isReadonly={isReadonly}
        partyOptions={partyOptions}
        projectOptions={projectOptions}
        values={values}
        onOpenPartyDrawer={onOpenPartyDrawer}
        onOpenProjectDrawer={onOpenProjectDrawer}
        onSelectParty={onSelectParty}
        onSelectProject={onSelectProject}
        onUpdateField={onUpdateField}
      />
    </section>
  );
}
