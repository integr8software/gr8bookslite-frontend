"use client";

import { ChevronDown, Printer } from "lucide-react";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import { openPurchaseRequestPdf } from "./PurchaseRequestPdf";
import { PurchaseRequestPrintPreview } from "./PurchaseRequestPrintPreview";

type PurchaseRequestPreviewDrawerProps = {
	isOpen: boolean;
	onClose: () => void;
	record: PurchaseRequestRecord;
};

export function PurchaseRequestPreviewDrawer({
	isOpen,
	onClose,
	record,
}: PurchaseRequestPreviewDrawerProps) {
	return (
		<ModuleDrawer
			className="purchase-request-preview-drawer"
			isOpen={isOpen}
			eyebrow="Purchasing document"
			title="Print Preview"
			description="Review the printable purchase request layout."
			maxWidthClassName="max-w-6xl"
			onClose={onClose}
			position="bottom"
			showCloseButton={false}
			actions={
				<button
					type="button"
					onClick={() => openPurchaseRequestPdf(record)}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Printer className="h-4 w-4" aria-hidden="true" />
					Print
				</button>
			}
		>
			<button
				type="button"
				onClick={onClose}
				aria-label="Close print preview"
				className="absolute left-1/2 top-0 z-10 inline-flex h-10 w-28 -translate-x-1/2  items-center justify-center rounded-b-lg border border-t-0 border-darknavy/10 bg-white text-darknavy shadow-[0_-8px_28px_rgba(33,39,56,0.08)] transition hover:border-skyblue/35 hover:bg-skyblue/30"
			>
				<ChevronDown className="h-5 w-5" aria-hidden="true" />
			</button>
			<div className="p-6">
				<PurchaseRequestPrintPreview
					record={record}
					showControls={false}
				/>
			</div>
		</ModuleDrawer>
	);
}
