"use client";

import { fetchItemReferenceOptions } from "@/app/src/services/modules/item-management/items/ItemManagementApi";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ItemActiveStatus,
  ItemInactiveStatus,
  ItemsHref,
  LegacyItemTaxNameAliases,
} from "@/app/src/constants/modules/item-management/items/ItemManagementConstants";
import {
  ItemInitialFormValues,
  MockItemVariations,
  MockItemSuppliers,
  createItemFormValues,
  createItemRecord,
  updateItemRecord,
} from "@/app/src/data/modules/item-management/items/ItemManagementData";
import type {
  ItemActionMode,
  ItemBehavior,
  ItemFormErrors,
  ItemFormValues,
  ItemSetupKind,
  ItemSetupRecord,
  ItemStatus,
  ItemVariationAssignment,
  ItemPriceListAssignment,
  ItemSupplierAssignment,
} from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { validateItemBasicInfo } from "@/app/src/validations/modules/item-management/items/ItemBasicInfoValidation";
import { useWarehousesStore } from "@/app/src/hooks/modules/warehouse-management/warehouses/useWarehouses";
import { useItemManagementStore } from "@/app/src/hooks/modules/item-management/items/useItemManagement";
import { fetchItemVariationOptions } from "@/app/src/services/modules/item-management/item-variations/ItemVariationsApi";
import { fetchItemCategoryOptions } from "@/app/src/services/modules/item-management/item-category/ItemCategoryApi";
import { ItemManagementQueryKeys } from "@/app/src/services/modules/item-management/items/ItemManagementQueryKeys";
import { fetchPartyOptions } from "@/app/src/services/modules/party-management/PartyManagementApi";
import { useTaxDefinitionOptions } from "@/app/src/hooks/shared/tax/useTaxDefinitionOptions";
import { formatTaxDefinitionPercentage } from "@/app/src/data/shared/tax/TaxDefinitionData";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";

const NumberItemFormFields = new Set<keyof ItemFormValues>([
  "costPrice",
  "maximumStock",
  "minimumStock",
  "reorderLevel",
  "sellingPrice",
]);

