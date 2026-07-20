export const WarehouseStockInquiryQueryKeys = {
	all: () => ["maintenance", "warehouse-stock-inquiry"] as const,
	list: () => [...WarehouseStockInquiryQueryKeys.all(), "list"] as const,
};
