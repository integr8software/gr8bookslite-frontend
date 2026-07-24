"use client";

import { Package } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ItemsFormPageCopy } from "@/app/src/constants/modules/item-management/items/ItemManagementConstants";
import { useItemsFormPage } from "@/app/src/hooks/modules/item-management/items/useItemsFormPage";
import type {
  ItemFormErrors,
  ItemFormValues,
} from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { ItemActionButtons } from "@/app/src/ui/modules/item-management/items/ItemActionButtons";
import { ItemVariationsTable } from "@/app/src/ui/modules/item-management/items/ItemVariationsTable";
import {
  ItemInformationFields,
  ItemInventoryFields,
  ItemPricingTaxFields,
} from "@/app/src/ui/modules/item-management/items/ItemFields";
import { ItemNotFound } from "@/app/src/ui/modules/item-management/items/ItemNotFound";
import { ItemPriceListsTable } from "@/app/src/ui/modules/item-management/items/ItemPriceListsTable";
import { ItemSuppliersTable } from "@/app/src/ui/modules/item-management/items/ItemSuppliersTable";

const ItemsFormId = "items-form";

type ItemFormTabId = "item-information" | "variations" | "pricing-tax" | "inventory" | "suppliers";

type ItemFormTab = {
  badge?: number;
  content: ReactNode;
  id: ItemFormTabId;
  label: string;
};

export function ItemsFormPage() {
  const page = useItemsFormPage();
  const copy = ItemsFormPageCopy[page.mode];
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ItemFormTabId>("item-information");
  const {
    closeDialog: closeSaveDialog,
    isConfirmSubmitPending,
    submitFromDialog,
  } = useAppDialogFormSubmit({
    formId: ItemsFormId,
    isDialogOpen: isSaveDialogOpen,
    isSubmitting: page.isMutating,
    onDialogOpenChange: setIsSaveDialogOpen,
  });

  if (page.needsRecord && !page.existingItem) {
    return <ItemNotFound />;
  }

  const itemFieldsProps = {
    categoryOptions: page.categoryOptions,
    errors: page.errors,
    isReadonly: page.isReadonly,
    responsibilityCenterOptions: page.responsibilityCenterOptions,
    taxTreatmentOptions: page.taxTreatmentOptions,
    uomOptions: page.uomOptions,
    values: page.values,
    warehouseOptions: page.warehouseOptions,
    onAddTag: page.addTag,
    onFieldChange: page.updateField,
    onInputChange: page.handleInputChange,
    onRemoveTag: page.removeTag,
  };
  const tabs: ItemFormTab[] = [
    {
      badge: countErrors(page.errors, [
        "code",
        "skuCode",
        "name",
        "model",
        "externalReferenceCode",
        "brand",
        "barcode",
        "primaryCategory",
        "uom",
        "responsibilityCenter",
        "description",
        "tags",
      ]),
      content: <ItemInformationFields {...itemFieldsProps} />,
      id: "item-information",
      label: "Basic Information",
    },
    {
      badge: countErrors(page.errors, ["variationAssignments"]),
      content: (
        <ItemVariationsTable
          assignments={page.values.variationAssignments}
          variations={page.variationRecords}
          isReadonly={page.isReadonly}
          onAddAssignment={page.addVariationAssignment}
          onRemoveAssignment={page.removeVariationAssignment}
          onReorderAssignment={page.reorderVariationAssignment}
          onUpdateAssignment={page.updateVariationAssignment}
        />
      ),
      id: "variations",
      label: "Variations",
    },
    {
      badge: countErrors(page.errors, [
        "costPrice",
        "sellingPrice",
        "taxTreatment",
        "priceListPrices",
      ]),
      content: (
        <div className="grid gap-5">
          <ItemPricingTaxFields {...itemFieldsProps} />
          <ItemPriceListsTable
            isReadonly={page.isReadonly}
            priceLists={page.priceLists}
            values={page.values}
            onUpdatePrice={page.updatePriceListPrice}
          />
        </div>
      ),
      id: "pricing-tax",
      label: "Pricing",
    },
    {
      badge: countErrors(page.errors, [
        "defaultWarehouse",
        "defaultLocation",
        "defaultZone",
        "defaultRack",
        "defaultShelf",
        "defaultBin",
        "defaultLotNo",
        "leadTime",
        "reorderLevel",
        "minimumStock",
        "maximumStock",
      ]),
      content: <ItemInventoryFields {...itemFieldsProps} />,
      id: "inventory",
      label: "Inventory",
    },
    {
      badge: countErrors(page.errors, ["suppliers"]),
      content: (
        <ItemSuppliersTable
          error={page.errors.suppliers}
          isReadonly={page.isReadonly}
          supplierOptions={page.supplierOptions}
          suppliers={page.values.suppliers}
          onAddSupplier={page.addSupplier}
          onReorderSupplier={page.reorderSupplier}
          onRemoveSupplier={page.removeSupplier}
          onUpdateSupplier={page.updateSupplier}
        />
      ),
      id: "suppliers",
      label: "Suppliers",
    },
  ];
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <>
      <form id={ItemsFormId} onSubmit={page.handleSubmit} className="grid gap-5">
        <ModuleHeader
          variant="panel"
          titleAs="h1"
          title={page.mode === "view" && page.existingItem ? page.existingItem.name : copy.title}
          description={copy.description}
          actionsClassName="w-full sm:w-auto sm:justify-end"
          eyebrow={
            <>
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              Item management
            </>
          }
          actions={
            <ItemActionButtons
              isReadonly={page.isReadonly}
              item={page.existingItem}
              mode={page.mode}
              nextStatus={page.existingItem ? page.nextStatus : undefined}
              onSave={() => {
                if (page.validateBeforeSubmit()) {
                  setIsSaveDialogOpen(true);
                }
              }}
              onStatusChange={() => page.setIsStatusDialogOpen(true)}
            />
          }
        />

        <ModuleTabs
          activeTab={activeTab}
          ariaLabel="Item setup sections"
          tabClassName="w-40 justify-center"
          tabs={tabs}
          onTabChange={setActiveTab}
        />
        {activeTabContent}
      </form>

      <AppDialog
        confirmLabel="Confirm"
        description={
          page.mode === "edit"
            ? "This will update the selected item with your latest changes."
            : "This will create a new item using the details you entered."
        }
        iconTone="question"
        isOpen={isSaveDialogOpen}
        isPending={isConfirmSubmitPending}
        pendingLabel={getModuleSavePendingLabel(page.mode)}
        title={page.mode === "edit" ? "Save item changes?" : "Save this item?"}
        tone="success"
        onCancel={closeSaveDialog}
        onConfirm={submitFromDialog}
      />

      <AppDialog
        isOpen={page.isStatusDialogOpen}
        isPending={page.isMutating}
        title={page.nextStatus === "Inactive" ? "Set item inactive?" : "Reactivate item?"}
        description={`This will mark ${page.existingItem?.name ?? "the selected item"} as ${page.nextStatus.toLowerCase()}.`}
        confirmLabel={page.nextStatus === "Inactive" ? "Set Inactive" : "Reactivate"}
        tone={page.nextStatus === "Inactive" ? "deactivate" : "activate"}
        onCancel={() => page.setIsStatusDialogOpen(false)}
        onConfirm={page.handleConfirmStatusChange}
      />
    </>
  );
}

function countErrors(
  errors: ItemFormErrors,
  fields: readonly (keyof ItemFormValues | "suppliers")[],
) {
  return fields.reduce((count, field) => count + (errors[field] ? 1 : 0), 0);
}