export function useItemsFormPage() {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const store = useItemManagementStore();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const { warehouses } = useWarehousesStore();
  const { addItem, isMutating, items, updateItem } = store;
  const taxMaintenance = useTaxDefinitionOptions();
  const itemVariationOptionsQuery = useQuery({
    queryKey: ItemManagementQueryKeys.itemVariationOptions(),
    queryFn: fetchItemVariationOptions,
    initialData: MockItemVariations,
    retry: false,
  });
  const itemCategoryOptionsQuery = useQuery({
    queryKey: [...ItemManagementQueryKeys.itemCategoryOptions(), activeCompanyId],
    enabled: activeCompanyId !== null,
    queryFn: fetchItemCategoryOptions,
    initialData: [] as ItemSetupRecord[],
    retry: false,
  });
  const vendorOptionsQuery = useQuery({
    queryKey: ItemManagementQueryKeys.vendorOptions(),
    queryFn: () => fetchPartyOptions("Vendor"),
    initialData: MockItemSuppliers,
    retry: false,
  });
  const categoryRecords = itemCategoryOptionsQuery.data;
  const setupRecords = useMemo<Record<ItemSetupKind, ItemSetupRecord[]>>(
    () => ({
      category: categoryRecords,
      subcategory: [],
      type: [],
      subtype: [],
    }),
    [categoryRecords],
  );
  const mode = getActionMode(pathname);
  const existingItem = items.find((item) => item.id === params.recordId);
  const isReadonly = mode === "view";
  const [values, setValues] = useState<ItemFormValues>(() =>
    existingItem ? createInitialItemFormValues(existingItem) : ItemInitialFormValues,
  );
  const initializedRecord = useRef(existingItem?.id);
  useEffect(() => {
    if (!existingItem || initializedRecord.current === existingItem.id) return;
    initializedRecord.current = existingItem.id;
    setValues(createInitialItemFormValues(existingItem));
  }, [existingItem]);
  const [errors, setErrors] = useState<ItemFormErrors>({});
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const referenceOptionsQuery = useQuery({
    queryKey: [...ItemManagementQueryKeys.items(activeCompanyId), "references"],
    queryFn: fetchItemReferenceOptions,
    enabled: activeCompanyId !== null,
  });
  const nextStatus: ItemStatus =
    existingItem?.status === ItemActiveStatus ? ItemInactiveStatus : ItemActiveStatus;
  const uomOptions = withSavedOption(referenceOptionsQuery.data?.units ?? [], existingItem?.unitOfMeasurementId, existingItem?.uom);
  const taxTreatmentOptions = useMemo(
    () =>
      taxMaintenance.taxes
        .filter((tax) => tax.status === ItemActiveStatus)
        .map((tax) => ({
          label: `${tax.name} (${formatTaxDefinitionPercentage(tax.percentage, tax.treatment)})`,
          value: tax.id,
          percentage: Number(tax.percentage),
        })),
    [taxMaintenance.taxes],
  );

  useEffect(() => {
    const activeTaxes = taxMaintenance.taxes.filter(
      (tax) => tax.status === ItemActiveStatus,
    );

    if (activeTaxes.length === 0) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Tax definitions load asynchronously and legacy item values must be migrated to stable tax ids.
    setValues((current) => {
      if (activeTaxes.some((tax) => tax.id === current.taxTreatment)) {
        return current;
      }

      const matchingTax = activeTaxes.find(
        (tax) =>
          normalizeLowercaseWhitespace(tax.name) ===
          normalizeLowercaseWhitespace(
            LegacyItemTaxNameAliases[current.taxTreatment] ??
              current.taxTreatment,
          ),
      );
      const taxTreatment =
        matchingTax?.id ?? (mode === "add" ? activeTaxes[0].id : "");

      return taxTreatment === current.taxTreatment
        ? current
        : { ...current, taxTreatment };
    });
  }, [mode, taxMaintenance.taxes]);

  useEffect(() => {
    const category = categoryRecords.find((record) => record.id === values.primaryCategory);

    if (!category?.behaviors?.length) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Category behavior is loaded asynchronously and is the source of truth for item behavior flags.
    setValues((current) => applyCategoryBehavior(current, category.behaviors ?? []));
  }, [categoryRecords, values.primaryCategory]);

  function updateField<TKey extends keyof ItemFormValues>(
    field: TKey,
    value: ItemFormValues[TKey],
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextValues: ItemFormValues = {
        ...current,
        [field]: value,
      };

      return nextValues;
    });
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, type, value } = event.target;

    if (type === "checkbox" && "checked" in event.target) {
      updateField(name as keyof ItemFormValues, event.target.checked as never);
      return;
    }

    if (NumberItemFormFields.has(name as keyof ItemFormValues)) {
      updateField(name as keyof ItemFormValues, Number(value) as never);
      return;
    }

    updateField(name as keyof ItemFormValues, value as never);
  }

  function addSupplier() {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      suppliers: [
        ...current.suppliers,
        {
          id: createItemSupplierId(),
          supplier: "",
          supplierItemCode: "",
          leadTime: "",
          lastCost: 0,
          isDefault: current.suppliers.length === 0,
        },
      ],
    }));
    setErrors((current) => ({ ...current, suppliers: undefined }));
  }

  function updateSupplier(
    supplierId: string,
    field: keyof ItemSupplierAssignment,
    value: string | boolean,
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      suppliers: moveDefaultSupplierFirst(
        current.suppliers.map((supplier) => {
          if (supplier.id !== supplierId) {
            return field === "isDefault" && value === true
              ? { ...supplier, isDefault: false }
              : supplier;
          }

          if (field === "isDefault") {
            return { ...supplier, isDefault: Boolean(value) };
          }

          return {
            ...supplier,
            [field]: field === "lastCost" ? Number(value) || 0 : String(value),
          };
        }),
      ),
    }));
    setErrors((current) => ({ ...current, suppliers: undefined }));
  }

  function removeSupplier(supplierId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      suppliers: moveDefaultSupplierFirst(
        ensureDefaultSupplier(current.suppliers.filter((supplier) => supplier.id !== supplierId)),
      ),
    }));
    setErrors((current) => ({ ...current, suppliers: undefined }));
  }

  function reorderSupplier(supplierId: string, overSupplierId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      suppliers: reorderSuppliers(current.suppliers, supplierId, overSupplierId),
    }));
  }

  function addTag(tag: string) {
    const nextTag = tag.trim();

    if (!nextTag || isReadonly) {
      return;
    }

    setValues((current) => {
      if (current.tags.some((currentTag) => currentTag.toLowerCase() === nextTag.toLowerCase())) {
        return current;
      }

      return { ...current, tags: [...current.tags, nextTag] };
    });
  }

  function removeTag(tag: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      tags: current.tags.filter((currentTag) => currentTag !== tag),
    }));
  }

  function addVariationAssignment() {
    if (isReadonly) {
      return;
    }

    if (values.variationAssignments.length >= 5) {
      toast.error("You can add up to 5 item variations.");
      return;
    }

    if (values.variationAssignments.some((assignment) => !assignment.variationId)) {
      toast.error("Select a variation before adding another row.");
      return;
    }

    setValues((current) => ({
      ...current,
      variationAssignments: [...current.variationAssignments, createEmptyVariationAssignment()],
    }));
  }

  function updateVariationAssignment(
    assignmentId: string,
    field: keyof ItemVariationAssignment,
    value: string,
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      variationAssignments: current.variationAssignments.map((assignment) => {
        if (assignment.id !== assignmentId) {
          return assignment;
        }

        if (field === "variationId") {
          if (
            value &&
            current.variationAssignments.some(
              (currentAssignment) =>
                currentAssignment.id !== assignmentId && currentAssignment.variationId === value,
            )
          ) {
            return assignment;
          }

          return {
            ...assignment,
            variationId: value,
            value: "",
          };
        }

        return { ...assignment, [field]: value };
      }),
    }));
  }

  function removeVariationAssignment(assignmentId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      variationAssignments: current.variationAssignments.filter(
        (assignment) => assignment.id !== assignmentId,
      ),
    }));
  }

  function reorderVariationAssignment(
    assignmentId: string,
    overAssignmentId: string,
    position: "after" | "before" = "before",
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      variationAssignments: reorderItemVariationAssignments(
        current.variationAssignments,
        assignmentId,
        overAssignmentId,
        position,
      ),
    }));
  }

  function updatePriceListPrice(priceListId: string, price: number) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const existingPrice = current.priceListPrices.find(
        (priceListPrice) => priceListPrice.priceListId === priceListId,
      );
      const nextPrice: ItemPriceListAssignment = {
        id: existingPrice?.id ?? `item-price-list-${Date.now()}-${priceListId}`,
        priceListId,
        price,
      };

      return {
        ...current,
        priceListPrices: existingPrice
          ? current.priceListPrices.map((priceListPrice) =>
              priceListPrice.priceListId === priceListId ? nextPrice : priceListPrice,
            )
          : [...current.priceListPrices, nextPrice],
      };
    });
  }

  function validateBeforeSubmit() {
    const nextErrors = validateItemBasicInfo(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted item fields.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isReadonly || isMutating || !validateBeforeSubmit()) {
      return;
    }

    if (mode === "edit" && existingItem) {
      try { await updateItem(updateItemRecord(existingItem, values)); } catch { return; }
      router.push(`${ItemsHref}/view/${existingItem.id}`);
      return;
    }

    if (mode === "edit") {
      toast.error("Could not find the item to update.");
      return;
    }

    try { await addItem(createItemRecord(values)); } catch { return; }
    router.push(ItemsHref);
  }

  async function handleConfirmStatusChange() {
    if (!existingItem) {
      toast.error("Could not find the item to update.");
      return;
    }

    try { await updateItem({
      ...existingItem,
      status: nextStatus,
    }); } catch { return; }
    setValues((current) => ({ ...current, status: nextStatus }));
    setIsStatusDialogOpen(false);
  }

  return {
    addVariationAssignment,
    addTag,
    addSupplier,
    variationRecords: itemVariationOptionsQuery.data,
    categoryOptions: withSavedOption(createCategorySetupOptions(setupRecords.category), existingItem?.primaryCategory, existingItem?.category),
    errors,
    existingItem,
    handleConfirmStatusChange,
    handleInputChange,
    handleSubmit,
    isMutating,
    isLoading: store.isLoading,
    isReadonly,
    isStatusDialogOpen,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    nextStatus,
    priceLists: store.priceLists,
    removeVariationAssignment,
    removeTag,
    removeSupplier,
    reorderVariationAssignment,
    responsibilityCenterOptions: withSavedOption(referenceOptionsQuery.data?.centers ?? [], existingItem?.responsibilityCenterId, existingItem?.responsibilityCenter),
    setIsStatusDialogOpen,
    taxTreatmentOptions,
    supplierOptions: createSimpleOptions(
      vendorOptionsQuery.data
        .filter((supplier) => supplier.status === ItemActiveStatus)
        .map((supplier) => supplier.name),
    ),
    uomOptions,
    updateField,
    updateVariationAssignment,
    updatePriceListPrice,
    updateSupplier,
    validateBeforeSubmit,
    values,
    warehouseOptions: createWarehouseOptions(warehouses),
    reorderSupplier,
  };
}

