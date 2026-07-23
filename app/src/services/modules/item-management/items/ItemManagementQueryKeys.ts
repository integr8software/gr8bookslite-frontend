import type { ItemSetupKind } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";

export const ItemManagementQueryKeys = {
  itemVariations: () => ["maintenance", "item-variations"] as const,
  itemBundles: () => ["maintenance", "item-bundles"] as const,
  itemSuppliers: () => ["maintenance", "item-suppliers"] as const,
  priceLists: () => ["maintenance", "price-lists"] as const,
  items: () => ["maintenance", "items"] as const,
  itemVariationOptions: () => ["maintenance", "items", "variation-options"] as const,
  itemCategoryOptions: () => ["maintenance", "items", "category-options"] as const,
  vendorOptions: () => ["maintenance", "items", "vendor-options"] as const,
  setupRecords: (kind: ItemSetupKind) => ["maintenance", kind] as const,
};
