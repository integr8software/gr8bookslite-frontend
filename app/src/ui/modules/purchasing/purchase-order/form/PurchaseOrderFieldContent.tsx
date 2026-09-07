import type {
  PurchaseOrderFieldUpdater,
  PurchaseOrderFormValues,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { PurchaseOrderSupplierFields } from "@/app/src/ui/modules/purchasing/purchase-order/form/PurchaseOrderField";

type PurchaseOrderDetailsFormProps = {
  isReadonly: boolean;
  partyOptions: AppAdvancedDropdownOption[];
  values: PurchaseOrderFormValues;
  onSelectParty: (partyCode: string) => void;
  onUpdateField: PurchaseOrderFieldUpdater<PurchaseOrderFormValues>;
};

export function PurchaseOrderDetailsForm({ isReadonly, partyOptions, onSelectParty, onUpdateField, values }: PurchaseOrderDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <PurchaseOrderSupplierFields
        isReadonly={isReadonly}
        isCopyLocked={Boolean(values.copyFromSource)}
        partyOptions={partyOptions}
        values={values}
        onSelectParty={onSelectParty}
        onUpdateField={onUpdateField}
      />
    </section>
  );
}