function applyCategoryBehavior(values: ItemFormValues, behaviors: ItemBehavior[]): ItemFormValues {
  if (behaviors.length === 0) {
    return values;
  }

  const flags = createItemBehaviorFlags(behaviors);
  const isUnchanged =
    values.behaviors.length === behaviors.length &&
    values.behaviors.every((behavior, index) => behavior === behaviors[index]) &&
    values.behavior === behaviors[0] &&
    values.asset === flags.asset &&
    values.purchasable === flags.purchasable &&
    values.sellable === flags.sellable &&
    values.service === flags.service &&
    values.trackInventory === flags.trackInventory;

  return isUnchanged
    ? values
    : {
        ...values,
        behavior: behaviors[0],
        behaviors,
        ...flags,
      };
}

function createItemBehaviorFlags(behaviors: ItemBehavior[]) {
  return behaviors.reduce(
    (flags, behavior) => {
      const behaviorFlags = ItemBehaviorFlagMap[behavior];

      return {
        asset: flags.asset || behaviorFlags.asset,
        purchasable: flags.purchasable || behaviorFlags.purchasable,
        sellable: flags.sellable || behaviorFlags.sellable,
        service: flags.service || behaviorFlags.service,
        trackInventory: flags.trackInventory || behaviorFlags.trackInventory,
      };
    },
    { asset: false, purchasable: false, sellable: false, service: false, trackInventory: false },
  );
}

