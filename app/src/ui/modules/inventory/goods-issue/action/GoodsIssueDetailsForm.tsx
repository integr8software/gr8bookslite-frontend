import type { GoodsIssueFormValues } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import type { GoodsIssueFieldUpdater } from "@/app/src/ui/modules/inventory/goods-issue/action/GoodsIssueFieldControls";
import { GoodsIssueWarehouseFields } from "@/app/src/ui/modules/inventory/goods-issue/action/GoodsIssueWarehouseFields";

type GoodsIssueDetailsFormProps = {
	isReadonly: boolean;
	values: GoodsIssueFormValues;
	onUpdateField: GoodsIssueFieldUpdater<GoodsIssueFormValues>;
};

export function GoodsIssueDetailsForm({
	isReadonly,
	onUpdateField,
	values,
}: GoodsIssueDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			<GoodsIssueWarehouseFields
				isReadonly={isReadonly}
				values={values}
				onUpdateField={onUpdateField}
			/>
		</section>
	);
}
