import { Building2 } from "lucide-react";
import {
	formatPurchaseRequestCurrency,
	formatPurchaseRequestDate,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type { PurchaseRequestFormValues } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
	PurchaseRequestFieldClassName,
	PurchaseRequestFormField,
} from "./PurchaseRequestFormControls";

type PurchaseRequestSummaryPanelProps = {
	grossAmount: number;
	isReadonly: boolean;
	updateField: <TKey extends keyof PurchaseRequestFormValues>(
		field: TKey,
		value: PurchaseRequestFormValues[TKey],
	) => void;
	values: PurchaseRequestFormValues;
};

export function PurchaseRequestSummaryPanel({
	grossAmount,
	isReadonly,
	updateField,
	values,
}: PurchaseRequestSummaryPanelProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.8fr)_minmax(0,1fr)]">
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold text-darknavy">Print Header</h2>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<PurchaseRequestFormField label="Logo Text">
						<input
							value={values.logoText}
							disabled={isReadonly}
							onChange={(event) => updateField("logoText", event.target.value)}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
					<PurchaseRequestFormField label="Company Name">
						<input
							value={values.companyName}
							disabled={isReadonly}
							onChange={(event) => updateField("companyName", event.target.value)}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
					<PurchaseRequestFormField label="VAT Reg TIN">
						<input
							value={values.vatRegTin}
							disabled={isReadonly}
							onChange={(event) => updateField("vatRegTin", event.target.value)}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
					<PurchaseRequestFormField label="Address">
						<textarea
							value={values.companyAddress}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("companyAddress", event.target.value)
							}
							className={`${PurchaseRequestFieldClassName} min-h-20 py-3`}
						/>
					</PurchaseRequestFormField>
					<PurchaseRequestFormField label="Telephone No.">
						<input
							value={values.telephoneNo}
							disabled={isReadonly}
							onChange={(event) => updateField("telephoneNo", event.target.value)}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
				</div>
			</div>

			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="flex items-center gap-3">
					<div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-skyblue/12 text-skyblue">
						<Building2 className="h-5 w-5" aria-hidden="true" />
					</div>
					<div>
						<h2 className="text-sm font-semibold text-darknavy">
							Request Summary
						</h2>
						<p className="text-xs text-darknavy/55">PR {values.transNo}</p>
					</div>
				</div>
				<div className="mt-5 grid gap-3 text-sm">
					<SummaryLine label="Supplier" value={values.vceName || "-"} />
					<SummaryLine
						label="PR Date"
						value={formatPurchaseRequestDate(values.prDate) || "-"}
					/>
					<SummaryLine label="Items" value={values.items.length.toString()} />
					<SummaryLine
						label="Gross Amount"
						value={formatPurchaseRequestCurrency(grossAmount)}
						emphasis
					/>
				</div>
			</div>

			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold text-darknavy">Approval Fields</h2>
				<div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
					<PurchaseRequestFormField label="FOR">
						<input
							placeholder="Text shown in the FOR box on the print preview"
							value={values.forDepartment}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("forDepartment", event.target.value)
							}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
					<PurchaseRequestFormField label="Prepared by">
						<input
							value={values.preparedBy}
							disabled={isReadonly}
							onChange={(event) => updateField("preparedBy", event.target.value)}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
					<PurchaseRequestFormField label="Approved by">
						<input
							value={values.approvedBy}
							disabled={isReadonly}
							onChange={(event) => updateField("approvedBy", event.target.value)}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
				</div>
			</div>
		</div>
	);
}

function SummaryLine({
	emphasis,
	label,
	value,
}: {
	emphasis?: boolean;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-start justify-between gap-4 border-b border-darknavy/10 pb-3 last:border-0 last:pb-0">
			<span className="text-darknavy/55">{label}</span>
			<span
				className={
					emphasis
						? "text-right font-bold text-darknavy"
						: "text-right font-medium text-darknavy"
				}
			>
				{value}
			</span>
		</div>
	);
}