const ItemBehaviorFlagMap = {
  "Sellable Item": {
    asset: false,
    purchasable: false,
    sellable: true,
    service: false,
    trackInventory: false,
  },
  "Purchasable Item": {
    asset: false,
    purchasable: true,
    sellable: false,
    service: false,
    trackInventory: false,
  },
  "Issuable Item": {
    asset: false,
    purchasable: false,
    sellable: false,
    service: false,
    trackInventory: true,
  },
  "Returnable Item": {
    asset: false,
    purchasable: false,
    sellable: false,
    service: false,
    trackInventory: true,
  },
  "Non-Inventory Item": {
    asset: false,
    purchasable: true,
    sellable: true,
    service: false,
    trackInventory: false,
  },
  "Raw Material": {
    asset: false,
    purchasable: true,
    sellable: false,
    service: false,
    trackInventory: true,
  },
  "Semi-Finished Goods/WIP": {
    asset: false,
    purchasable: false,
    sellable: false,
    service: false,
    trackInventory: true,
  },
  "Finished Goods": {
    asset: false,
    purchasable: false,
    sellable: true,
    service: false,
    trackInventory: true,
  },
  "Asset Item": { asset: true, purchasable: true, sellable: false, service: false, trackInventory: false },
  "Consumable Item": {
    asset: false,
    purchasable: true,
    sellable: false,
    service: false,
    trackInventory: true,
  },
} as const satisfies Record<
  ItemBehavior,
  Pick<ItemFormValues, "asset" | "purchasable" | "sellable" | "service" | "trackInventory">
