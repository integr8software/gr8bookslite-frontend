export const ItemAttributesQueryKeys = {
	all: () => ["maintenance", "item-attributes"] as const,
	attributes: () => ["maintenance", "item-attributes", "attributes"] as const,
};
