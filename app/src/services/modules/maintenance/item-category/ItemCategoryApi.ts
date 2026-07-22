import { ItemCategoryApiPath } from "@/app/src/constants/modules/maintenance/item-category/ItemCategoryConstants";
import { ItemBehaviorOptions } from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import {
	createItemCategoryRows,
	normalizeItemCategoryAccountingSetup,
} from "@/app/src/data/modules/maintenance/item-category/ItemCategoryData";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	ApiItemCategory,
	ApiItemCategoryAccountingSetupMode,
	ApiItemCategoryListResponse,
	ApiItemCategoryOptionsResponse,
	ApiItemCategorySaveResponse,
	ApiItemCategoryStatus,
	ItemCategoryFormValues,
	ItemBehavior,
	ItemCategoryListResponse,
	ItemCategoryTableRowData,
	ItemSetupKind,
	ItemSetupRecord,
	ItemStatus,
} from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";

export async function fetchItemCategories(): Promise<ItemCategoryListResponse> {
	const response =
		await ApiClient.get<ApiItemCategoryListResponse>(ItemCategoryApiPath);

	return mapApiItemCategoryListResponse(response.data);
}

export async function fetchItemCategoryOptions(): Promise<ItemSetupRecord[]> {
	const response = await ApiClient.get<ApiItemCategoryOptionsResponse>(
		`${ItemCategoryApiPath}/options`,
	);

	return response.data.categories.map((category) => ({
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
	const response = await ApiClient.post<ApiItemCategorySaveResponse>(
		ItemCategoryApiPath,
		toApiItemCategoryPayload(values),
	);

	return mapApiItemCategory(response.data.category);
}

export async function updateItemCategory({
	id,
	values,
}: {
	id: string;
	values: ItemCategoryFormValues;
}): Promise<ItemCategoryTableRowData> {
	const response = await ApiClient.patch<ApiItemCategorySaveResponse>(
		`${ItemCategoryApiPath}/${id}`,
		toApiItemCategoryPayload(values),
	);

	return mapApiItemCategory(response.data.category);
}

function mapApiItemCategoryListResponse(
	response: ApiItemCategoryListResponse,
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

function mapApiItemCategory(
	category: ApiItemCategory,
): ItemCategoryTableRowData {
	return createRowsFromApiCategories([category])[0];
}

function createRowsFromApiCategories(categories: ApiItemCategory[]) {
	const records = categories.map(mapApiItemCategoryRecord);
	const setupRecords: Record<ItemSetupKind, ItemSetupRecord[]> = {
		category: records,
		subcategory: [],
		type: [],
		subtype: [],
	};
	const apiCategoryById = new Map(
		categories.map((category) => [category.id, category]),
	);

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
			inheritedAccountingSourceName:
				apiCategory.inheritedAccountingSourceName ?? undefined,
			usedByItemCount: apiCategory.usedByItemCount,
		};
	});
}

function mapApiItemCategoryRecord(category: ApiItemCategory): ItemSetupRecord {
	return {
		id: category.id,
		code: category.code,
		name: category.name,
		description: category.description ?? "",
		parentIds: category.parentId ? [category.parentId] : [],
		accountingSetupMode: mapAccountingSetupModeFromApi(
			category.accountingSetupMode,
		),
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
		updatedAt: category.updatedAt,
	};
}

function toApiItemCategoryPayload(values: ItemCategoryFormValues) {
	return {
		name: values.name.trim(),
		parentId: values.parentId || null,
		description: values.description.trim(),
		accountingSetupMode: mapAccountingSetupModeToApi(
			values.accountingSetupMode,
		),
		requiresInventoryAccount: values.requiresInventoryAccount,
		requiresSalesAccount: values.requiresSalesAccount,
		requiresCostOfSalesAccount: values.requiresCostOfSalesAccount,
		requiresExpenseAccount: values.requiresExpenseAccount,
		behaviors: values.behaviors,
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
				.map(
					(behavior) =>
						LegacyItemBehaviorAliases[behavior] ?? behavior,
				)
				.filter(
					(behavior): behavior is ItemBehavior =>
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

function mapAccountingSetupModeFromApi(
	value: ApiItemCategoryAccountingSetupMode,
) {
	return value === "AUTO_CREATE" ? "own" : "inherit";
}

function mapAccountingSetupModeToApi(
	value: ItemCategoryFormValues["accountingSetupMode"],
): ApiItemCategoryAccountingSetupMode {
	return value === "own" ? "AUTO_CREATE" : "INHERIT";
}

function mapStatusFromApi(value: ApiItemCategoryStatus): ItemStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: ItemStatus): ApiItemCategoryStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}
