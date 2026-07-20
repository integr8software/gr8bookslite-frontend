import type { GoodsReceiptFormValues } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import {
	DateField,
	TextField,
	type GoodsReceiptFieldUpdater,
} from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptFieldControls";

type GoodsReceiptReferenceFieldsProps = {
	isReadonly: boolean;
	values: GoodsReceiptFormValues;
	onUpdateField: GoodsReceiptFieldUpdater<GoodsReceiptFormValues>;
};

export function GoodsReceiptReferenceFields({
	isReadonly,
	onUpdateField,
	values,
}: GoodsReceiptReferenceFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4">
				<TextField
					id="goods-receipt-transaction-no"
					label="GR No."
					isRequired
					readOnly={isReadonly}
					value={values.transactionNo}
					onChange={(value) => onUpdateField("transactionNo", value)}
				/>
				<DateField
					id="goods-receipt-document-date"
					label="Document Date"
					readOnly={isReadonly}
					value={values.documentDate}
					onChange={(value) => onUpdateField("documentDate", value)}
				/>
				<TextField
					id="goods-receipt-status"
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					onChange={(value) => onUpdateField("status", value)}
				/>
				<TextField
					id="goods-receipt-ic-no"
					label="IC No."
					readOnly={isReadonly}
					value={values.icNo}
					onChange={(value) => onUpdateField("icNo", value)}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<TextField
					id="goods-receipt-gi-no"
					label="GI No."
					readOnly={isReadonly}
					value={values.giNo}
					onChange={(value) => onUpdateField("giNo", value)}
				/>
				<TextField
					id="goods-receipt-si-ref"
					label="SI Ref."
					readOnly={isReadonly}
					value={values.siRef}
					onChange={(value) => onUpdateField("siRef", value)}
				/>
				<TextField
					id="goods-receipt-project-ref"
					label="ProjectRef"
					readOnly={isReadonly}
					value={values.projectRef}
					onChange={(value) => onUpdateField("projectRef", value)}
				/>
				<TextField
					id="goods-receipt-project-name"
					label="Project Name"
					readOnly={isReadonly}
					value={values.projectName}
					onChange={(value) => onUpdateField("projectName", value)}
				/>
			</div>
		</div>
	);
}
