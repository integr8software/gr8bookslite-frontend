import type { GoodsIssueFormValues } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import type { GoodsIssueFieldUpdater } from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueFieldControls";
import { GoodsIssueWarehouseFields } from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueWarehouseFields";
import { GoodsIssueReferenceFields } from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueReferenceFields";

export type GoodsIssueDetailsSection = "issue" | "references";

type GoodsIssueDetailsFormProps = {
	isReadonly: boolean;
	section: GoodsIssueDetailsSection;
	values: GoodsIssueFormValues;
	onUpdateField: GoodsIssueFieldUpdater<GoodsIssueFormValues>;
};

export function GoodsIssueDetailsForm({
	isReadonly,
	onUpdateField,
	section,
	values,
}: GoodsIssueDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			{section === "issue" ? (
				<GoodsIssueWarehouseFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "references" ? (
				<GoodsIssueReferenceFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
		</section>
	);
}
