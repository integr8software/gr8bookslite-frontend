import {
	GoodsIssuePartyOptions,
	GoodsIssueTransactionTypeOptions,
	GoodsIssueWarehouseOptions,
} from "@/app/src/data/modules/inventory/goods-issue/GoodsIssueData";
import type { GoodsIssueFormValues } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
	AttachedDropdown,
	FieldClassName,
	FieldShell,
	TextField,
	type GoodsIssueFieldUpdater,
} from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueFieldControls";

type GoodsIssueWarehouseFieldsProps = {
	isReadonly: boolean;
	values: GoodsIssueFormValues;
	onUpdateField: GoodsIssueFieldUpdater<GoodsIssueFormValues>;
};

export function GoodsIssueWarehouseFields({
	isReadonly,
	onUpdateField,
	values,
}: GoodsIssueWarehouseFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4">
				<FieldShell
					controlId="goods-issue-transaction-type"
					label="Transaction Type"
					isRequired
				>
					<AttachedDropdown
						id="goods-issue-transaction-type"
						value={values.transactionType}
						readOnly={isReadonly}
						options={GoodsIssueTransactionTypeOptions}
						placeholder="--Select Transaction Type--"
						searchPlaceholder="Search transaction type"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("transactionType", value)}
					/>
				</FieldShell>
				<FieldShell
					controlId="goods-issue-source-warehouse"
					label="Source Warehouse"
					isRequired
				>
					<AttachedDropdown
						id="goods-issue-source-warehouse"
						value={values.sourceWarehouse}
						readOnly={isReadonly}
						options={GoodsIssueWarehouseOptions}
						placeholder="--Select Warehouse--"
						searchPlaceholder="Search warehouse"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("sourceWarehouse", value)}
					/>
				</FieldShell>
				<TextField
					id="goods-issue-vce-code"
					label="Party Code"
					isRequired
					readOnly={isReadonly}
					value={values.vceCode}
					onChange={(value) => onUpdateField("vceCode", value)}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<FieldShell controlId="goods-issue-vce-name" label="Party Code" isRequired>
					<AttachedDropdown
						id="goods-issue-vce-name"
						value={values.vceName}
						readOnly={isReadonly}
						options={GoodsIssuePartyOptions}
						placeholder=""
						searchPlaceholder="Search Party Code"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("vceName", value)}
					/>
				</FieldShell>
				<FieldShell controlId="goods-issue-remarks" label="Remarks">
					<AppLimitedTextarea
						id="goods-issue-remarks"
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
