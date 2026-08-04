"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import type {
  DeliveryVehicleField,
  DeliveryVehicleModuleConfig,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { getModuleSavePendingLabel, ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import {
  MaintenanceActiveStatusSwitchOption,
  MaintenanceInactiveStatusSwitchOption,
} from "@/app/src/utils/status.util";

type Props = {
  config: DeliveryVehicleModuleConfig;
  mode: "add" | "edit" | "view";
  record?: DeliveryVehicleModuleRecord;
  onClose: () => void;
  onSave: (
    values: Record<string, string>,
    status: string,
    category?: string,
    existing?: DeliveryVehicleModuleRecord,
  ) => void;
  validate: (values: Record<string, string>) => Record<string, string>;
};

export function DeliveryVehicleModuleRecordDialog({
  config,
  mode,
  record,
  onClose,
  onSave,
  validate,
}: Props) {
  const formId = `delivery-vehicle-${config.key}-drawer-form`;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      config.fields.map((field) => [
        field.key,
        record?.fields[field.key] ?? field.defaultValue ?? "",
      ]),
    ),
  );
  const [status, setStatus] = useState(record?.status ?? config.statuses[0] ?? "Active");
  const [activeTab, setActiveTab] = useState(config.fieldTabs?.[0]?.label ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isView = mode === "view";
  const usesActiveInactiveSwitch =
    config.statuses.length === 2 &&
    config.statuses.includes("Active") &&
    config.statuses.includes("Inactive");
  const activeFieldKeys =
    config.fieldTabs?.find((tab) => tab.label === activeTab)?.fieldKeys ??
    config.fields.map((field) => field.key);
  const visibleFields = config.fields.filter((field) => activeFieldKeys.includes(field.key));
  const fieldByKey = new Map(visibleFields.map((field) => [field.key, field]));
  const title =
    mode === "add"
      ? config.primaryAction
      : mode === "edit"
        ? `Edit ${config.noun}`
        : `${config.noun.replace(/^./, (letter) => letter.toUpperCase())} details`;

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
      const firstErrorTab = config.fieldTabs?.find((tab) =>
        tab.fieldKeys.some((fieldKey) => nextErrors[fieldKey]),
      );
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
          ? "Review the persisted profile and operational references."
          : "Keep fleet identity, capacity, compliance, and status together."
      }
      eyebrow={`${config.code} - Fleet workspace`}
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
          <div className="flex flex-wrap gap-2 border-b border-darknavy/10 pb-4">
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
        ) : null}
        <div className="grid gap-4">
          {config.key === "vehicle-types" ? (
            <VehicleTypeFieldRows
              errors={errors}
              fieldByKey={fieldByKey}
              isView={isView}
              values={values}
              onChange={(fieldKey, value) =>
                setValues((current) => ({ ...current, [fieldKey]: value }))
              }
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
          <FormField label="Status" required>
            {usesActiveInactiveSwitch ? (
              <AppSwitch
                falseOption={MaintenanceInactiveStatusSwitchOption}
                readOnly={isView}
                trueOption={MaintenanceActiveStatusSwitchOption}
                value={status}
                onChange={setStatus}
              />
            ) : (
              <select
                value={status}
                disabled={isView}
                onChange={(event) => setStatus(event.target.value)}
                className={controlClassName()}
              >
                {config.statuses.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            )}
          </FormField>
        </div>
      </form>
    </ModuleDrawer>
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
        fieldKeys={["bodyType", "handling"]}
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
        fieldKeys={["palletCapacity"]}
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
  const fields = fieldKeys
    .map((fieldKey) => fieldByKey.get(fieldKey))
    .filter((field): field is DeliveryVehicleField => Boolean(field));

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
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => onChange(event.target.value),
  };

  return (
    <FormField
      className={[field.type === "textarea" ? "sm:col-span-2" : "", className]
        .filter(Boolean)
        .join(" ")}
      error={error}
      label={field.label}
      required={field.required}
      tooltip={field.tooltip}
    >
      {field.type === "textarea" ? (
        <AppLimitedTextarea
          {...common}
          maxLength={field.maxLength}
          placeholder={isView ? `No ${field.label}...` : `Enter ${field.label}...`}
          className={`${controlClassName(error)} min-h-24 resize-y py-3 ${
            isView ? "placeholder:italic" : ""
          }`}
          counterMode="used"
        />
      ) : field.type === "select" ? (
        <select {...common} className={controlClassName(error)}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
        />
      )}
    </FormField>
  );
}

function FormField({
  children,
  className,
  error,
  label,
  required,
  tooltip,
}: {
  children: React.ReactNode;
  className?: string;
  error?: string;
  label: string;
  required?: boolean;
  tooltip?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        {required ? <span className="text-coralpink"> *</span> : null}
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
      ) : null}
    </label>
  );
}

function controlClassName(error?: string) {
  return `h-11 w-full rounded-md border ${error ? "border-coralpink/55" : "border-darknavy/10"} bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5`;
}
