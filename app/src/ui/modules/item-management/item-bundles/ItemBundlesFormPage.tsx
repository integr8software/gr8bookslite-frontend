"use client";

import { useEffect, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { ArrowLeft, GripVertical, Layers, Plus, Save, Trash2 } from "lucide-react";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { ItemBundlesFormId, ItemBundlesHref } from "@/app/src/constants/modules/item-management/item-bundles/ItemBundlesConstants";
import { useItemBundlesFormPage } from "@/app/src/hooks/modules/item-management/item-bundles/useItemBundlesFormPage";
import type { ItemBundleLine } from "@/app/src/types/modules/item-management/item-bundles/ItemBundlesTypes";
import type { ItemRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import type { UnitOfMeasurementRecord } from "@/app/src/types/modules/item-management/unit-of-measurement/UnitOfMeasurementTypes";
import { getItemAllowsDecimalQuantity } from "@/app/src/validations/modules/item-management/item-bundles/ItemBundlesValidation";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

export function ItemBundlesFormPage() {
  const page = useItemBundlesFormPage();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const {
    closeDialog: closeSaveDialog,
    isConfirmSubmitPending,
    submitFromDialog,
  } = useAppDialogFormSubmit({
    formId: ItemBundlesFormId,
    isDialogOpen: isSaveDialogOpen,
    isSubmitting: false,
    onDialogOpenChange: setIsSaveDialogOpen,
  });

  return (
    <form id={ItemBundlesFormId} onSubmit={page.handleSubmit} className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={page.isReadonly ? page.values.name || "Item Bundle" : "Item Bundle"}
        description="Create or update a grouped sales item with component quantities and bundle pricing."
        eyebrow={
          <>
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Item management
          </>
        }
        actions={
          <>
            <Link href={ItemBundlesHref} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {!page.isReadonly ? (
              <button
                type="button"
                onClick={() => {
                  if (page.validateBeforeSubmit()) {
                    setIsSaveDialogOpen(true);
                  }
                }}
                className={moduleHeaderActionClassNames.primary}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save Bundle
              </button>
            ) : null}
          </>
        }
      />
      <AppDialog
        confirmLabel="Confirm"
        description={
          page.mode === "edit"
            ? "This will update the selected item bundle with your latest changes."
            : "This will create a new item bundle using the details you entered."
        }
        iconTone="question"
        isOpen={isSaveDialogOpen}
        isPending={isConfirmSubmitPending}
        pendingLabel={getModuleSavePendingLabel(page.mode)}
        title={page.mode === "edit" ? "Save item bundle changes?" : "Save this item bundle?"}
        tone="success"
        onCancel={closeSaveDialog}
        onConfirm={submitFromDialog}
      />
      <section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-darknavy">Bundle Information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Bundle Code" error={page.errors.code} required>
            <input
              value={page.values.code}
              onChange={(event) => page.updateField("code", event.target.value)}
              readOnly={page.isReadonly}
              className={fieldClassName}
              placeholder="BND-2004"
            />
          </Field>
          <Field label="Bundle Name" error={page.errors.name} required>
            <input
              value={page.values.name}
              onChange={(event) => page.updateField("name", event.target.value)}
              readOnly={page.isReadonly}
              className={fieldClassName}
              placeholder="Starter Office Bundle"
            />
          </Field>
          <Field label="Bundle Price" error={page.errors.bundlePrice} required>
            <DecimalNumberInput
              value={page.values.bundlePrice}
              readOnly={page.isReadonly}
              allowDecimal
              onValueChange={(value) => page.updateField("bundlePrice", value)}
            />
          </Field>
          <Field label="Status" required>
            <select
              value={page.values.status}
              onChange={(event) => page.updateField("status", event.target.value as typeof page.values.status)}
              disabled={page.isReadonly}
              className={fieldClassName}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </Field>
        </div>
      </section>
      <section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-darknavy">Bundle Items</h2>
            <p className="mt-1 text-sm text-darknavy/55">Select component items and quantities. Pricing is set once as the bundle price.</p>
          </div>
          {!page.isReadonly ? (
            <button type="button" onClick={page.addLine} className={moduleHeaderActionClassNames.secondary}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Item
            </button>
          ) : null}
        </div>
        <div className="mt-4 overflow-auto">
          <DndContext sensors={page.sensors} collisionDetection={closestCenter} onDragEnd={page.handleDragEnd}>
            <table className="w-full min-w-[73rem] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-12" />
                <col className="w-[28rem]" />
                <col className="w-[8rem]" />
                <col className="w-[9rem]" />
                <col className="w-[9rem]" />
                <col className="w-[7rem]" />
              </colgroup>
              <thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
                <tr>
                  <th className="px-3 py-3">
                    <span className="sr-only">Order</span>
                  </th>
                  <th className="px-3 py-3">
                    Item Name
                    <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired label="Item Name" leadingSpace />
                  </th>
                  <th className="px-3 py-3 text-right">
                    Qty
                    <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired label="Qty" leadingSpace />
                  </th>
                  <th className="px-3 py-3 text-right">Original Cost</th>
                  <th className="px-3 py-3 text-right">Original Price</th>
                  <th className="px-3 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <SortableContext items={page.values.lines.map((line) => line.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-darknavy/8">
                  {page.values.lines.map((line) => (
                    <BundleLineRow
                      key={line.id}
                      isReadonly={page.isReadonly}
                      item={page.items.find((currentItem) => currentItem.id === line.itemId)}
                      itemOptions={page.itemOptions}
                      lineErrors={page.errors.lineErrors?.[line.id]}
                      line={line}
                      unitsOfMeasurement={page.unitsOfMeasurement}
                      onRemove={page.removeLine}
                      onUpdate={page.updateLine}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
          {page.errors.lines ? <p className="mt-2 text-sm font-medium text-coralpink">{page.errors.lines}</p> : null}
        </div>
      </section>
      <section className="grid gap-3 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm sm:grid-cols-4">
        <SummaryTile label="Original Cost" value={formatCurrency(page.totals.originalCost)} />
        <SummaryTile label="Original Selling" value={formatCurrency(page.totals.originalSelling)} />
        <SummaryTile label="Bundle Price" value={formatCurrency(page.totals.bundleTotal)} />
        <SummaryTile label="Customer Savings" value={formatCurrency(Math.max(page.totals.originalSelling - page.totals.bundleTotal, 0))} />
      </section>
    </form>
  );
}

function BundleLineRow({
  isReadonly,
  item,
  itemOptions,
  lineErrors,
  line,
  unitsOfMeasurement,
  onRemove,
  onUpdate,
}: {
  isReadonly: boolean;
  item?: ItemRecord;
  itemOptions: AppAdvancedDropdownOption[];
  lineErrors?: Partial<Record<"itemId" | "quantity", string>>;
  line: ItemBundleLine;
  unitsOfMeasurement: UnitOfMeasurementRecord[];
  onRemove: (lineId: string) => void;
  onUpdate: (lineId: string, update: Partial<ItemBundleLine>) => void;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ disabled: isReadonly, id: line.id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const allowDecimalQuantity = getItemAllowsDecimalQuantity(item, unitsOfMeasurement);

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? "relative z-10 bg-skyblue/5 shadow-sm" : undefined}>
      <td className="px-3 py-3">
        <button
          type="button"
          disabled={isReadonly}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/45 transition hover:bg-skyblue/10 hover:text-darknavy disabled:opacity-30"
          aria-label="Reorder bundle item"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </td>
      <td className="px-3 py-3">
        <AppAdvancedDropdown
          menuPortal
          options={itemOptions}
          placeholder="--Select Item--"
          readOnly={isReadonly}
          showSelectedDetails
          value={line.itemId}
          onChange={(value) => onUpdate(line.id, { itemId: String(value) })}
          onSelectOption={(option) => onUpdate(line.id, { itemId: option.value })}
        />
        {lineErrors?.itemId ? <p className="mt-1 text-xs font-medium text-coralpink">{lineErrors.itemId}</p> : null}
      </td>
      <td className="px-3 py-3">
        <DecimalNumberInput
          allowDecimal={allowDecimalQuantity}
          value={line.quantity}
          readOnly={isReadonly}
          onValueChange={(value) => onUpdate(line.id, { quantity: value })}
        />
        {lineErrors?.quantity ? <p className="mt-1 text-xs font-medium text-coralpink">{lineErrors.quantity}</p> : null}
      </td>
      <td className="px-3 py-3 text-right font-semibold">{formatCurrency(item?.costPrice ?? 0)}</td>
      <td className="px-3 py-3 text-right font-semibold">{formatCurrency(item?.sellingPrice ?? 0)}</td>
      <td className="px-3 py-3 text-center">
        <button
          type="button"
          disabled={isReadonly}
          onClick={() => onRemove(line.id)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-coralpink/30 bg-white text-coralpink transition hover:bg-coralpink/10 disabled:opacity-35"
          aria-label="Remove bundle item"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

function Field({ children, error, label, required }: { children: ReactNode; error?: string; label: string; required?: boolean }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired={required} label={label} leadingSpace />
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span> : null}
    </label>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-darknavy/10 bg-offwhite/45 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">{label}</div>
      <div className="mt-2 text-lg font-semibold text-darknavy">{value}</div>
    </div>
  );
}

function DecimalNumberInput({
  allowDecimal,
  readOnly,
  value,
  onValueChange,
}: {
  allowDecimal: boolean;
  readOnly: boolean;
  value: number;
  onValueChange: (value: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the editable draft synchronized when parent numeric value changes.
    setDraftValue(String(value));
  }, [value]);

  function handleChange(nextValue: string) {
    if (/[eE+-]/.test(nextValue)) {
      return;
    }

    if (!allowDecimal && nextValue.includes(".")) {
      return;
    }

    setDraftValue(nextValue);

    if (!nextValue.trim()) {
      return;
    }

    const parsedValue = Number(nextValue);

    if (Number.isFinite(parsedValue) && parsedValue >= 0 && (allowDecimal || Number.isInteger(parsedValue))) {
      onValueChange(parsedValue);
    }
  }

  function handleBlur() {
    if (!draftValue.trim()) {
      onValueChange(0);
      setDraftValue("0");
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (["e", "E", "+", "-"].includes(event.key)) {
      event.preventDefault();
    }
  }

  return (
    <input
      type="number"
      min={0}
      step={allowDecimal ? "any" : 1}
      inputMode="decimal"
      value={draftValue}
      readOnly={readOnly}
      onBlur={handleBlur}
      onChange={(event) => handleChange(event.target.value)}
      onKeyDown={handleKeyDown}
      className={`${fieldClassName} text-right`}
    />
  );
}

const fieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-default disabled:bg-offwhite/65";
