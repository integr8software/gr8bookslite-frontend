import type { GoodsReceiptFormValues } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import type { GoodsReceiptFieldUpdater } from "@/app/src/ui/modules/inventory/goods-receipt/action/GoodsReceiptFieldControls";
import { GoodsReceiptWarehouseFields } from "@/app/src/ui/modules/inventory/goods-receipt/action/GoodsReceiptWarehouseFields";

type GoodsReceiptDetailsFormProps = {
	isReadonly: boolean;
	values: GoodsReceiptFormValues;
	onUpdateField: GoodsReceiptFieldUpdater<GoodsReceiptFormValues>;
};

export function GoodsReceiptDetailsForm({
	isReadonly,
	onUpdateField,
	values,
}: GoodsReceiptDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			<GoodsReceiptWarehouseFields
				isReadonly={isReadonly}
				values={values}
				onUpdateField={onUpdateField}
			/>
		</section>
	);
}
