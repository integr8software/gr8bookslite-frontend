import type { GoodsIssueFormValues } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import {
	DateField,
	TextField,
	type GoodsIssueFieldUpdater,
} from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueFieldControls";

type GoodsIssueReferenceFieldsProps = {
	isReadonly: boolean;
	values: GoodsIssueFormValues;
	onUpdateField: GoodsIssueFieldUpdater<GoodsIssueFormValues>;
};

export function GoodsIssueReferenceFields({
	isReadonly,
	onUpdateField,
	values,
}: GoodsIssueReferenceFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4">
				<TextField
					id="goods-issue-transaction-no"
					label="GI No."
					isRequired
					readOnly={isReadonly}
					value={values.transactionNo}
					onChange={(value) => onUpdateField("transactionNo", value)}
				/>
				<DateField
					id="goods-issue-document-date"
					label="Document Date"
					readOnly={isReadonly}
					value={values.documentDate}
					onChange={(value) => onUpdateField("documentDate", value)}
				/>
				<TextField
					id="goods-issue-status"
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					onChange={(value) => onUpdateField("status", value)}
				/>
				<TextField
					id="goods-issue-mr-no"
					label="MR No."
					readOnly={isReadonly}
					value={values.mrNo}
					onChange={(value) => onUpdateField("mrNo", value)}
				/>
				<TextField
					id="goods-issue-rr-no"
					label="RR No."
					readOnly={isReadonly}
					value={values.rrNo}
					onChange={(value) => onUpdateField("rrNo", value)}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<TextField
					id="goods-issue-ic-no"
					label="IC No."
					readOnly={isReadonly}
					value={values.icNo}
					onChange={(value) => onUpdateField("icNo", value)}
				/>
				<TextField
					id="goods-issue-fa-no"
					label="FA No."
					readOnly={isReadonly}
					value={values.faNo}
					onChange={(value) => onUpdateField("faNo", value)}
				/>
				<TextField
					id="goods-issue-project-ref"
					label="Project Ref"
					readOnly={isReadonly}
					value={values.projectRef}
					onChange={(value) => onUpdateField("projectRef", value)}
				/>
				<TextField
					id="goods-issue-project-name"
					label="Project Name"
					readOnly={isReadonly}
					value={values.projectName}
					onChange={(value) => onUpdateField("projectName", value)}
				/>
			</div>
		</div>
	);
}
