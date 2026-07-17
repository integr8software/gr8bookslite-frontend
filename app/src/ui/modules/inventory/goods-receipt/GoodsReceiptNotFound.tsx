import { FileX2 } from "lucide-react";
import { GoodsReceiptHref } from "@/app/src/constants/modules/inventory/goods-receipt/GoodsReceiptConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function GoodsReceiptNotFound() {
	return (
		<ModuleNotFound
			actionHref={GoodsReceiptHref}
			actionLabel="Back to goods receipts"
			icon={<FileX2 className="h-5 w-5" aria-hidden="true" />}
			title="Goods receipt not found"
			description="The goods receipt may have been removed or the link is no longer valid."
		/>
	);
}
