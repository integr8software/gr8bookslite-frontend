import { Ban, CheckCircle2, Edit3, Eye, Undo2 } from "lucide-react";
import {
  CashSalesInvoiceHref,
  CashSalesInvoiceStatuses,
} from "@/app/src/constants/modules/sales/cash-sales-invoice/CashSalesInvoiceConstants";
import type {
  CashSalesInvoiceRecord,
  CashSalesInvoiceStatus,
} from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function CashSalesInvoiceRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: (
    record: CashSalesInvoiceRecord,
    status: CashSalesInvoiceStatus,
  ) => void;
  record: CashSalesInvoiceRecord;
}) {
  const isPosted = record.status === CashSalesInvoiceStatuses.posted;
  const isCancelled = record.status === CashSalesInvoiceStatuses.cancelled;
  const canEdit = record.status === CashSalesInvoiceStatuses.draft;
  const overflowItems: ModuleActionMenuItem[] = [
    {
      disabled: isCancelled,
      icon: isPosted ? Undo2 : CheckCircle2,
      label: isPosted ? "Undo Posted" : "Post",
      onSelect: () =>
        onUpdateStatus(
          record,
          isPosted ? CashSalesInvoiceStatuses.draft : CashSalesInvoiceStatuses.posted,
        ),
      type: "button",
    },
    {
      disabled: isPosted,
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Uncancelled" : "Cancel",
      onSelect: () =>
        onUpdateStatus(
          record,
          isCancelled ? CashSalesInvoiceStatuses.draft : CashSalesInvoiceStatuses.cancelled,
        ),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return (
    <ModuleTableActions className="justify-center!">
      <ModuleTableActionLink
        href={`${CashSalesInvoiceHref}/view/${record.id}`}
        icon={Eye}
        label={`View cash sales invoice ${record.transactionNo}`}
        title="View"
        variant="view"
      />
      {canEdit ? (
        <ModuleTableActionLink
          href={`${CashSalesInvoiceHref}/edit/${record.id}`}
          icon={Edit3}
          label={`Edit cash sales invoice ${record.transactionNo}`}
          title="Edit"
          variant="edit"
        />
      ) : (
        <ModuleTableActionButton
          disabled
          icon={Edit3}
          label={`Edit cash sales invoice ${record.transactionNo}`}
          title="Edit"
          variant="edit"
        />
      )}
      <ModuleActionMenu
        className="[&>button]:h-9 [&>button]:w-9"
        items={overflowItems}
        label={`More actions for cash sales invoice ${record.transactionNo}`}
      />
    </ModuleTableActions>
  );
}
