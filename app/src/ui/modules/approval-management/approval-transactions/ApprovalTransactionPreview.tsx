import { CheckCircle2, Route, ThumbsDown, XCircle } from "lucide-react";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { joinClasses, moduleAccentClassNames } from "@/app/src/ui/shared/module/module-table/utils";
import { ApprovedStatus } from "@/app/src/constants/modules/approval-management/ApprovalTransactionConstants";
import { formatApproverStatus } from "@/app/src/data/modules/approval-management/ApprovalTransactionData";
import type { ApprovalTransactionRow } from "@/app/src/types/modules/approval-management/ApprovalTransactionTypes";

type Props = {
  isApproving: boolean;
  isDisapproving: boolean;
  record: ApprovalTransactionRow | null;
  onApprove: (record: ApprovalTransactionRow) => void;
  onClose: () => void;
  onDisapprove: (record: ApprovalTransactionRow) => void;
};

export function ApprovalTransactionPreview({ isApproving, isDisapproving, onApprove, onClose, onDisapprove, record }: Props) {
  const isPending = isApproving || isDisapproving;
  const canAct = Boolean(record?.canAct && !isPending);

  return (
    <ModuleDrawer
      isOpen={Boolean(record)}
      title={record ? `Preview ${record.referenceNo}` : "Transaction Preview"}
      description="Review the transaction route before approving or disapproving."
      eyebrow={
        <span className="inline-flex items-center gap-2">
          <Route className="h-3.5 w-3.5" aria-hidden="true" />
          Approval transaction
        </span>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-10 min-w-28 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!canAct}
            onClick={() => record && onDisapprove(record)}
            className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-lg border border-coralpink/25 bg-white px-4 text-sm font-semibold text-coralpink transition hover:bg-coralpink/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isDisapproving ? (
              <XCircle className="h-4 w-4 animate-pulse" aria-hidden="true" />
            ) : (
              <ThumbsDown className="h-4 w-4" aria-hidden="true" />
            )}
            Disapprove
          </button>
          <button
            type="button"
            disabled={!canAct}
            onClick={() => record && onApprove(record)}
            className={joinClasses(
              "inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
              moduleAccentClassNames.button,
            )}
          >
            <CheckCircle2 className={joinClasses("h-4 w-4", isApproving && "animate-pulse")} aria-hidden="true" />
            Approve
          </button>
        </div>
      }
      maxWidthClassName="max-w-xl"
      onClose={onClose}
    >
      {record ? (
        <div className="grid gap-5 p-6">
          <div className="grid gap-3 rounded-lg border border-darknavy/10 bg-offwhite/35 p-4 sm:grid-cols-2">
            <PreviewField label="Reference" value={record.referenceNo} />
            <PreviewField label="Status" value={record.statusLabel} />
            <PreviewField label="Module" value={record.moduleName} />
            <PreviewField label="Rule" value={record.ruleName} />
            <PreviewField label="Amount" value={record.amount} />
            <PreviewField label="Remarks" value={record.remarks} />
            <PreviewField label="Requested" value={record.requestedAt} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-darknavy">Approval path</h3>
            <div className="mt-3 grid gap-2">
              {record.transaction.approvers
                .slice()
                .sort((first, second) => first.sequence - second.sequence)
                .map((approver) => (
                  <div
                    key={`${record.id}-${approver.userId}`}
                    className="flex items-center gap-3 rounded-lg border border-darknavy/10 bg-white p-3"
                  >
                    <span
                      className={joinClasses(
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        approver.status === ApprovedStatus
                          ? "bg-emerald-100 text-emerald-700"
                          : record.transaction.currentApproverId === approver.userId
                            ? `${moduleAccentClassNames.softBackground} ${moduleAccentClassNames.iconText}`
                            : "bg-darknavy/5 text-darknavy/55",
                      )}
                    >
                      {approver.sequence}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-darknavy">{approver.name}</div>
                      <div className="mt-0.5 text-xs font-medium text-darknavy/50">{formatApproverStatus(approver)}</div>
                      {approver.remarks ? (
                        <div className="mt-1 line-clamp-2 text-xs font-medium text-darknavy/60">{approver.remarks}</div>
                      ) : null}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : null}
    </ModuleDrawer>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">{label}</div>
      <div className="mt-1 text-sm font-semibold text-darknavy">{value}</div>
    </div>
  );
}
