import { ItemAttributesApiPath } from "@/app/src/constants/modules/maintenance/item-attributes/ItemAttributesConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	ApiItemAttribute,
	ApiItemAttributeSaveResponse,
	ApiItemAttributeStatus,
	ApiItemAttributeUsage,
	ApiItemAttributeValueStatus,
	ApiItemAttributesListResponse,
	ItemAttributeFormValues,
	ItemAttributeRecord,
	ItemAttributeStatus,
	ItemAttributeUsage,
	ItemAttributeValueStatus,
	ItemAttributesListResponse,
} from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";
import type { ItemAttributeRecord as ItemFormAttributeRecord } from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";

export async function fetchItemAttributes(): Promise<ItemAttributesListResponse> {
	const response = await ApiClient.get<ApiItemAttributesListResponse>(
		ItemAttributesApiPath,
		{ timeout: 5000 },
	);

	return {
		attributes: response.data.attributes.map(mapApiItemAttribute),
		permissions: response.data.permissions,
		statistics: response.data.statistics,
	};
}

export async function fetchItemAttributeOptions(): Promise<
	ItemFormAttributeRecord[]
> {
	const response = await ApiClient.get<ApiItemAttributesListResponse>(
		`${ItemAttributesApiPath}/options`,
	);

	return response.data.attributes.map((attribute) => ({
		id: attribute.id,
		code: attribute.code,
		name: attribute.name,
		usage: mapUsageFromApi(attribute.usage),
		values: attribute.values
			.filter((value) => value.status === "ACTIVE" && value.isUsed)
			.map((value) => value.label),
		requiredOnItem: attribute.requiredOnItem,
		affectsStock: attribute.affectsStock,
		status: mapStatusFromApi(attribute.status),
	}));
}

export async function createItemAttribute(
	values: ItemAttributeFormValues,
): Promise<ItemAttributeRecord> {
	const response = await ApiClient.post<ApiItemAttributeSaveResponse>(
		ItemAttributesApiPath,
		toApiItemAttributePayload(values),
	);

	return mapApiItemAttribute(response.data.attribute);
}

export async function updateItemAttribute(
	attribute: ItemAttributeRecord,
): Promise<ItemAttributeRecord> {
	const response = await ApiClient.patch<ApiItemAttributeSaveResponse>(
		`${ItemAttributesApiPath}/${attribute.id}`,
		toApiItemAttributePayload(attribute),
	);

	return mapApiItemAttribute(response.data.attribute);
}

function mapApiItemAttribute(attribute: ApiItemAttribute): ItemAttributeRecord {
	return {
		id: attribute.id,
		code: attribute.code,
		name: attribute.name,
		usage: mapUsageFromApi(attribute.usage),
		values: attribute.values.map((value) => ({
			id: value.id,
			label: value.label,
			isUsed: value.isUsed,
			status: mapValueStatusFromApi(value.status),
		})),
		requiredOnItem: attribute.requiredOnItem,
		affectsStock: attribute.affectsStock,
		status: mapStatusFromApi(attribute.status),
	};
}

function toApiItemAttributePayload(
	attribute: ItemAttributeRecord | ItemAttributeFormValues,
) {
	return {
		name: attribute.name.trim(),
		usage: "usage" in attribute ? mapUsageToApi(attribute.usage) : undefined,
		values: attribute.values.map((value, index) => ({
			id: value.id,
			label: value.label.trim(),
			isUsed: value.isUsed,
			sortOrder: index + 1,
			status: mapValueStatusToApi(value.status),
		})),
		requiredOnItem:
			"requiredOnItem" in attribute ? attribute.requiredOnItem : undefined,
		affectsStock: "affectsStock" in attribute ? attribute.affectsStock : undefined,
		status: mapStatusToApi(attribute.status),
	};
}

function mapStatusFromApi(value: ApiItemAttributeStatus): ItemAttributeStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: ItemAttributeStatus): ApiItemAttributeStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function mapValueStatusFromApi(
	value: ApiItemAttributeValueStatus,
): ItemAttributeValueStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapValueStatusToApi(
	value: ItemAttributeValueStatus,
): ApiItemAttributeValueStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function mapUsageFromApi(value: ApiItemAttributeUsage): ItemAttributeUsage {
	if (value === "STOCK_CLASSIFICATION") return "Stock Classification";
	if (value === "VARIANT") return "Variant";
	return "Item Detail";
}

function mapUsageToApi(value: ItemAttributeUsage): ApiItemAttributeUsage {
	if (value === "Stock Classification") return "STOCK_CLASSIFICATION";
	if (value === "Variant") return "VARIANT";
	return "ITEM_DETAIL";
}
