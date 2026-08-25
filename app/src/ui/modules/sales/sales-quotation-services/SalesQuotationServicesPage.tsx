"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ClipboardList, Edit3, FileText, Plus, Save, Search } from "lucide-react";
import { SalesQuotationServicesHref, SalesQuotationServicesStatusFilterOptions, SalesQuotationServicesTablePaginationStorageKey } from "@/app/src/constants/modules/sales/sales-quotation-services/SalesQuotationServicesConstants";
import {
	createSalesQuotationServicesFormValues,
	createSalesQuotationServicesLineEntry,
	createSalesQuotationServicesRecord,
	getInitialSalesQuotationServices,
	writeSalesQuotationServices,
} from "@/app/src/data/modules/sales/sales-quotation-services/SalesQuotationServicesData";
import type { BillingInvoiceLineEntry } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import type {
	SalesQuotationServicesFormValues,
	SalesQuotationServicesRecord,
} from "@/app/src/types/modules/sales/sales-quotation-services/SalesQuotationServicesTypes";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { SalesQuotationServicesDetailsForm } from "@/app/src/ui/modules/sales/sales-quotation-services/SalesQuotationServicesDetailsForm";
import { SalesQuotationServicesEntries } from "@/app/src/ui/modules/sales/sales-quotation-services/SalesQuotationServicesEntries";
import { useSalesQuotationServicesListPage } from "@/app/src/hooks/modules/sales/sales-quotation-services/useSalesQuotationServicesListPage";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ModuleTableActionLink, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleTableFilterSelect, ModuleTableResetButton, ModuleTableSearch, ModuleTableToolbar } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { SalesQuotationServicesMetrics } from "@/app/src/ui/modules/sales/sales-quotation-services/SalesQuotationServicesMetrics";

export function SalesQuotationServicesPage() {
	const pathname = usePathname();
	return pathname === SalesQuotationServicesHref ? <SalesQuotationServicesListPage /> : <SalesQuotationServicesActionPage />;
}

function SalesQuotationServicesListPage() {
	const page = useSalesQuotationServicesListPage();

	return <section className="grid gap-5">
		<ModuleHeader variant="panel" titleAs="h1" title="Service Quotation" description="Prepare customer quotations with detailed service billing entries." eyebrow={<><FileText className="h-3.5 w-3.5" aria-hidden="true" />Sales</>} actions={<Link href={`${SalesQuotationServicesHref}/add`} className={moduleHeaderActionClassNames.primary}><Plus className="h-4 w-4" aria-hidden="true" />Start New Service Quotation</Link>} />
		<SalesQuotationServicesMetrics records={page.records} />
		<ModuleTable
			emptyDescription="Try a different quotation number, party, project, date, amount, or status."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No service quotations matched"
			minWidthClassName="min-w-[82rem]"
			pageSizeOptions={[5, 10, 15, 20, 25, 50]}
			paginationLabel="entries"
			paginationStorageKey={SalesQuotationServicesTablePaginationStorageKey}
			table={page.table}
			tableTitle="Service quotation transactions"
			toolbar={<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]"><ModuleTableSearch label="Search Service Quotations" value={page.query} onChange={page.setQuery} placeholder="Search by quotation no., party, project, or status" /><DateRangePicker label="Date Range" value={page.dateRange} onChange={page.setDateRange} /><AmountRangePicker label="Amount" value={page.amountRange} onChange={page.setAmountRange} /><ModuleTableFilterSelect label="Status" value={page.statusFilter} options={SalesQuotationServicesStatusFilterOptions} onChange={(value) => page.setStatusFilter(value as typeof page.statusFilter)} /><ModuleTableResetButton onClick={page.resetFilters} /></ModuleTableToolbar>}
			renderRow={({ id, original }) => <SalesQuotationServicesTableRow key={id} record={original} />}
		/>
	</section>;
}

