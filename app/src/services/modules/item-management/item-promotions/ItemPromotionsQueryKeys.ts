export const ItemPromotionsQueryKeys = {
	all: ["maintenance", "item-promotions"] as const,
	list: () => [...ItemPromotionsQueryKeys.all, "list"] as const,
};
