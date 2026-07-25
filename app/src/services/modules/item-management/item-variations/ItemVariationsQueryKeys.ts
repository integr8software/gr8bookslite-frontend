export const ItemVariationsQueryKeys = {
	all: () => ["maintenance", "item-variations"] as const,
	variations: () => ["maintenance", "item-variations", "variations"] as const,
};
