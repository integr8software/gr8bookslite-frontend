import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock3, GripVertical, Plus } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { ItemSupplierAssignment } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTableActionButton } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ItemSuppliersTableProps = {
  error?: string;
  isReadonly: boolean;
  supplierOptions: AppAdvancedDropdownOption[];
  suppliers: ItemSupplierAssignment[];
  onAddSupplier: () => void;
  onReorderSupplier: (supplierId: string, overSupplierId: string) => void;
  onRemoveSupplier: (supplierId: string) => void;
  onUpdateSupplier: (
    supplierId: string,
    field: keyof ItemSupplierAssignment,
    value: string | boolean,
  ) => void;
};

export function ItemSuppliersTable({
  error,
  isReadonly,
  onAddSupplier,
  onReorderSupplier,
  onRemoveSupplier,
  onUpdateSupplier,
  supplierOptions,
  suppliers,
}: ItemSuppliersTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const supplierIds = suppliers.map((supplier) => supplier.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    onReorderSupplier(String(active.id), String(over.id));
  }

  return (
    <div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-darknavy">Suppliers</h2>
          <p className="mt-1 text-sm text-darknavy/55">
            Maintain supplier order and the default supplier for this item.
          </p>
        </div>
        {!isReadonly ? (
          <button
            type="button"
            onClick={onAddSupplier}
            className={moduleHeaderActionClassNames.secondary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Supplier
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm font-medium text-coralpink">{error}</p> : null}
      <div className="mt-4 overflow-auto rounded-lg border border-skyblue/15 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
          <table className="w-full min-w-[68rem] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-12" />
              <col className="w-[18rem]" />
              <col className="w-[14rem]" />
              <col className="w-[10rem]" />
              <col className="w-[10rem]" />
              <col className="w-[7rem]" />
              <col className="w-[7rem]" />
            </colgroup>
            <thead className="border-b border-skyblue/15 bg-skyblue/[0.08] text-xs font-semibold uppercase tracking-wide text-darknavy/70">
              <tr>
                <th className="px-3 py-3.5">
                  <span className="sr-only">Order</span>
                </th>
                <th className="px-3 py-3.5">Supplier</th>
                <th className="px-3 py-3.5">Supplier Item Code</th>
                <th className="px-3 py-3.5">Lead Time</th>
                <th className="px-3 py-3.5">Cost</th>
                <th className="px-3 py-3.5 text-center">Default</th>
                <th className="px-3 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <SortableContext items={supplierIds} strategy={verticalListSortingStrategy}>
              <tbody className="divide-y divide-skyblue/10">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-sm text-darknavy/55">
                      No suppliers added.
                    </td>
                  </tr>
                ) : null}
                {suppliers.map((supplier) => (
                  <SupplierRow
                    key={supplier.id}
                    isReadonly={isReadonly}
                    supplier={supplier}
                    supplierOptions={supplierOptions}
                    onRemoveSupplier={onRemoveSupplier}
                    onUpdateSupplier={onUpdateSupplier}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>
    </div>
  );
}

function SupplierRow({
  isReadonly,
  onRemoveSupplier,
  onUpdateSupplier,
  supplier,
  supplierOptions,
}: {
  isReadonly: boolean;
  supplier: ItemSupplierAssignment;
  supplierOptions: AppAdvancedDropdownOption[];
  onRemoveSupplier: (supplierId: string) => void;
  onUpdateSupplier: (
    supplierId: string,
    field: keyof ItemSupplierAssignment,
    value: string | boolean,
  ) => void;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    disabled: isReadonly || supplier.isDefault,
    id: supplier.id,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const rowSupplierOptions = useMemo(
    () => createSupplierDropdownOptions(supplierOptions, supplier.supplier),
    [supplier.supplier, supplierOptions],
  );

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={[
        "transition-colors hover:bg-skyblue/[0.035]",
        isDragging ? "relative z-10 bg-skyblue/8 shadow-sm" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <td className="px-3 py-3">
        <button
          type="button"
          disabled={isReadonly || supplier.isDefault}
          aria-label={
            supplier.isDefault
              ? `${supplier.supplier || "Default supplier"} stays at the top`
              : `Drag ${supplier.supplier || "supplier"} to reorder`
          }
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/45 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/30 disabled:cursor-default disabled:opacity-30"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </td>
      <td className="px-3 py-3" onPointerDown={(event) => event.stopPropagation()}>
        <AppAdvancedDropdown
          isClearable
          menuPortal
          options={rowSupplierOptions}
          placeholder="--Select Supplier--"
          readOnly={isReadonly}
          value={supplier.supplier}
          onChange={(value) => onUpdateSupplier(supplier.id, "supplier", String(value))}
        />
      </td>
      <td className="px-3 py-3">
        <input
          value={supplier.supplierItemCode}
          onChange={(event) =>
            onUpdateSupplier(supplier.id, "supplierItemCode", event.target.value)
          }
          readOnly={isReadonly}
          className={fieldClassName}
          placeholder="Supplier SKU"
        />
      </td>
      <td className="px-3 py-3">
        <LeadTimeInput
          value={supplier.leadTime}
          readOnly={isReadonly}
          onValueChange={(value) => onUpdateSupplier(supplier.id, "leadTime", value)}
        />
      </td>
      <td className="px-3 py-3">
        <DecimalNumberInput
          value={supplier.lastCost}
          readOnly={isReadonly}
          onValueChange={(value) => onUpdateSupplier(supplier.id, "lastCost", String(value))}
        />
      </td>
      <td className="px-3 py-3 text-center">
        <input
          type="radio"
          checked={supplier.isDefault}
          onChange={() => onUpdateSupplier(supplier.id, "isDefault", true)}
          disabled={isReadonly}
          aria-label={`Set ${supplier.supplier || "supplier"} as default`}
          className="h-4 w-4 accent-skyblue disabled:cursor-default"
        />
      </td>
      <td className="px-3 py-3 text-center">
        <div className="flex justify-center gap-1">
          {!isReadonly ? (
            <ModuleTableActionButton
              variant="delete"
              label="Remove supplier"
              onClick={() => onRemoveSupplier(supplier.id)}
            />
          ) : null}
        </div>
      </td>
    </tr>
  );
}

const fieldClassName =
  "min-h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65";

function createSupplierDropdownOptions(
  options: AppAdvancedDropdownOption[],
  currentSupplier: string,
) {
  const optionsByValue = new Map<string, AppAdvancedDropdownOption>();

  for (const option of options) {
    optionsByValue.set(option.value, option);
  }

  if (currentSupplier && !optionsByValue.has(currentSupplier)) {
    optionsByValue.set(currentSupplier, {
      name: currentSupplier,
      value: currentSupplier,
    });
  }

  return [...optionsByValue.values()];
}

const LeadTimeUnits = ["days", "weeks", "months"] as const;

function LeadTimeInput({
  readOnly,
  value,
  onValueChange,
}: {
  readOnly: boolean;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const parsedValue = parseLeadTime(value);

  function updateLeadTime(quantity: string, unit = parsedValue.unit) {
    if (!quantity.trim()) {
      onValueChange("");
      return;
    }

    onValueChange(`${quantity} ${unit}`);
  }

  return (
    <div className="flex min-h-10 overflow-hidden rounded-md border border-darknavy/15 bg-white text-sm font-medium text-darknavy transition focus-within:border-skyblue focus-within:ring-2 focus-within:ring-skyblue/20">
      <span className="flex w-10 items-center justify-center border-r border-darknavy/10 bg-skyblue/[0.06] text-skyblue">
        <Clock3 className="h-4 w-4" aria-hidden="true" />
      </span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={parsedValue.quantity}
        onChange={(event) => updateLeadTime(event.target.value)}
        readOnly={readOnly}
        className="min-w-0 flex-1 bg-white px-2 text-sm font-semibold text-darknavy outline-none placeholder:text-darknavy/35 read-only:bg-offwhite/65"
        placeholder="0"
      />
      <select
        value={parsedValue.unit}
        onChange={(event) =>
          updateLeadTime(parsedValue.quantity, event.target.value as (typeof LeadTimeUnits)[number])
        }
        disabled={readOnly}
        className="w-20 border-l border-darknavy/10 bg-offwhite/70 px-2 text-xs font-semibold uppercase tracking-wide text-darknavy/65 outline-none transition hover:bg-skyblue/[0.06] disabled:cursor-default disabled:text-darknavy/45"
      >
        {LeadTimeUnits.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
    </div>
  );
}

function parseLeadTime(value: string): {
  quantity: string;
  unit: (typeof LeadTimeUnits)[number];
} {
  const [, quantity = "", unit = "days"] =
    value.trim().match(/^(\d+(?:\.\d+)?)\s*(days?|weeks?|months?)?/i) ?? [];
  const normalizedUnit = unit.toLowerCase().replace(/s$/, "");

  if (normalizedUnit === "week") {
    return { quantity, unit: "weeks" };
  }

  if (normalizedUnit === "month") {
    return { quantity, unit: "months" };
  }

  return { quantity, unit: "days" };
}

function DecimalNumberInput({
  readOnly,
  value,
  onValueChange,
}: {
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
