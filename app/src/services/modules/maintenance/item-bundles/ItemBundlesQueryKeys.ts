export const ItemBundlesQueryKeys = {
	all: ["maintenance", "item-bundles"] as const,
	list: () => [...ItemBundlesQueryKeys.all, "list"] as const,
};
