import { ItemBehaviorOptions } from "@/app/src/constants/modules/item-management/items/ItemManagementConstants";
import {
  createItemCategoryRows,
  normalizeItemCategoryAccountingSetup,
} from "@/app/src/data/modules/item-management/item-category/ItemCategoryData";
import {
  itemCategoryControllerCreateV1,
  itemCategoryControllerFindAllV1,
  itemCategoryControllerFindOptionsV1,
  itemCategoryControllerUpdateV1,
} from "@/app/src/generated/api/item-category/item-category";
import type {
  CreateItemCategoryDto,
  CreateItemCategoryDtoAccountingSetupMode,
  CreateItemCategoryDtoBehaviors,
  CreateItemCategoryDtoStatus,
  ItemCategoryResponseDto,
  ItemCategoryResponseDtoAccountingSetupMode,
  ItemCategoryResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  ItemCategoryFormValues,
  ItemBehavior,
  ItemCategoryListResponse,
  ItemCategoryTableRowData,
  ItemSetupKind,
  ItemSetupRecord,
  ItemStatus,
} from "@/app/src/types/modules/item-management/item-category/ItemCategoryTypes";

export async function fetchItemCategories(): Promise<ItemCategoryListResponse> {
  const response = await itemCategoryControllerFindAllV1();

  return mapApiItemCategoryListResponse(response);
}

export async function fetchItemCategoryOptions(): Promise<ItemSetupRecord[]> {
  const response = await itemCategoryControllerFindOptionsV1();

  return response.categories.map((category) => ({
    id: category.id,
    code: category.code,
    name: category.name,
    description: category.description ?? "",
    parentIds: category.parentId ? [category.parentId] : [],
    behaviors: normalizeItemCategoryBehaviors(category.behaviors),
    accountingSetupMode: "inherit",
    allowSubCategory: category.allowSubCategory,
    status: mapStatusFromApi(category.status),
  }));
}

export async function createItemCategory(
  values: ItemCategoryFormValues,
): Promise<ItemCategoryTableRowData> {
  const response = await itemCategoryControllerCreateV1(toApiItemCategoryPayload(values));

  return mapApiItemCategory(response.category);
}

export async function updateItemCategory({
  id,
  values,
}: {
  id: string;
  values: ItemCategoryFormValues;
}): Promise<ItemCategoryTableRowData> {
  const response = await itemCategoryControllerUpdateV1(id, toApiItemCategoryPayload(values));

  return mapApiItemCategory(response.category);
}

function mapApiItemCategoryListResponse(
  response: Awaited<ReturnType<typeof itemCategoryControllerFindAllV1>>,
): ItemCategoryListResponse {
  const records = response.categories.map(mapApiItemCategoryRecord);
  const categories = createRowsFromApiCategories(response.categories);

  return {
    categories,
    records,
    permissions: response.permissions,
    statistics: response.statistics,
  };
}

function mapApiItemCategory(category: ItemCategoryResponseDto): ItemCategoryTableRowData {
  return createRowsFromApiCategories([category])[0];
}

function createRowsFromApiCategories(categories: ItemCategoryResponseDto[]) {
  const records = categories.map(mapApiItemCategoryRecord);
  const setupRecords: Record<ItemSetupKind, ItemSetupRecord[]> = {
    category: records,
    subcategory: [],
    type: [],
    subtype: [],
  };
  const apiCategoryById = new Map(categories.map((category) => [category.id, category]));

  return createItemCategoryRows({
    expandedIds: new Set(records.map((record) => record.id)),
    items: [],
    setupRecords,
  }).map((row) => {
    const apiCategory = apiCategoryById.get(row.record.id);

    if (!apiCategory) {
      return row;
    }

    return {
      ...row,
      effectiveAccountingSetup: apiCategory.effectiveAccountingSetup,
      inheritedAccountingSourceName: apiCategory.inheritedAccountingSourceName ?? undefined,
      usedByItemCount: apiCategory.usedByItemCount,
    };
  });
}

function mapApiItemCategoryRecord(category: ItemCategoryResponseDto): ItemSetupRecord {
  return {
    id: category.id,
    code: category.code,
    name: category.name,
    description: category.description ?? "",
    parentIds: category.parentId ? [category.parentId] : [],
    accountingSetupMode: mapAccountingSetupModeFromApi(category.accountingSetupMode),
    accountingSetup: normalizeItemCategoryAccountingSetup(
      category.accountingSetup ?? category.effectiveAccountingSetup,
    ),
    requiresInventoryAccount: category.requiresInventoryAccount,
    requiresSalesAccount: category.requiresSalesAccount,
    requiresCostOfSalesAccount: category.requiresCostOfSalesAccount,
    requiresExpenseAccount: category.requiresExpenseAccount,
    behaviors: normalizeItemCategoryBehaviors(category.behaviors),
    allowSubCategory: category.allowSubCategory,
    status: mapStatusFromApi(category.status),
    createdBy: category.createdBy ?? undefined,
    createdAt: category.createdAt,
    updatedBy: category.updatedBy ?? undefined,
    updatedAt: category.updatedAt ?? undefined,
  };
}

function toApiItemCategoryPayload(values: ItemCategoryFormValues): CreateItemCategoryDto {
  return {
    name: values.name.trim(),
    parentId: values.parentId || null,
    description: values.description.trim(),
    accountingSetupMode: mapAccountingSetupModeToApi(values.accountingSetupMode),
    requiresInventoryAccount: values.requiresInventoryAccount,
    requiresSalesAccount: values.requiresSalesAccount,
    requiresCostOfSalesAccount: values.requiresCostOfSalesAccount,
    requiresExpenseAccount: values.requiresExpenseAccount,
    behaviors: values.behaviors.map(mapBehaviorToApi),
    allowSubCategory: values.allowSubCategory,
    status: mapStatusToApi(values.status),
  };
}

function normalizeItemCategoryBehaviors(
  behaviors: readonly string[] | null | undefined,
): ItemBehavior[] {
  const supportedBehaviors = [
    ...new Set(
      (behaviors ?? [])
        .map((behavior) => LegacyItemBehaviorAliases[behavior] ?? behavior)
        .filter((behavior): behavior is ItemBehavior =>
          ItemBehaviorOptions.includes(behavior as ItemBehavior),
        ),
    ),
  ];

  return supportedBehaviors.length > 0
    ? supportedBehaviors
    : ["Sellable Item", "Purchasable Item", "Issuable Item", "Returnable Item"];
}

const LegacyItemBehaviorAliases: Record<string, ItemBehavior> = {
  "Issueable Item": "Issuable Item",
  "Semi-Finished Goods / WIP": "Semi-Finished Goods/WIP",
  Asset: "Asset Item",
};

function mapAccountingSetupModeFromApi(value: ItemCategoryResponseDtoAccountingSetupMode) {
  return value === "AUTO_CREATE" ? "own" : "inherit";
}

function mapAccountingSetupModeToApi(
  value: ItemCategoryFormValues["accountingSetupMode"],
): CreateItemCategoryDtoAccountingSetupMode {
  return value === "own" ? "AUTO_CREATE" : "INHERIT";
}

function mapBehaviorToApi(value: ItemBehavior): CreateItemCategoryDtoBehaviors {
  return value as CreateItemCategoryDtoBehaviors;
}

function mapStatusFromApi(value: ItemCategoryResponseDtoStatus): ItemStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: ItemStatus): CreateItemCategoryDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}
