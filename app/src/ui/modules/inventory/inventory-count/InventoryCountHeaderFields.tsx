import type { ChangeEventHandler } from "react";
import {
  InventoryCountCategoryOptions,
  InventoryCountStatusOptions,
  InventoryCountWarehouseOptions,
  inventoryCountFieldClassName,
} from "@/app/src/constants/modules/inventory/inventory-count/InventoryCountConstants";
import type { InventoryCountValues } from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";

type InventoryCountHeaderFieldsProps = {
  isReadonly: boolean;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  values: InventoryCountValues;
};

export function InventoryCountHeaderFields({
  isReadonly,
  onChange,
  values,
}: InventoryCountHeaderFieldsProps) {
  return (
    <section className="rounded-md border border-darknavy/10 bg-white p-2 shadow-sm shadow-darknavy/5 sm:p-3">
      <div className="grid gap-x-4 gap-y-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1.2fr)_minmax(0,0.95fr)]">
        <div className="grid content-start gap-4">
          <SelectRow
            label="Source Warehouse"
            name="warehouse"
            disabled={isReadonly}
            required
            value={values.warehouse}
            options={InventoryCountWarehouseOptions}
            onChange={onChange}
          />
          <ItemCategoryRow disabled={isReadonly} value={values.category} onChange={onChange} />
          <TextAreaRow
            label="Remarks"
            name="remarks"
            readOnly={isReadonly}
            value={values.remarks}
            onChange={onChange}
          />
        </div>

        <div className="grid content-start gap-4">
          <TextRow
            label="IC No"
            name="countNo"
            readOnly={isReadonly}
            required
            value={values.countNo}
            onChange={onChange}
          />
          <TextRow
            label="IC Date"
            name="countDate"
            readOnly={isReadonly}
            required
            type="date"
            value={values.countDate}
            onChange={onChange}
          />
          <SelectRow
            label="Status"
            name="status"
            disabled={isReadonly}
            required
            value={values.status}
            options={InventoryCountStatusOptions}
            onChange={onChange}
          />
        </div>
      </div>
    </section>
  );
}

function TextRow({
  label,
  name,
  onChange,
  readOnly,
  required = false,
  type = "text",
  value,
}: {
  label: string;
  name: keyof InventoryCountValues;
  onChange: ChangeEventHandler<HTMLInputElement>;
  readOnly: boolean;
  required?: boolean;
  type?: "date" | "text";
  value: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      <FieldLabel htmlFor={`inventory-count-${name}`} required={required}>
        {label}
      </FieldLabel>
      <input
        id={`inventory-count-${name}`}
        name={name}
        readOnly={readOnly}
        type={type}
        value={value}
        onChange={onChange}
        className={fieldClassName}
      />
    </div>
  );
}

function ItemCategoryRow({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  value: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      <FieldLabel htmlFor="inventory-count-category" required>
        Item Category
      </FieldLabel>
      <select
        id="inventory-count-category"
        name="category"
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={fieldClassName}
      >
        {InventoryCountCategoryOptions.map((option) => (
          <option key={option} value={option}>
            {option === "ALL" ? "All" : option}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectRow({
  disabled,
  label,
  name,
  onChange,
  options,
  required = false,
  value,
}: {
  disabled: boolean;
  label: string;
  name: keyof InventoryCountValues;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: readonly (string | { label: string; value: string })[];
  required?: boolean;
  value: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      <FieldLabel htmlFor={`inventory-count-${name}`} required={required}>
        {label}
      </FieldLabel>
      <select
        id={`inventory-count-${name}`}
        name={name}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={fieldClassName}
      >
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;

          return (
            <option key={value || label} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function TextAreaRow({
  label,
  name,
  onChange,
  readOnly,
  value,
}: {
  label: string;
  name: keyof InventoryCountValues;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  readOnly: boolean;
  value: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      <FieldLabel htmlFor={`inventory-count-${name}`}>{label}</FieldLabel>
      <textarea
        id={`inventory-count-${name}`}
        name={name}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        rows={2}
        className={`${fieldClassName} min-h-16 resize-y py-2`}
      />
    </div>
  );
}

function FieldLabel({
  children,
  htmlFor,
  required = false,
}: {
  children: string;
  htmlFor: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="pt-2 text-sm font-semibold text-darknavy">
      {children}
      {required ? <span className="ml-1 text-coralpink">*</span> : null}
    </label>
  );
}

const fieldClassName = `${inventoryCountFieldClassName} h-10 min-h-10 py-0 text-xs`;
