"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowDownAZ, ArrowUpAZ, CheckCircle2, CirclePause, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { ItemVariationsDrawerFormId, ItemVariationsFieldClassName } from "@/app/src/constants/modules/item-management/item-variations/ItemVariationsConstants";
import { createVariationValue, createItemVariationFormValues } from "@/app/src/data/modules/item-management/item-variations/ItemVariationsData";
import type {
  ItemVariationFormErrors,
  ItemVariationFormValues,
  ItemVariationRecord,
  ItemVariationsListPageState,
} from "@/app/src/types/modules/item-management/item-variations/ItemVariationsTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { validateItemVariationsForm } from "@/app/src/validations/modules/item-management/item-variations/ItemVariationsValidation";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

type ItemVariationsDrawerProps = {
  drawer: ItemVariationsListPageState["drawer"];
  records: ItemVariationRecord[];
  onClose: () => void;
  onSave: (values: ItemVariationFormValues) => Promise<void> | void;
};

type DropIndicator = {
  index: number;
  position: "after" | "before";
};

export function ItemVariationsDrawer({ drawer, records, onClose, onSave }: ItemVariationsDrawerProps) {
  const [values, setValues] = useState(() => createItemVariationFormValues(drawer?.record));
  const [errors, setErrors] = useState<ItemVariationFormErrors>({});
  const [draggedValueIndex, setDraggedValueIndex] = useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  const valuesListRef = useRef<HTMLDivElement | null>(null);

  if (!drawer) {
    return null;
  }

  const isReadonly = drawer.mode === "view";
  const title =
    drawer.mode === "add"
      ? "Add Item Variation"
      : drawer.mode === "edit"
        ? `Edit ${drawer.record?.name ?? "Item Variation"}`
        : (drawer.record?.name ?? "Item Variation");

  function updateValue(index: number, value: string) {
    setValues((current) => ({
      ...current,
      values: current.values.map((entry, currentIndex) => (currentIndex === index ? { ...entry, label: value } : entry)),
    }));
    setErrors((current) => ({ ...current, values: undefined }));
  }

  function reorderValue(sourceIndex: number, targetIndex: number, position: DropIndicator["position"]) {
    const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;

    if (sourceIndex === targetIndex || sourceIndex + 1 === insertIndex) {
      return;
    }

    setValues((current) => {
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex >= current.values.length || targetIndex >= current.values.length) {
        return current;
      }

      const nextValues = [...current.values];
      const [value] = nextValues.splice(sourceIndex, 1);
      const adjustedInsertIndex = sourceIndex < insertIndex ? insertIndex - 1 : insertIndex;

      nextValues.splice(adjustedInsertIndex, 0, value);

      return {
        ...current,
        values: nextValues,
      };
    });
    setErrors((current) => ({ ...current, values: undefined }));
  }

  function toggleValueStatus(index: number) {
    setValues((current) => ({
      ...current,
      values: current.values.map((value, currentIndex) =>
        currentIndex === index ? { ...value, status: value.status === "Active" ? "Inactive" : "Active" } : value,
      ),
    }));
    setErrors((current) => ({ ...current, values: undefined }));
  }

  function sortValuesByName(direction: "asc" | "desc") {
    setValues((current) => ({
      ...current,
      values: [...current.values].sort((firstValue, secondValue) => {
        const result = firstValue.label.localeCompare(secondValue.label, undefined, { sensitivity: "base" });

        return direction === "asc" ? result : -result;
      }),
    }));
    setErrors((current) => ({ ...current, values: undefined }));
  }

  function addValue() {
    setValues((current) => ({
      ...current,
      values: [...current.values, createVariationValue("")],
    }));
    setErrors((current) => ({ ...current, values: undefined }));
    requestAnimationFrame(() => {
      valuesListRef.current?.scrollTo({
        top: valuesListRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  async function handleSubmit() {
    const nextErrors = validateItemVariationsForm(values, {
      currentRecordId: drawer?.record?.id,
      records,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSave(values);
  }

  return (
    <ModuleDrawer
      isOpen
      title={title}
      description="Maintain the variation name and reusable values."
      position="right"
      maxWidthClassName="max-w-xl"
      contentClassName="overflow-hidden"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={moduleHeaderActionClassNames.secondary}>
            {isReadonly ? "Close" : "Cancel"}
          </button>
          {!isReadonly ? (
            <button type="submit" form={ItemVariationsDrawerFormId} className={moduleHeaderActionClassNames.primary}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save
            </button>
          ) : null}
        </div>
      }
    >
      <form
        id={ItemVariationsDrawerFormId}
        className="flex h-full min-h-0 flex-col gap-4 px-6 py-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <FormField label="Variation Name" error={errors.name} required>
          <input
            value={values.name}
            readOnly={isReadonly}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            onInput={() => setErrors((current) => ({ ...current, name: undefined }))}
            className={ItemVariationsFieldClassName}
          />
        </FormField>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-darknavy">
              Values <span className="text-coralpink">*</span>
            </span>
            {!isReadonly ? (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className={`${moduleHeaderActionClassNames.secondary} px-3`}
                  aria-label="Sort values ascending"
                  onClick={() => sortValuesByName("asc")}
                >
                  <ArrowUpAZ className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${moduleHeaderActionClassNames.secondary} px-3`}
                  aria-label="Sort values descending"
                  onClick={() => sortValuesByName("desc")}
                >
                  <ArrowDownAZ className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
          <div ref={valuesListRef} className="grid min-h-48 flex-1 content-start gap-2 overflow-y-auto pr-1">
            {values.values.map((value, index) => (
              <div
                key={value.id}
                onDragOver={(event) => {
                  if (draggedValueIndex !== null && draggedValueIndex !== index) {
                    event.preventDefault();
                    const rect = event.currentTarget.getBoundingClientRect();
                    setDropIndicator({
                      index,
                      position: event.clientY > rect.top + rect.height / 2 ? "after" : "before",
                    });
                  }
                }}
                onDragLeave={() => setDropIndicator(null)}
                onDrop={(event) => {
                  event.preventDefault();

                  if (draggedValueIndex !== null) {
                    reorderValue(draggedValueIndex, index, dropIndicator?.index === index ? dropIndicator.position : "before");
                  }

                  setDraggedValueIndex(null);
                  setDropIndicator(null);
                }}
                className={`relative flex gap-2 rounded-md ${draggedValueIndex === index ? "bg-skyblue/10 opacity-75" : ""}`}
              >
                {dropIndicator?.index === index ? (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0 right-0 z-10 h-1 rounded-full bg-skyblue shadow-[0_0_0_3px_rgba(33,39,56,0.12)] ${
                      dropIndicator.position === "before" ? "-top-1" : "-bottom-1"
                    }`}
                  />
                ) : null}
                <span className="inline-flex h-11 w-11 shrink-0 overflow-hidden rounded-md border border-darknavy/10 bg-darknavy/[0.03] text-xs font-bold text-darknavy/55">
                  {!isReadonly ? (
                    <span
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", String(index));
                        setDraggedValueIndex(index);
                      }}
                      onDragEnd={() => {
                        setDraggedValueIndex(null);
                        setDropIndicator(null);
                      }}
                      className="inline-flex h-full w-full cursor-grab items-center justify-center text-darknavy/45 transition hover:bg-skyblue/10 hover:text-darknavy active:cursor-grabbing"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-4 w-4" aria-hidden="true" />
                    </span>
                  ) : null}
                </span>
                <input
                  value={value.label}
                  readOnly={isReadonly}
                  onChange={(event) => updateValue(index, event.target.value)}
                  className={`${ItemVariationsFieldClassName} ${value.status === "Inactive" ? "text-darknavy/45 line-through" : ""}`}
                />
                {!isReadonly ? (
                  <>
                    {value.isUsed ? (
                      <button
                        type="button"
                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border bg-white transition ${
                          value.status === "Active"
                            ? "border-amber-300/60 text-amber-600 hover:bg-amber-50"
                            : "border-emerald-300/60 text-emerald-600 hover:bg-emerald-50"
                        }`}
                        aria-label={value.status === "Active" ? `Deactivate ${value.label || "value"}` : `Activate ${value.label || "value"}`}
                        onClick={() => toggleValueStatus(index)}
                      >
                        {value.status === "Active" ? (
                          <CirclePause className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-coralpink/25 bg-white text-coralpink transition hover:bg-coralpink/10"
                        aria-label="Remove value"
                        onClick={() =>
                          setValues((current) => ({
                            ...current,
                            values: current.values.length > 1 ? current.values.filter((_, currentIndex) => currentIndex !== index) : [createVariationValue("")],
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            ))}
          </div>
          {!isReadonly ? (
            <button type="button" className={`${moduleHeaderActionClassNames.secondary} mt-2 justify-center`} onClick={addValue}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Value
            </button>
          ) : null}
          {errors.values ? <span className="mt-1 block text-xs font-medium text-coralpink">{errors.values}</span> : null}
        </div>
        <FormField className="mt-auto" label="Status" error={errors.status} required>
		  <AppSwitch
			falseOption={MaintenanceInactiveStatusSwitchOption}
            value={values.status}
			readOnly={isReadonly}
            onChange={(status) => {
              setValues((current) => ({
                ...current,
                status,
              }));
			  setErrors((current) => ({ ...current, status: undefined }));
			}}
			trueOption={MaintenanceActiveStatusSwitchOption}
		  />
        </FormField>
      </form>
    </ModuleDrawer>
  );
}

function FormField({
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
        {required ? <span className="text-coralpink"> *</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span> : null}
    </label>
  );
}