>;

function createEmptyVariationAssignment(): ItemVariationAssignment {
  return {
    id: `item-variation-${Date.now()}`,
    variationId: "",
    value: "",
  };
}

function createItemSupplierId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `item-supplier-${crypto.randomUUID()}`
    : `item-supplier-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function reorderItemVariationAssignments(
  assignments: ItemVariationAssignment[],
  recordId: string,
  overRecordId: string,
  position: "after" | "before" = "before",
) {
  const currentIndex = assignments.findIndex((record) => record.id === recordId);
  const nextIndex = assignments.findIndex((record) => record.id === overRecordId);

  if (
    currentIndex === -1 ||
    nextIndex === -1 ||
    currentIndex === nextIndex ||
    nextIndex < 0 ||
    nextIndex >= assignments.length
  ) {
    return assignments;
  }

  const nextRecords = [...assignments];
  const [record] = nextRecords.splice(currentIndex, 1);
  const adjustedOverIndex = nextRecords.findIndex(
    (currentRecord) => currentRecord.id === overRecordId,
  );

  if (adjustedOverIndex === -1) {
    return assignments;
  }

  nextRecords.splice(position === "after" ? adjustedOverIndex + 1 : adjustedOverIndex, 0, record);

  return nextRecords;
}

function reorderSuppliers(
  suppliers: ItemSupplierAssignment[],
  recordId: string,
  overRecordId: string,
) {
  const currentIndex = suppliers.findIndex((record) => record.id === recordId);
  const nextIndex = suppliers.findIndex((record) => record.id === overRecordId);
  const movedSupplier = suppliers[currentIndex];

  if (
    currentIndex === -1 ||
    nextIndex === -1 ||
    currentIndex === nextIndex ||
    nextIndex < 0 ||
    nextIndex >= suppliers.length ||
    movedSupplier?.isDefault
  ) {
    return suppliers;
  }

  const nextRecords = [...suppliers];
  const [record] = nextRecords.splice(currentIndex, 1);
  const defaultIndex = nextRecords.findIndex((supplier) => supplier.isDefault);
  const protectedTopIndex = defaultIndex === -1 ? 0 : defaultIndex + 1;
  const insertionIndex = Math.max(nextIndex, protectedTopIndex);

  nextRecords.splice(insertionIndex, 0, record);

  return moveDefaultSupplierFirst(nextRecords);
}

function ensureDefaultSupplier(suppliers: ItemSupplierAssignment[]) {
  if (suppliers.length === 0 || suppliers.some((supplier) => supplier.isDefault)) {
    return suppliers;
  }

  return suppliers.map((supplier, index) => ({
    ...supplier,
    isDefault: index === 0,
  }));
}

function createInitialItemFormValues(item: Parameters<typeof createItemFormValues>[0]) {
  const values = createItemFormValues(item);

  return {
    ...values,
    suppliers: moveDefaultSupplierFirst(values.suppliers),
  };
}

function moveDefaultSupplierFirst(suppliers: ItemSupplierAssignment[]) {
  const defaultSupplier = suppliers.find((supplier) => supplier.isDefault);

  if (!defaultSupplier) {
    return suppliers;
  }

  return [defaultSupplier, ...suppliers.filter((supplier) => supplier.id !== defaultSupplier.id)];
}

function getActionMode(pathname: string): ItemActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

type ItemSetupOption = {
  children?: ItemSetupOption[];
  description?: string;
  label?: string;
  name: string;
  value: string;
};

function createCategorySetupOptions(records: ItemSetupRecord[]): ItemSetupOption[] {
  const activeRecords = records.filter((record) => record.status === ItemActiveStatus);
  const activeRecordIds = new Set(activeRecords.map((record) => record.id));
  const recordsByParentId = new Map<string, ItemSetupRecord[]>();

  activeRecords.forEach((record) => {
    (record.parentIds ?? []).forEach((parentId) => {
      const childRecords = recordsByParentId.get(parentId) ?? [];

      childRecords.push(record);
      recordsByParentId.set(parentId, childRecords);
    });
  });

  return activeRecords
    .filter((record) => {
      const parentIds = record.parentIds ?? [];

      return (
        parentIds.length === 0 || parentIds.every((parentId) => !activeRecordIds.has(parentId))
      );
    })
    .map((record) => createCategorySetupOption(record, recordsByParentId, new Set()));
}

function createCategorySetupOption(
  record: ItemSetupRecord,
  recordsByParentId: Map<string, ItemSetupRecord[]>,
  visitedIds: Set<string>,
): ItemSetupOption {
  const nextVisitedIds = new Set(visitedIds);

  nextVisitedIds.add(record.id);

  const children = (recordsByParentId.get(record.id) ?? [])
    .filter((childRecord) => !nextVisitedIds.has(childRecord.id))
    .map((childRecord) =>
      createCategorySetupOption(childRecord, recordsByParentId, nextVisitedIds),
    );

  return createSetupOption(record, {
    children,
    description:
      children.length > 0 ? `${record.description} Includes child categories.` : record.description,
  });
}

function createSetupOption(
  record: ItemSetupRecord,
  options: {
    children?: ItemSetupOption[];
    description?: string;
  } = {},
): ItemSetupOption {
  return {
    children: options.children?.length ? options.children : undefined,
    description: options.description ?? record.description,
    name: record.name,
    value: record.id,
  };
}

function createSimpleOptions(options: string[]) {
  return options.map((option) => ({
    name: option,
    value: option,
  }));
}


function createWarehouseOptions(warehouses: WarehouseRecord[]) {
  return warehouses
    .filter((warehouse) => warehouse.status === ItemActiveStatus)
    .map((warehouse) => ({
      description: createWarehouseDescription(warehouse),
      name: warehouse.name,
      value: warehouse.name,
    }));
}

function createWarehouseDescription(warehouse: WarehouseRecord) {
  if (warehouse.branchAvailabilityMode === "All Branches") {
    return "Available to all branches";
  }

  if (warehouse.branchAvailabilityMode === "Except Branches") {
    return warehouse.availableBranches.length > 0
      ? `Available to all branches except ${warehouse.availableBranches.join(", ")}`
      : "Available to all branches";
  }

  if (warehouse.branchAvailabilityMode === "Specific Branches") {
    return warehouse.availableBranches.length > 0
      ? `Available to ${warehouse.availableBranches.join(", ")}`
      : "No branch access selected";
  }

  return `Available to ${warehouse.branchName}`;
}

function withSavedOption(options: ItemSetupOption[], id?: string, name?: string): ItemSetupOption[] {
  const contains = (records: ItemSetupOption[]): boolean => records.some((option) => option.value === id || contains(option.children ?? []));
  return id && !contains(options) ? [...options, { value: id, name: name || id }] : options;
}
