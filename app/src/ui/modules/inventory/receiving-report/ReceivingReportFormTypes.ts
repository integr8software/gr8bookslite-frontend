import type { ReceivingReportFormValues } from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";

export type ReceivingReportFormMode = "add" | "edit" | "view";
export type ReceivingReportFormTab = "details" | "attachments";
export type ReceivingReportFormField = Exclude<keyof ReceivingReportFormValues, "lines">;
export type ReceivingReportFormErrors = Partial<Record<ReceivingReportFormField | "lines", string>>;
