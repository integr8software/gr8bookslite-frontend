import {
	GoodsReceiptPartyOptions,
	GoodsReceiptTransactionTypeOptions,
	GoodsReceiptWarehouseOptions,
} from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import type { GoodsReceiptFormValues } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
	AttachedDropdown,
	FieldClassName,
	FieldShell,
	TextField,
	type GoodsReceiptFieldUpdater,
} from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptFieldControls";

type GoodsReceiptWarehouseFieldsProps = {
	isReadonly: boolean;
	values: GoodsReceiptFormValues;
	onUpdateField: GoodsReceiptFieldUpdater<GoodsReceiptFormValues>;
};

export function GoodsReceiptWarehouseFields({
	isReadonly,
	onUpdateField,
	values,
}: GoodsReceiptWarehouseFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4">
				<FieldShell
					controlId="goods-receipt-transaction-type"
					label="Transaction Type"
					isRequired
				>
					<AttachedDropdown
						id="goods-receipt-transaction-type"
						value={values.transactionType}
						readOnly={isReadonly}
						options={GoodsReceiptTransactionTypeOptions}
						placeholder="--Select Transaction Type--"
						searchPlaceholder="Search transaction type"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("transactionType", value)}
					/>
				</FieldShell>
				<FieldShell
					controlId="goods-receipt-source-warehouse"
					label="Source to Warehouse"
					isRequired
				>
					<AttachedDropdown
						id="goods-receipt-source-warehouse"
						value={values.sourceWarehouse}
						readOnly={isReadonly}
						options={GoodsReceiptWarehouseOptions}
						placeholder="--Select Warehouse--"
						searchPlaceholder="Search warehouse"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("sourceWarehouse", value)}
					/>
				</FieldShell>
				<TextField
					id="goods-receipt-vce-code"
					label="Party Code"
					isRequired
					readOnly={isReadonly}
					value={values.vceCode}
					onChange={(value) => onUpdateField("vceCode", value)}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<FieldShell controlId="goods-receipt-vce-name" label="Party Name" isRequired>
					<AttachedDropdown
						id="goods-receipt-vce-name"
						value={values.vceName}
						readOnly={isReadonly}
						options={GoodsReceiptPartyOptions}
						placeholder=""
						searchPlaceholder="Search Party Name"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("vceName", value)}
					/>
				</FieldShell>
				<FieldShell controlId="goods-receipt-remarks" label="Remarks">
					<AppLimitedTextarea
						id="goods-receipt-remarks"
						value={values.remarks}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("remarks", event.target.value)}
						className={`${FieldClassName} min-h-24 py-3`}
						counterMode="remaining"
						maxLength={250}
					/>
				</FieldShell>
			</div>
		</div>
	);
}
