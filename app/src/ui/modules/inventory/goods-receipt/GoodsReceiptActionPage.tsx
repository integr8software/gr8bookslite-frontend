"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GoodsReceiptHref } from "@/app/src/constants/modules/inventory/goods-receipt/GoodsReceiptConstants";
import { useGoodsReceiptActionForm } from "@/app/src/hooks/modules/inventory/goods-receipt/useGoodsReceipt";
import type { GoodsReceiptActionMode } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import {
	GoodsReceiptDetailsForm,
	type GoodsReceiptDetailsSection,
} from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptDetailsForm";
import { GoodsReceiptEntries } from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptEntries";
import { GoodsReceiptFormHeader } from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptFormHeader";
import { GoodsReceiptNotFound } from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptNotFound";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function GoodsReceiptActionPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const mode = getModeFromPathname(pathname);
	const isReadonly = mode === "view";
	const recordId =
		typeof params.recordId === "string" ? params.recordId : undefined;
	const [activeTab, setActiveTab] =
		useState<GoodsReceiptDetailsSection>("receipt");
	const receiptForm = useGoodsReceiptActionForm(mode, recordId, () => {
		router.push(GoodsReceiptHref);
	});

	if (receiptForm.isRecordMissing) {
		return <GoodsReceiptNotFound />;
	}

	return (
		<section className="grid gap-5">
			<GoodsReceiptFormHeader
				mode={mode}
				values={receiptForm.values}
				onSubmit={receiptForm.submitReceipt}
			/>
			<ModuleTabs
				activeTab={activeTab}
				ariaLabel="Goods receipt sections"
				tabs={GoodsReceiptTabs}
				onTabChange={setActiveTab}
			/>
			<GoodsReceiptDetailsForm
				isReadonly={isReadonly}
				section={activeTab}
				values={receiptForm.values}
				onUpdateField={receiptForm.updateField}
			/>
			<GoodsReceiptEntries
				isReadonly={isReadonly}
				rows={receiptForm.values.lineEntries}
				onRowsChange={receiptForm.updateLineEntries}
			/>
		</section>
	);
}

const GoodsReceiptTabs = [
	{ id: "receipt", label: "Receipt / Warehouse" },
	{ id: "references", label: "References / Project" },
] satisfies ModuleTabItem<GoodsReceiptDetailsSection>[];

function getModeFromPathname(pathname: string): GoodsReceiptActionMode {
	if (pathname.includes("/view/")) return "view";
	if (pathname.includes("/edit/")) return "edit";
	return "add";
}
