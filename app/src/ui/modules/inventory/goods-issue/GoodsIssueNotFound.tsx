import { FileX2 } from "lucide-react";
import { GoodsIssueHref } from "@/app/src/constants/modules/inventory/goods-issue/GoodsIssueConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function GoodsIssueNotFound() {
	return (
		<ModuleNotFound
			actionHref={GoodsIssueHref}
			actionLabel="Back to goods issues"
			icon={<FileX2 className="h-5 w-5" aria-hidden="true" />}
			title="Goods issue not found"
			description="The goods issue may have been removed or the link is no longer valid."
		/>
	);
}
