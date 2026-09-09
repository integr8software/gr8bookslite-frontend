import { responsibilityCenterControllerFindOptionsV1 } from "@/app/src/generated/api/responsibility-center/responsibility-center";
import { unitOfMeasurementControllerFindOptionsV1 } from "@/app/src/generated/api/unit-of-measurement/unit-of-measurement";
import axios from "axios";
import {
  itemsControllerCreateV1,
  itemsControllerFindAllV1,
  itemsControllerGetPricingV1,
  itemsControllerUpdateV1,
  itemsControllerUpsertPricingV1,
} from "@/app/src/generated/api/items/items";
import type { CreateItemBasicInfoDto, ItemBasicInfoResponseDto, UpsertItemPricingDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { ItemInitialFormValues } from "@/app/src/data/modules/item-management/items/ItemManagementData";
import {
  ItemActiveStatus,
  ItemInactiveStatus,
} from "@/app/src/constants/modules/item-management/items/ItemManagementConstants";
import type { ItemRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";

export async function fetchItems(): Promise<ItemRecord[]> {
  return (await itemsControllerFindAllV1()).items.map(mapItem);
}

export async function createItem(item: ItemRecord): Promise<ItemRecord> {
  const created = await itemsControllerCreateV1(toPayload(item));
  if (item.costPrice || item.sellingPrice || item.suggestedPrice || item.taxTreatment) {
    const pricing = await itemsControllerUpsertPricingV1(created.id, toPricingPayload(item));
    return mapItem({
      ...created,
      costPrice: pricing.cost,
      sellingPrice: pricing.sellingPrice,
      suggestedPrice: pricing.suggestedPrice,
      taxTreatment: pricing.taxTreatment,
    });
  }
  return mapItem(created);
}

export async function saveItem(item: ItemRecord): Promise<ItemRecord> {
  const updated = await itemsControllerUpdateV1(item.id, toPayload(item));
  const pricing = await itemsControllerUpsertPricingV1(item.id, toPricingPayload(item));
  return mapItem({
    ...updated,
    costPrice: pricing.cost,
    sellingPrice: pricing.sellingPrice,
    suggestedPrice: pricing.suggestedPrice,
    taxTreatment: pricing.taxTreatment,
  });
}

export async function fetchItemPricing(id: string) {
  return itemsControllerGetPricingV1(id);
}

export async function saveItemPricing(id: string, pricing: UpsertItemPricingDto) {
  return itemsControllerUpsertPricingV1(id, pricing);
}

export async function deactivateItem(id: string) {
  await itemsControllerUpdateV1(id, { status: "INACTIVE" });
  return id;
}

function toPricingPayload(item: ItemRecord): UpsertItemPricingDto {
  return {
    cost: item.costPrice,
    sellingPrice: item.sellingPrice,
    suggestedPrice: item.suggestedPrice,
    taxTreatment: item.taxTreatment || null,
  };
}

function toPayload(item: ItemRecord): CreateItemBasicInfoDto {
  return {
    suppliers: item.suppliers.map((row) => ({ supplierId: row.supplier, supplierCode: row.supplierItemCode.trim(), leadTime: row.leadTime.trim(), cost: row.lastCost, isDefault: row.isDefault })),
    code: item.code.trim(), skuCode: item.skuCode.trim(), name: item.name.trim(),
    barcode: item.barcode.trim(), categoryId: item.primaryCategory,
    unitOfMeasurementId: item.unitOfMeasurementId ?? item.uom,
    responsibilityCenterId: (item.responsibilityCenterId ?? item.responsibilityCenter) || null,
    brand: item.brand.trim(), model: item.model.trim(),
    externalReferenceCode: item.externalReferenceCode.trim(), description: item.description.trim(),
    tags: item.tags.map((tag) => tag.trim()), status: item.status === ItemActiveStatus ? "ACTIVE" : "INACTIVE",
  };
}

function mapItem(item: ItemBasicInfoResponseDto): ItemRecord {
  return {
    ...ItemInitialFormValues, id: item.id, code: item.code, skuCode: item.skuCode ?? "", name: item.name,
    barcode: item.barcode ?? "", primaryCategory: item.categoryId, category: item.categoryName,
    categories: [item.categoryName], uom: item.unitOfMeasurementSymbol,
    unitOfMeasurementId: item.unitOfMeasurementId,
    responsibilityCenter: item.responsibilityCenterName, responsibilityCenterId: item.responsibilityCenterId ?? "",
    brand: item.brand ?? "", model: item.model ?? "", externalReferenceCode: item.externalReferenceCode ?? "",
    description: item.description ?? "", tags: item.tags ?? [], status: item.status === "INACTIVE" ? ItemInactiveStatus : ItemActiveStatus,
    costPrice: item.costPrice ?? 0,
    sellingPrice: item.sellingPrice ?? 0,
    suggestedPrice: item.suggestedPrice ?? 0,
    taxTreatment: item.taxTreatment ?? "",
    supplier: item.suppliers?.find((row) => row.isDefault)?.supplierName ?? "",
    suppliers: (item.suppliers ?? []).map((row) => ({ id: row.id, supplier: row.supplierId, supplierName: row.supplierName, supplierItemCode: row.supplierCode ?? "", leadTime: row.leadTime ?? "", lastCost: row.cost, isDefault: row.isDefault })),
  };
}

export function itemSaveError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.filter((value) => typeof value === "string").join(" ");
  }
  return "Could not save the item. Please try again.";
}

export async function fetchItemReferenceOptions() {
  const [centers, units] = await Promise.all([responsibilityCenterControllerFindOptionsV1(), unitOfMeasurementControllerFindOptionsV1()]);
  return {
    centers: centers.responsibilityCenters.map((center) => ({ name: center.name, value: center.id, description: center.code })),
    units: units.units.map((unit) => ({ name: unit.name, value: unit.id, description: unit.symbol })),
  };
}
