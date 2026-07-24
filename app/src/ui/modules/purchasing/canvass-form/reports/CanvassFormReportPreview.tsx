"use client";

import {
	formatCanvassFormAmount,
	formatCanvassFormDate,
	getCanvassFormTotal,
	normalizeCanvassFormItem,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import type { CanvassFormRecord } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";
import { openCanvassFormPdf } from "@/app/src/ui/modules/purchasing/canvass-form/reports/CanvassFormPdf";

type CanvassFormReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	record: CanvassFormRecord;
};

export function CanvassFormReportPreview({
	isOpen,
	onClose,
	record,
}: CanvassFormReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			isOpen={isOpen}
			eyebrow="Purchasing document"
			title="Print Preview"
			description="Review the printable canvass form layout."
			onClose={onClose}
			onGeneratePdf={() => openCanvassFormPdf(record)}
		>
			<CanvassFormReportDocument record={record} />
		</ReportPreviewDrawer>
	);
}

export function CanvassFormReportDocument({ record }: { record: CanvassFormRecord }) {
	return (
		<div className="overflow-x-auto bg-white p-4">
			<div className="mx-auto w-230 bg-white p-4 text-[12px] text-black">
				<div className="border border-black">
					<div className="grid grid-cols-[170px_1fr] gap-3 p-4">
						<div className="grid h-20 w-24 place-items-center text-[24px] font-bold leading-5 text-[#0b56b3]">
							gr8books
						</div>
						<div className="text-center leading-6">
							<div className="text-base font-bold">Your Company Name Here</div>
							<div className="font-bold">CANVASS FORM</div>
							<div>Document Date: {formatCanvassFormDate(record.documentDate)}</div>
							<div>Trans No.: {record.transNo}</div>
						</div>
					</div>
					<div className="grid grid-cols-2 border-t border-black">
						<InfoCell label="Requested By" value={record.requestedBy} />
						<InfoCell label="Required Before" value={formatCanvassFormDate(record.requiredBefore)} />
						<InfoCell label="Terms of Payment" value={record.termsOfPayment} />
						<InfoCell label="Currency" value={record.currency} />
						<InfoCell label="Status" value={record.status} />
					</div>
					<div className="min-h-14 border-t border-black px-1 py-1">
						<span className="font-bold">Remarks:</span> {record.remarks}
					</div>
					<table className="w-full border-collapse text-[10px]">
						<thead>
							<tr>
								{[
									"PR No.",
									"Item Code",
									"Description",
									"UOM",
									"Qty",
									"VAT Inc.",
									"VAT Ex.",
									"Supplier 1",
									"Cost 1",
									"Supplier 2",
									"Cost 2",
									"Supplier 3",
									"Cost 3",
									"Supplier 4",
									"Cost 4",
									"Selected",
									"Total",
								].map((header) => (
									<th key={header} className="border border-black px-1 py-1 text-left font-bold">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{record.items.map((item) => {
								const normalized = normalizeCanvassFormItem(item);
								return (
									<tr key={item.id}>
										<td className="border border-black px-1 py-1">{item.prNo}</td>
										<td className="border border-black px-1 py-1">{item.itemCode}</td>
										<td className="border border-black px-1 py-1">{item.description}</td>
										<td className="border border-black px-1 py-1">{item.uom}</td>
										<td className="border border-black px-1 py-1 text-right">{formatCanvassFormAmount(item.quantity)}</td>
										<td className="border border-black px-1 py-1">{item.vatInclusive}</td>
										<td className="border border-black px-1 py-1">{item.vatExclusive}</td>
										<td className="border border-black px-1 py-1">{item.supplierName1}</td>
										<td className="border border-black px-1 py-1 text-right">{formatCanvassFormAmount(item.unitCost1)}</td>
										<td className="border border-black px-1 py-1">{item.supplierName2}</td>
										<td className="border border-black px-1 py-1 text-right">{formatCanvassFormAmount(item.unitCost2)}</td>
										<td className="border border-black px-1 py-1">{item.supplierName3}</td>
										<td className="border border-black px-1 py-1 text-right">{formatCanvassFormAmount(item.unitCost3)}</td>
										<td className="border border-black px-1 py-1">{item.supplierName4}</td>
										<td className="border border-black px-1 py-1 text-right">{formatCanvassFormAmount(item.unitCost4)}</td>
										<td className="border border-black px-1 py-1">{item.selectedSupplier}</td>
										<td className="border border-black px-1 py-1 text-right font-bold">{formatCanvassFormAmount(normalized.totalCost)}</td>
									</tr>
								);
							})}
						</tbody>
						<tfoot>
							<tr>
								<td colSpan={16} className="border border-black px-1 py-1 text-right font-bold">
									Total:
								</td>
								<td className="border border-black px-1 py-1 text-right font-bold">
									{formatCanvassFormAmount(getCanvassFormTotal(record))}
								</td>
							</tr>
						</tfoot>
					</table>
					<div className="grid grid-cols-3 border-t border-black">
						<SignatureCell label="Prepared by" />
						<SignatureCell label="Checked by" />
						<SignatureCell label="Approved by" />
					</div>
				</div>
			</div>
		</div>
	);
}

function InfoCell({ label, value }: { label: string; value: string }) {
	return (
		<div className="border-r border-b border-black px-1 py-1">
			<span className="font-bold">{label}:</span> {value}
		</div>
	);
}

function SignatureCell({ label }: { label: string }) {
	return <div className="min-h-16 border-r border-black px-1 py-1">{label}:</div>;
}