function SalesQuotationServicesTableRow({ record }: { record: SalesQuotationServicesRecord }) {
	return <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
		<td className="px-4 py-4 font-semibold text-skyblue">{record.formValues.transNo}</td>
		<td className="px-4 py-4">{record.formValues.prDate}</td>
		<td className="px-4 py-4">{record.formValues.partyName || "—"}</td>
		<td className="px-4 py-4">{record.formValues.projectName || "—"}</td>
		<td className="px-4 py-4 text-right font-semibold text-darknavy">{record.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
		<td className="px-4 py-4"><span className="inline-flex rounded-md bg-skyblue/15 px-2.5 py-1 text-xs font-semibold text-darknavy">{record.formValues.status}</span></td>
		<td className="px-4 py-4 text-center"><ModuleTableActions className="justify-center"><ModuleTableActionLink href={`${SalesQuotationServicesHref}/view/${record.id}`} label={`View ${record.formValues.transNo}`} variant="view" /><ModuleTableActionLink href={`${SalesQuotationServicesHref}/edit/${record.id}`} label={`Edit ${record.formValues.transNo}`} variant="edit" /></ModuleTableActions></td>
	</tr>;
}

function SalesQuotationServicesActionPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
	const mode = pathname.includes("/view/") ? "view" : pathname.includes("/edit/") ? "edit" : "add";
	const isReadonly = mode === "view";
	const [records, setRecords] = useState<SalesQuotationServicesRecord[]>([]);
	const [loadedRecord, setLoadedRecord] = useState<SalesQuotationServicesRecord | null>(null);
	const [values, setValues] = useState<SalesQuotationServicesFormValues>(createSalesQuotationServicesFormValues);
	const [lineEntries, setLineEntries] = useState<BillingInvoiceLineEntry[]>([createSalesQuotationServicesLineEntry()]);

	useEffect(() => {
		const stored = getInitialSalesQuotationServices();
		const selected = recordId ? stored.find((record) => record.id === recordId) ?? null : null;
		// Local storage data establishes the current record after hydration.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setRecords(stored);
		setLoadedRecord(selected);
		if (selected) {
			setValues(selected.formValues);
			setLineEntries(selected.lineEntries);
		}
	}, [recordId]);

	const title = mode === "add" ? "Add Service Quotation" : `${mode === "view" ? "View" : "Edit"} Service Quotation | ${values.transNo}`;
	const isMissing = mode !== "add" && !loadedRecord;
	const headerReference = useMemo(() => values.transNo, [values.transNo]);

	function updateField<TKey extends keyof SalesQuotationServicesFormValues>(key: TKey, value: SalesQuotationServicesFormValues[TKey]) { if (!isReadonly) setValues((current) => ({ ...current, [key]: value })); }
	function save() {
		if (!values.partyName.trim() || !lineEntries.some((entry) => entry.itemName.trim() || entry.itemNo.trim())) return;
		const next = createSalesQuotationServicesRecord(values, lineEntries, loadedRecord?.id);
		const nextRecords = loadedRecord ? records.map((record) => record.id === next.id ? next : record) : [next, ...records];
		writeSalesQuotationServices(nextRecords);
		setRecords(nextRecords);
		setLoadedRecord(next);
		router.push(`${SalesQuotationServicesHref}/view/${next.id}`);
	}

	if (isMissing) return <section className="grid gap-5"><ModuleHeader variant="panel" titleAs="h1" title="Service Quotation Not Found" description="The selected service quotation could not be found." actions={<Link href={SalesQuotationServicesHref} className={moduleHeaderActionClassNames.secondary}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to List</Link>} /></section>;
	return <section className="grid gap-5"><ModuleHeader variant="panel" titleAs="h1" title={title} description={mode === "view" ? "Review party details and detailed service billing entries." : "Complete quotation details and service billing entries before saving."} eyebrow={<><ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />{headerReference || "Sales quotation"}</>} actions={<><Link href={SalesQuotationServicesHref} className={moduleHeaderActionClassNames.secondary}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</Link>{mode === "view" ? <Link href={`${SalesQuotationServicesHref}/edit/${loadedRecord?.id ?? ""}`} className={moduleHeaderActionClassNames.primary}><Edit3 className="h-4 w-4" aria-hidden="true" />Edit</Link> : <button type="button" onClick={save} className={moduleHeaderActionClassNames.primary}><Save className="h-4 w-4" aria-hidden="true" />Save</button>}</>} />
		<SalesQuotationServicesDetailsForm isReadonly={isReadonly} values={values} onUpdateField={updateField} />
		<SalesQuotationServicesEntries isReadonly={isReadonly} rows={lineEntries} onRowsChange={setLineEntries} />
	</section>;
}
