import type { ChangeEvent, ReactNode } from "react";
import { Building2, GitBranch, type LucideIcon } from "lucide-react";
import { DefaultPhilippineContactNumber, PhilippineContactNumberPlaceholder } from "@/app/src/data/shared/contact/ContactData";
import type { MainBranch } from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import type {
  BranchManagementClassification,
  BranchManagementFormValues,
} from "@/app/src/data/modules/system-administration/branch-management/BranchManagementData";
import type { BranchFormErrors } from "@/app/src/types/workspace/branch-manager/BranchActionTypes";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

type BranchDetailsFieldsProps = {
  errors: BranchFormErrors;
  hideMainBranchField?: boolean;
  hideSatelliteTaxField?: boolean;
  isReadonly: boolean;
  mainBranchOptions: MainBranch[];
  values: BranchManagementFormValues;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onUpdateField: (field: keyof BranchManagementFormValues, value: string | boolean) => void;
};

export function BranchDetailsFields({
  errors,
  hideMainBranchField = false,
  hideSatelliteTaxField = false,
  isReadonly,
  mainBranchOptions,
  onInputChange,
  onUpdateField,
  values,
}: BranchDetailsFieldsProps) {
  const isSatellite = values.classification === "satellite";

  return (
    <div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <BranchClassificationField
          isReadonly={isReadonly}
          value={values.classification}
          onChange={(classification) => {
            onUpdateField("classification", classification);
          }}
        />

        <BranchField label="Name" error={errors.name} required>
          <input
            name="name"
            value={values.name}
            onChange={onInputChange}
            readOnly={isReadonly}
            className={branchFieldClassName}
            placeholder="Cebu Branch"
          />
        </BranchField>

        <BranchContactFields isReadonly={isReadonly} values={values} onInputChange={onInputChange} onUpdateField={onUpdateField} />

        <BranchTaxField
          errors={errors}
          hideSatelliteTaxField={hideSatelliteTaxField}
          isReadonly={isReadonly}
          isSatellite={isSatellite}
          mainBranchOptions={mainBranchOptions}
          values={values}
          onInputChange={onInputChange}
        />

        <BranchField label="Address">
          <input
            name="address"
            value={values.address}
            onChange={onInputChange}
            readOnly={isReadonly}
            className={branchFieldClassName}
            placeholder="Street, city, province"
          />
        </BranchField>

        {hideMainBranchField ? null : (
          <label className="flex min-h-11 items-center gap-3 rounded-md border border-darknavy/10 px-3">
            <input
              type="checkbox"
              checked={values.isMain}
              disabled={isSatellite || isReadonly}
              onChange={(event) => onUpdateField("isMain", event.target.checked)}
              className="h-4 w-4 rounded border-darknavy/20 text-skyblue"
            />
            <span className="text-sm font-semibold text-darknavy">Mark as main branch</span>
          </label>
        )}

        <BranchField label="Description" className="lg:col-span-2">
          <textarea
            name="description"
            value={values.description}
            onChange={onInputChange}
            readOnly={isReadonly}
            rows={4}
            className={branchFieldClassName}
            placeholder="Optional notes for this branch or satellite."
          />
        </BranchField>
      </div>
    </div>
  );
}

function BranchClassificationField({
  isReadonly,
  onChange,
  value,
}: {
  isReadonly: boolean;
  value: BranchManagementClassification;
  onChange: (value: BranchManagementClassification) => void;
}) {
  return (
    <BranchField label="Classification" required className="lg:col-span-2">
      <div className="grid grid-cols-2 gap-2">
        <ClassificationButton
          active={value === "branch"}
          disabled={isReadonly}
          icon={Building2}
          label="Branch"
          onClick={() => onChange("branch")}
        />
        <ClassificationButton
          active={value === "satellite"}
          disabled={isReadonly}
          icon={GitBranch}
          label="Satellite"
          onClick={() => onChange("satellite")}
        />
      </div>
    </BranchField>
  );
}

function BranchContactFields({
  isReadonly,
  onInputChange,
  onUpdateField,
  values,
}: {
  isReadonly: boolean;
  values: Pick<BranchManagementFormValues, "contactNo" | "email">;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUpdateField: (field: keyof BranchManagementFormValues, value: string | boolean) => void;
}) {
  return (
    <>
      <BranchField label="Contact No.">
        <input
          name="contactNo"
          type="tel"
          inputMode="numeric"
          value={values.contactNo}
          onChange={onInputChange}
          onFocus={() => {
            if (!values.contactNo) {
              onUpdateField("contactNo", DefaultPhilippineContactNumber);
            }
          }}
          readOnly={isReadonly}
          maxLength={16}
          className={branchFieldClassName}
          placeholder={PhilippineContactNumberPlaceholder}
        />
      </BranchField>

      <BranchField label="Email">
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={branchFieldClassName}
          placeholder="branch@company.com"
        />
      </BranchField>
    </>
  );
}

function BranchTaxField({
  errors,
  hideSatelliteTaxField,
  isReadonly,
  isSatellite,
  mainBranchOptions,
  onInputChange,
  values,
}: {
  errors: BranchFormErrors;
  hideSatelliteTaxField: boolean;
  isReadonly: boolean;
  isSatellite: boolean;
  mainBranchOptions: MainBranch[];
  values: Pick<BranchManagementFormValues, "linkedMainBranchId" | "tin">;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  if (isSatellite) {
    if (hideSatelliteTaxField) {
      return null;
    }

    return (
      <BranchField label="Linked Main Branch" error={errors.linkedMainBranchId} required>
        <select
          name="linkedMainBranchId"
          value={values.linkedMainBranchId}
          onChange={onInputChange}
          disabled={isReadonly}
          className={branchFieldClassName}
        >
          <option value="">Select linked main branch</option>
          {mainBranchOptions.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name} - {branch.tin}
            </option>
          ))}
        </select>
      </BranchField>
    );
  }

  return (
    <BranchField label="TIN" error={errors.tin} required>
      <input
        name="tin"
        value={values.tin}
        onChange={onInputChange}
        readOnly={isReadonly}
        inputMode="numeric"
        maxLength={15}
        className={branchFieldClassName}
        placeholder="3242-3424-42432"
      />
    </BranchField>
  );
}

function BranchField({
  children,
  className,
  error,
  label,
  required,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired={required} label={label} leadingSpace />
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span> : null}
    </label>
  );
}

function ClassificationButton({
  active,
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-70 ${
        active ? "border-skyblue bg-skyblue/10 text-darknavy" : "border-darknavy/10 text-darknavy/65 hover:border-skyblue/50"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

const branchFieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
