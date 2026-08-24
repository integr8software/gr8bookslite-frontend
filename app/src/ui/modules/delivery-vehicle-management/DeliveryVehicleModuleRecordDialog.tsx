"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import type {
  DeliveryVehicleField,
  DeliveryVehicleModuleConfig,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { getModuleSavePendingLabel, ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

type Props = {
  config: DeliveryVehicleModuleConfig;
  mode: "add" | "edit" | "view";
  record?: DeliveryVehicleModuleRecord;
  onClose: () => void;
  onSave: (values: Record<string, string>, status: string, category?: string, existing?: DeliveryVehicleModuleRecord) => void;
  validate: (values: Record<string, string>) => Record<string, string>;
};

export function DeliveryVehicleModuleRecordDialog({ config, mode, record, onClose, onSave, validate }: Props) {
  const formId = `delivery-vehicle-${config.key}-drawer-form`;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(config.fields.map((field) => [field.key, createInitialFieldValue(config.key, field, record)])),
  );
  const [status, setStatus] = useState(record?.status ?? config.statuses[0] ?? "Active");
  const [activeTab, setActiveTab] = useState(config.fieldTabs?.[0]?.label ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isView = mode === "view";
  const usesActiveInactiveSwitch =
    config.statuses.length === 2 && config.statuses.includes("Active") && config.statuses.includes("Inactive");
  const activeFieldKeys = config.fieldTabs?.find((tab) => tab.label === activeTab)?.fieldKeys ?? config.fields.map((field) => field.key);
  const activeTabDescription = config.fieldTabs?.find((tab) => tab.label === activeTab)?.description;
  const visibleFields = config.fields.filter((field) => activeFieldKeys.includes(field.key));
  const fieldByKey = new Map(visibleFields.map((field) => [field.key, field]));
  const title =
    mode === "add"
      ? config.primaryAction
      : mode === "edit"
        ? `Edit ${config.noun}`
        : `${config.noun.replace(/^./, (letter) => letter.toUpperCase())} details`;
  const statusField = renderStatusField({
    isView,
    status,
    statuses: config.statuses,
    usesActiveInactiveSwitch,
    onStatusChange: setStatus,
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateBeforeSubmit()) {
      return;
    }
    onSave(values, status, undefined, record);
  }

  function validateBeforeSubmit() {
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstErrorTab = config.fieldTabs?.find((tab) => tab.fieldKeys.some((fieldKey) => nextErrors[fieldKey]));
      if (firstErrorTab) {
        setActiveTab(firstErrorTab.label);
      }
      return false;
    }
    return true;
  }

  return (
    <ModuleDrawer
      description={
        isView
          ? `Review the saved ${config.noun} details and operational references.`
          : (config.formDescription ?? "Enter the required details, then set the current workflow status.")
      }
      eyebrow={config.title}
      formId={formId}
      isOpen
      isReadonly={isView}
      maxWidthClassName="max-w-3xl"
      onBeforeSaveConfirm={validateBeforeSubmit}
      onClose={onClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      submitLabel={mode === "edit" ? `Update ${config.noun}` : `Save ${config.noun}`}
      title={title}
    >
      <form id={formId} onSubmit={submit} className="grid gap-6 p-6">
        {config.fieldTabs ? (
          <div className="grid gap-3 border-b border-darknavy/10 pb-4">
            <div className="flex flex-wrap gap-2">
              {config.fieldTabs.map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(tab.label)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    activeTab === tab.label
                      ? "border-skyblue bg-skyblue/10 text-skyblue"
                      : "border-darknavy/10 bg-white text-darknavy/65 hover:bg-darknavy/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {activeTabDescription ? <p className="text-sm leading-6 text-darknavy/60">{activeTabDescription}</p> : null}
          </div>
        ) : null}
        <div className="grid gap-4">
          {config.key === "vehicle-types" ? (
            <VehicleTypeFieldRows
              errors={errors}
              fieldByKey={fieldByKey}
              isView={isView}
              values={values}
              onChange={(fieldKey, value) => setValues((current) => ({ ...current, [fieldKey]: value }))}
            />
          ) : config.key === "delivery-vehicles" ? (
            <DeliveryVehicleFieldRows
              errors={errors}
              fieldByKey={fieldByKey}
              isView={isView}
              statusField={statusField}
              values={values}
              onChange={(fieldKey, value) => setValues((current) => ({ ...current, [fieldKey]: value }))}
            />
          ) : config.key === "vehicle-repair-maintenance" ? (
            <VehicleRepairMaintenanceFieldRows
              errors={errors}
              fieldByKey={fieldByKey}
              isView={isView}
              statusField={statusField}
              values={values}
              onChange={(fieldKey, value) => setValues((current) => ({ ...current, [fieldKey]: value }))}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleFields.map((field) => (
                <DeliveryVehicleModuleField
                  key={field.key}
                  error={errors[field.key]}
                  field={field}
                  isView={isView}
                  value={values[field.key] ?? ""}
                  onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
                />
              ))}
            </div>
          )}
          {config.key === "delivery-vehicles" || config.key === "vehicle-repair-maintenance" ? null : statusField}
        </div>
      </form>
    </ModuleDrawer>
  );
}

function VehicleRepairMaintenanceFieldRows({
  errors,
  fieldByKey,
  isView,
  statusField,
  values,
  onChange,
}: {
  errors: Record<string, string>;
  fieldByKey: Map<string, DeliveryVehicleField>;
  isView: boolean;
  statusField: React.ReactNode;
  values: Record<string, string>;
  onChange: (fieldKey: string, value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <DeliveryVehicleModuleField
          error={errors.workOrderNo}
          field={fieldByKey.get("workOrderNo") as DeliveryVehicleField}
          isView={isView}
          value={values.workOrderNo ?? ""}
          onChange={(value) => onChange("workOrderNo", value)}
        />
        <DeliveryVehicleModuleField
          error={errors.workOrderDate}
          field={fieldByKey.get("workOrderDate") as DeliveryVehicleField}
          isView={isView}
          value={values.workOrderDate ?? ""}
          onChange={(value) => onChange("workOrderDate", value)}
        />
      </div>
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["vehicle"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["maintenanceType", "priority"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["serviceProvider"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["description"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["estimatedCost", "schedule"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <div className="grid gap-4 sm:grid-cols-2">{statusField}</div>
    </>
  );
}

function DeliveryVehicleFieldRows({
  errors,
  fieldByKey,
  isView,
  statusField,
  values,
  onChange,
}: {
  errors: Record<string, string>;
  fieldByKey: Map<string, DeliveryVehicleField>;
  isView: boolean;
  statusField: React.ReactNode;
  values: Record<string, string>;
  onChange: (fieldKey: string, value: string) => void;
}) {
  return (
    <>
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["plateNumber"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["vehicleType", "baseWarehouse"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["ownership"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["registrationExpiry", "insuranceExpiry"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["description"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <DeliveryVehicleModuleField
          error={errors.deliveryStatus}
          field={fieldByKey.get("deliveryStatus") as DeliveryVehicleField}
          isView={isView}
          value={values.deliveryStatus ?? ""}
          onChange={(value) => onChange("deliveryStatus", value)}
        />
        {statusField}
      </div>
    </>
  );
}

function VehicleTypeFieldRows({
  errors,
  fieldByKey,
  isView,
  values,
  onChange,
}: {
  errors: Record<string, string>;
  fieldByKey: Map<string, DeliveryVehicleField>;
  isView: boolean;
  values: Record<string, string>;
  onChange: (fieldKey: string, value: string) => void;
}) {
  return (
    <>
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["typeName"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["brand", "model"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["maxPayload", "cargoVolume"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["palletCapacity", "handling"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
      <VehicleTypeFieldRow
        errors={errors}
        fieldByKey={fieldByKey}
        fieldKeys={["description"]}
        isView={isView}
        values={values}
        onChange={onChange}
      />
    </>
  );
}

function VehicleTypeFieldRow({
  errors,
  fieldByKey,
  fieldKeys,
  isView,
  values,
  onChange,
}: {
  errors: Record<string, string>;
  fieldByKey: Map<string, DeliveryVehicleField>;
  fieldKeys: string[];
  isView: boolean;
  values: Record<string, string>;
  onChange: (fieldKey: string, value: string) => void;
}) {
  const fields = fieldKeys.map((fieldKey) => fieldByKey.get(fieldKey)).filter((field): field is DeliveryVehicleField => Boolean(field));

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <DeliveryVehicleModuleField
          key={`${field.key}-${field.label}`}
          className={fields.length === 1 ? "sm:col-span-2" : undefined}
          error={errors[field.key]}
          field={field}
          isView={isView}
          value={values[field.key] ?? ""}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}
    </div>
  );
}

function DeliveryVehicleModuleField({
  className,
  error,
  field,
  isView,
  value,
  onChange,
}: {
  className?: string;
  error?: string;
  field: DeliveryVehicleField;
  isView: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `delivery-vehicle-${field.key}`;
  const common = {
    id,
    name: field.key,
    value,
    disabled: isView,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value),
  };

  return (
    <FormField
      className={[field.type === "textarea" ? "sm:col-span-2" : "", className].filter(Boolean).join(" ")}
      error={error}
      helper={field.helper}
      label={field.label}
      required={field.required}
      tooltip={field.tooltip}
    >
      {field.type === "textarea" ? (
        <AppLimitedTextarea
          {...common}
          maxLength={field.maxLength}
          placeholder={isView ? `No ${field.label}...` : (field.placeholder ?? `Enter ${field.label}...`)}
          className={`${controlClassName(error)} min-h-24 resize-y py-3 ${isView ? "placeholder:italic" : ""}`}
          counterMode="used"
        />
      ) : field.type === "select" ? (
        <AppAdvancedDropdown
          id={id}
          name={field.key}
          value={value}
          readOnly={isView}
          ariaInvalid={Boolean(error)}
          isClearable={!field.required}
          options={createDeliveryVehicleDropdownOptions(field.options)}
          placeholder={field.placeholder ?? `Select ${field.label}`}
          searchPlaceholder={`Search ${field.label.toLowerCase()}`}
          onChange={(nextValue) => onChange(String(nextValue))}
        />
      ) : (
        <input
          {...common}
          type={
            field.type === "number"
              ? "number"
              : field.type === "date"
                ? "date"
                : field.type === "datetime-local"
                  ? "datetime-local"
                  : "text"
          }
          className={controlClassName(error)}
          placeholder={field.placeholder}
        />
      )}
    </FormField>
  );
}

function createDeliveryVehicleDropdownOptions(options: readonly string[] | undefined): AppAdvancedDropdownOption[] {
  return (options ?? []).map((option) => ({
    name: option,
    value: option,
  }));
}

function FormField({
  children,
  className,
  error,
  helper,
  label,
  required,
  tooltip,
}: {
  children: React.ReactNode;
  className?: string;
  error?: string;
  helper?: string;
  label: string;
  required?: boolean;
  tooltip?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired={required} label={label} leadingSpace />
        {tooltip ? (
          <ModuleTooltip title={label} description={tooltip} position="top">
            <span
              className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-darknavy/45 transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25"
              tabIndex={0}
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">{tooltip}</span>
            </span>
          </ModuleTooltip>
        ) : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span>
      ) : helper ? (
        <span className="mt-1 block text-xs font-medium leading-5 text-darknavy/50">{helper}</span>
      ) : null}
    </label>
  );
}

function createInitialFieldValue(configKey: string, field: DeliveryVehicleField, record?: DeliveryVehicleModuleRecord) {
  const recordValue = record?.fields[field.key];

  if (recordValue !== undefined) {
    return recordValue;
  }

  if (configKey === "vehicle-repair-maintenance") {
    if (field.key === "workOrderNo") {
      return record?.code ?? createSuggestedWorkOrderNumber();
    }

    if (field.key === "workOrderDate") {
      return record?.createdAt ? formatDateInput(new Date(record.createdAt)) : formatDateInput(new Date());
    }
  }

  return field.defaultValue ?? "";
}

function createSuggestedWorkOrderNumber() {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sequence = String(Date.now()).slice(-4);

  return `WO-${year}${month}-${sequence}`;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function renderStatusField({
  isView,
  status,
  statuses,
  usesActiveInactiveSwitch,
  onStatusChange,
}: {
  isView: boolean;
  status: string;
  statuses: readonly string[];
  usesActiveInactiveSwitch: boolean;
  onStatusChange: (value: string) => void;
}) {
  return (
    <FormField label="Status" required>
      {usesActiveInactiveSwitch ? (
        <AppSwitch
          falseOption={MaintenanceInactiveStatusSwitchOption}
          readOnly={isView}
          trueOption={MaintenanceActiveStatusSwitchOption}
          value={status}
          onChange={onStatusChange}
        />
      ) : (
        <select value={status} disabled={isView} onChange={(event) => onStatusChange(event.target.value)} className={controlClassName()}>
          {statuses.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      )}
    </FormField>
  );
}

function controlClassName(error?: string) {
  return `h-11 w-full rounded-md border ${error ? "border-coralpink/55" : "border-darknavy/10"} bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5`;
}
