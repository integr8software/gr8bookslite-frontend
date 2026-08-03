import {
  useEffect,
  useState,
  type ChangeEventHandler,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { formatCurrency } from "@/app/src/utils/currency.util";
import type {
  ItemFormErrors,
  ItemFormValues,
} from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { ItemTagsInput } from "@/app/src/ui/modules/item-management/items/ItemTagsInput";

export type ItemFieldsProps = {
  taxTreatmentOptions: Array<{ label: string; value: string; percentage: number }>;
  categoryOptions: AppAdvancedDropdownOption[];
  errors: ItemFormErrors;
  isReadonly: boolean;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  uomOptions: AppAdvancedDropdownOption[];
  values: ItemFormValues;
  warehouseOptions: AppAdvancedDropdownOption[];
  onAddTag: (tag: string) => void;
  onFieldChange: <TKey extends keyof ItemFormValues>(
    field: TKey,
    value: ItemFormValues[TKey],
  ) => void;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  onRemoveTag: (tag: string) => void;
};

export function ItemFields(props: ItemFieldsProps) {
  return (
    <div className="grid gap-5">
      <ItemInformationFields {...props} />
      <ItemInventoryFields {...props} />
      <ItemPricingTaxFields {...props} />
    </div>
  );
}

export function ItemInformationFields({
  categoryOptions,
  errors,
  isReadonly,
  onAddTag,
  onFieldChange,
  onInputChange,
  onRemoveTag,
  responsibilityCenterOptions,
  uomOptions,
  values,
}: ItemFieldsProps) {
  return (
    <FieldPanel title="Basic Information">
      <FormField label="Item Code" error={errors.code} required>
        <input
          name="code"
          value={values.code}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="ITEM-000123"
        />
      </FormField>
      <FormField label="SKU Code" error={errors.skuCode}>
        <input
          name="skuCode"
          value={values.skuCode}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="SKU-000123"
        />
      </FormField>
      <FormField label="Item Name" error={errors.name} required>
        <input
          name="name"
          value={values.name}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="Item name"
        />
      </FormField>
      <FormField label="Barcode" error={errors.barcode}>
        <input
          name="barcode"
          value={values.barcode}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="Barcode"
        />
      </FormField>
      <FormField label="Category" error={errors.primaryCategory} required>
        <AppAdvancedDropdown
          options={categoryOptions}
          placeholder="--Select Category--"
          readOnly={isReadonly}
          value={values.primaryCategory}
          onChange={(value) => onFieldChange("primaryCategory", String(value))}
        />
      </FormField>
      <FormField label="Unit of Measurement" error={errors.uom} required>
        <AppAdvancedDropdown
          options={uomOptions}
          readOnly={isReadonly}
          value={values.uom}
          onChange={(value) => onFieldChange("uom", String(value))}
        />
      </FormField>
      <FormField label="Brand" error={errors.brand}>
        <input
          name="brand"
          value={values.brand}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="Brand"
        />
      </FormField>
      <FormField label="Model" error={errors.model}>
        <input
          name="model"
          value={values.model}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="Model, series, or variant"
        />
      </FormField>
      <FormField label="External Reference Code" error={errors.externalReferenceCode}>
        <input
          name="externalReferenceCode"
          value={values.externalReferenceCode}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="Marketplace, legacy, or external system code"
        />
      </FormField>
      <FormField label="Responsibility / Cost Center" error={errors.responsibilityCenter}>
        <AppAdvancedDropdown
          isClearable
          options={responsibilityCenterOptions}
          placeholder="--Select Cost Center--"
          readOnly={isReadonly}
          value={values.responsibilityCenter}
          onChange={(value) => onFieldChange("responsibilityCenter", String(value))}
        />
      </FormField>
      <FormField label="Description" error={errors.description} wide>
        <AppLimitedTextarea
          name="description"
          value={values.description}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={`${fieldClassName} min-h-24 max-h-40 resize-y py-3`}
          placeholder="Item notes"
        />
      </FormField>
      <FormField label="Tags" error={errors.tags} wide>
        <ItemTagsInput
          isReadonly={isReadonly}
          tags={values.tags}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
        />
      </FormField>
      <FormField label="Status" error={errors.status} required wide>
        <AppSwitch
          falseOption={InactiveStatusSwitchOption}
          readOnly={isReadonly}
          trueOption={ActiveStatusSwitchOption}
          value={values.status}
          onChange={(value) => onFieldChange("status", value)}
        />
      </FormField>
    </FieldPanel>
  );
}

export function ItemPricingTaxFields({
  errors,
  isReadonly,
  onFieldChange,
  onInputChange,
  taxTreatmentOptions,
  values,
}: ItemFieldsProps) {
  const selectedTax = taxTreatmentOptions.find((option) => option.value === values.taxTreatment);
  const suggestedSellingPrice = createSuggestedSellingPrice(values, selectedTax?.percentage);
  const options =
    taxTreatmentOptions.length > 0 ? taxTreatmentOptions : [];

  return (
    <FieldPanel title="Pricing and Tax">
      <FormField label="Cost" error={errors.costPrice}>
        <DecimalNumberInput
          name="costPrice"
          value={values.costPrice}
          readOnly={isReadonly}
          onValueChange={(value) => onFieldChange("costPrice", value)}
        />
      </FormField>
      <FormField label="Suggested Price">
        <div className="flex min-h-11 items-center rounded-md border border-darknavy/10 bg-offwhite/55 px-3 text-sm font-semibold text-darknavy">
          {formatCurrency(suggestedSellingPrice)}
        </div>
      </FormField>
      <FormField label="Selling Price" error={errors.sellingPrice}>
        <DecimalNumberInput
          name="sellingPrice"
          value={values.sellingPrice}
          readOnly={isReadonly}
          onValueChange={(value) => onFieldChange("sellingPrice", value)}
        />
      </FormField>
      <FormField label="Tax Treatment" error={errors.taxTreatment}>
        <select
          name="taxTreatment"
          value={values.taxTreatment}
          onChange={onInputChange}
          disabled={isReadonly}
          className={fieldClassName}
        >
          <option value="" disabled>
            {taxTreatmentOptions.length > 0
              ? "Select tax type"
              : "No active tax definitions"}
          </option>
          {options.map((taxTreatment) => (
            <option key={taxTreatment.value} value={taxTreatment.value}>
              {taxTreatment.label}
            </option>
          ))}
        </select>
      </FormField>
    </FieldPanel>
  );
}

export function ItemInventoryFields({
  errors,
  isReadonly,
  onFieldChange,
  onInputChange,
  values,
  warehouseOptions,
}: ItemFieldsProps) {
  return (
    <FieldPanel title="Inventory">
      <FormField label="Default Warehouse" error={errors.defaultWarehouse}>
        <AppAdvancedDropdown
          isClearable
          options={warehouseOptions}
          placeholder="--Select Default Warehouse--"
          readOnly={isReadonly}
          value={values.defaultWarehouse}
          onChange={(value) => onFieldChange("defaultWarehouse", String(value))}
        />
      </FormField>
      <FormField label="Default Location" error={errors.defaultLocation}>
        <input
          name="defaultLocation"
          value={values.defaultLocation}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="WH-A-Z1-R01-S02-B03"
        />
      </FormField>
      <FormField label="Zone" error={errors.defaultZone}>
        <input
          name="defaultZone"
          value={values.defaultZone}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="Zone A"
        />
      </FormField>
      <FormField label="Rack" error={errors.defaultRack}>
        <input
          name="defaultRack"
          value={values.defaultRack}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="R01"
        />
      </FormField>
      <FormField label="Shelf" error={errors.defaultShelf}>
        <input
          name="defaultShelf"
          value={values.defaultShelf}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="S02"
        />
      </FormField>
      <FormField label="Bin" error={errors.defaultBin}>
        <input
          name="defaultBin"
          value={values.defaultBin}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="B03"
        />
      </FormField>
      <FormField label="Lot No." error={errors.defaultLotNo}>
        <input
          name="defaultLotNo"
          value={values.defaultLotNo}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="LOT-2026-001"
        />
      </FormField>
      <FormField label="Lead Time" error={errors.leadTime}>
        <input
          name="leadTime"
          value={values.leadTime}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="3 days"
        />
      </FormField>
      <FormField label="Reorder Level" error={errors.reorderLevel}>
        <DecimalNumberInput
          name="reorderLevel"
          value={values.reorderLevel}
          readOnly={isReadonly}
          onValueChange={(value) => onFieldChange("reorderLevel", value)}
        />
      </FormField>
      <FormField label="Minimum Stock" error={errors.minimumStock}>
        <DecimalNumberInput
          name="minimumStock"
          value={values.minimumStock}
          readOnly={isReadonly}
          onValueChange={(value) => onFieldChange("minimumStock", value)}
        />
      </FormField>
      <FormField label="Maximum Stock" error={errors.maximumStock}>
        <DecimalNumberInput
          name="maximumStock"
          value={values.maximumStock}
          readOnly={isReadonly}
          onValueChange={(value) => onFieldChange("maximumStock", value)}
        />
      </FormField>
    </FieldPanel>
  );
}

function createSuggestedSellingPrice(values: ItemFormValues, taxPercentage?: number) {
  if (taxPercentage === undefined || taxPercentage <= 0) {
    return values.costPrice;
  }

  return values.costPrice * (1 + taxPercentage / 100);
}

function DecimalNumberInput({
  name,
  readOnly,
  value,
  onValueChange,
}: {
  name: keyof ItemFormValues;
  readOnly: boolean;
  value: number;
  onValueChange: (value: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the editable draft synchronized when parent numeric value changes.
    setDraftValue(String(value));
  }, [value]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (["e", "E", "+", "-"].includes(event.key)) {
      event.preventDefault();
    }
  }

  function handleChange(value: string) {
    if (/[eE+-]/.test(value)) {
      return;
    }

    setDraftValue(value);

    if (!value.trim()) {
      return;
    }

    const nextValue = Number(value);

    if (Number.isFinite(nextValue) && nextValue >= 0) {
      onValueChange(nextValue);
    }
  }

  function handleBlur() {
    if (!draftValue.trim()) {
      onValueChange(0);
      setDraftValue("0");
    }
  }

  return (
    <input
      name={name}
      type="number"
      min={0}
      step="any"
      inputMode="decimal"
      value={draftValue}
      onBlur={handleBlur}
      onChange={(event) => handleChange(event.target.value)}
      onKeyDown={handleKeyDown}
      readOnly={readOnly}
      className={fieldClassName}
    />
  );
}

function FieldPanel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold text-darknavy">{title}</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function FormField({
  children,
  error,
  label,
  required,
  wide,
}: {
  children: ReactNode;
  error?: string;
  label: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "lg:col-span-2" : undefined}>
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        {required ? <span className="text-coralpink"> *</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span>
      ) : null}
    </div>
  );
}

const ActiveStatusSwitchOption = { label: "Active", value: "Active" } as const;
const InactiveStatusSwitchOption = {
  label: "Inactive",
  value: "Inactive",
} as const;

const fieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
