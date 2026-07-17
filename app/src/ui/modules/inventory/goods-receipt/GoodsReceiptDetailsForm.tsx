import type { GoodsReceiptFormValues } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import type { GoodsReceiptFieldUpdater } from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptFieldControls";
import { GoodsReceiptWarehouseFields } from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptWarehouseFields";
import { GoodsReceiptReferenceFields } from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptReferenceFields";

export type GoodsReceiptDetailsSection = "receipt" | "references";

type GoodsReceiptDetailsFormProps = {
	isReadonly: boolean;
	section: GoodsReceiptDetailsSection;
	values: GoodsReceiptFormValues;
	onUpdateField: GoodsReceiptFieldUpdater<GoodsReceiptFormValues>;
};

export function GoodsReceiptDetailsForm({
	isReadonly,
	onUpdateField,
	section,
	values,
}: GoodsReceiptDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			{section === "receipt" ? (
				<GoodsReceiptWarehouseFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "references" ? (
				<GoodsReceiptReferenceFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
		</section>
	);
}
