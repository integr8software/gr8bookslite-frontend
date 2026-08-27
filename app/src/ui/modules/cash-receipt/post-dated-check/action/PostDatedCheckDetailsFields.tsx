import type { ReactNode } from "react";
import { PostDatedCheckTypeOptions } from "@/app/src/constants/modules/cash-receipt/post-dated-check/PostDatedCheckConstants";
import type {
  PostDatedCheckFormErrors,
  PostDatedCheckFormValues,
  PostDatedCheckType,
} from "@/app/src/types/modules/cash-receipt/post-dated-check/PostDatedCheckTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

export function PostDatedCheckDetailsFields({
  values,
  errors,
  isReadonly,
  numberInputMode,
  partyOptions,
  onSelectParty,
  onUpdateField,
}: {
  values: PostDatedCheckFormValues;
  errors: PostDatedCheckFormErrors;
  isReadonly: boolean;
  numberInputMode?: string;
  partyOptions: AppAdvancedDropdownOption[];
  onSelectParty: (partyId: string) => void;
  onUpdateField: <K extends keyof PostDatedCheckFormValues>(field: K, value: PostDatedCheckFormValues[K]) => void;
}) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="grid content-start gap-4">
          <Field controlId="pdc-party" label="Party Name" required error={errors.partyId}>
            <AppAdvancedDropdown
              id="pdc-party"
              options={partyOptions}
              value={values.partyId}
              readOnly={isReadonly}
              placeholder="Select Party"
              searchPlaceholder="Search Party"
              showSelectedDetails
              onChange={(value) => onSelectParty(String(value))}
            />
          </Field>
          <Field controlId="pdc-remarks" label="Remarks">
            <AppLimitedTextarea
              id="pdc-remarks"
              className={`${inputClass} resize`}
              maxLength={500}
              readOnly={isReadonly}
              value={values.remarks}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
            />
          </Field>
        </div>
        <div className="grid content-start gap-4">
          <Field controlId="pdc-party-code" label="Party Code" required>
            <input id="pdc-party-code" className={inputClass} readOnly value={values.partyCode} />
          </Field>
          <Field controlId="pdc-registry-type" label="Type" required error={errors.type}>
            <AppAdvancedDropdown
              id="pdc-registry-type"
              options={[...PostDatedCheckTypeOptions]}
              value={values.type}
              readOnly={isReadonly}
              isClearable={false}
              placeholder="Select Type"
              searchPlaceholder="Search Type"
              onChange={(value) => onUpdateField("type", String(value) as PostDatedCheckType)}
            />
          </Field>
        </div>
        <div className="grid content-start gap-4">
          <Field controlId="pdc-registry-number" label="PDC No." required error={errors.registryNo}>
            <input
              id="pdc-registry-number"
              className={inputClass}
              readOnly={isReadonly || numberInputMode === "AUTO"}
              placeholder="Auto Generated PDC Number"
              value={values.registryNo}
              onChange={(event) => onUpdateField("registryNo", event.target.value)}
            />
          </Field>
          <Field controlId="pdc-registry-date" label="PDC Date" required error={errors.registryDate}>
            <input
              id="pdc-registry-date"
              className={inputClass}
              type="date"
              readOnly={isReadonly}
              value={values.registryDate}
              onChange={(event) => onUpdateField("registryDate", event.target.value)}
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

function Field({
  controlId,
  label,
  required = false,
  error,
  children,
}: {
  controlId: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start">
      <label htmlFor={controlId} className="pt-3 text-sm font-semibold text-darknavy">
        {label}
        {required ? <span className="ml-1 text-coralpink">*</span> : null}
      </label>
      <div className="min-w-0">
        {children}
        {error ? <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span> : null}
      </div>
    </div>
  );
}

const inputClass =
  "app-data-entry-field min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 py-2 text-sm font-medium text-darknavy outline-none placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite";
