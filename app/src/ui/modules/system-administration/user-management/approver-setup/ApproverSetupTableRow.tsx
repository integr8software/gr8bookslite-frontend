import { CircleOff, Pencil, RefreshCcw, Trash2 } from "lucide-react";
import {
  ApproverAssignmentToneByType,
  ApproverSetupTemporaryType,
  ApproverStatusToneByStatus,
} from "@/app/src/constants/modules/system-administration/user-management/approver-setup/ApproverSetupConstants";
import { getApproverCoverageSignal } from "@/app/src/hooks/modules/system-administration/user-management/approver-setup/useApproverSetupPage";
import type { ApproverSetupRecord } from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import {
  ModuleTableActionButton,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  formatApproverListLabel,
  formatApproverSetupDate,
  getApproverSetupInitials,
} from "./utils";

type ApproverSetupTableRowProps = {
  onDelete: (record: ApproverSetupRecord) => void;
  onEdit: (record: ApproverSetupRecord) => void;
  onToggleStatus: (record: ApproverSetupRecord) => void;
  record: ApproverSetupRecord;
};

export function ApproverSetupTableRow({
  onDelete,
  onEdit,
  onToggleStatus,
  record,
}: ApproverSetupTableRowProps) {
  const users = record.approverUsers ?? [];
  const firstUser = users[0];
  const userNames = users.map((user) => user?.name).filter(Boolean);
  const userName = formatApproverListLabel(userNames);
  const coverageSignal = getApproverCoverageSignal(record);
  const isTemporary = record.assignmentType === ApproverSetupTemporaryType;

  return (
    <tr className="module-table-row">
      <td className="px-4 py-4 align-center">
        <div className="flex max-w-72 items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-darknavy text-xs font-semibold text-white">
            {getApproverSetupInitials(userName)}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-darknavy">{userName}</div>
            <div className="truncate text-xs font-medium text-darknavy/50">
              {record.userIds.length > 1
                ? `${record.userIds.length} approvers selected`
                : firstUser?.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 align-center">
        <span
          className={joinClasses(
            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
            ApproverAssignmentToneByType[record.assignmentType],
          )}
        >
          {record.assignmentType}
        </span>
      </td>
      <td className="px-4 py-4 align-center">
        <div className="text-sm font-semibold text-darknavy">
          Level {record.sequence}: {record.levelName}
        </div>
        <div className="mt-1 text-xs font-medium text-darknavy/55">{record.moduleScope}</div>
      </td>
      <td className="px-4 py-4 align-center">
        <div className="text-sm font-medium text-darknavy">{record.condition}</div>
      </td>
      <td className="px-4 py-4 align-center">
        {isTemporary ? (
          <>
            <div className="text-sm font-medium text-darknavy">
              {formatApproverSetupDate(record.effectiveFrom ?? "")}
            </div>
            <div className="mt-1 text-xs font-medium text-darknavy/55">
              {record.effectiveTo
                ? `Until ${formatApproverSetupDate(record.effectiveTo)}`
                : "No end date"}
            </div>
            <span
              className={joinClasses(
                "mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                coverageSignal.className,
              )}
            >
              {coverageSignal.label}
            </span>
          </>
        ) : (
          <div className="text-sm font-medium text-darknavy/45">Not time-bound</div>
        )}
      </td>
      <td className="px-4 py-4 align-center">
        <span
          className={joinClasses(
            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
            ApproverStatusToneByStatus[record.status],
          )}
        >
          {record.status}
        </span>
      </td>
      <td className="px-4 py-4 align-center text-right">
        <ModuleTableActions>
          <ModuleTooltip align="end" position="top" title="Edit">
            <ModuleTableActionButton
              label={`Edit ${userName}`}
              icon={Pencil}
              variant="edit"
              onClick={() => onEdit(record)}
            />
          </ModuleTooltip>
          <ModuleTooltip
            align="end"
            position="top"
            title={record.status === "Expired" ? "Reactivate" : "Deactivate"}
          >
            <ModuleTableActionButton
              label={`${record.status === "Expired" ? "Reactivate" : "Deactivate"} ${userName}`}
              icon={record.status === "Expired" ? RefreshCcw : CircleOff}
              variant={record.status === "Expired" ? "neutral" : "inactive"}
              onClick={() => onToggleStatus(record)}
            />
          </ModuleTooltip>
          <ModuleTooltip align="end" position="top" title="Delete">
            <ModuleTableActionButton
              label={`Delete ${userName}`}
              icon={Trash2}
              variant="delete"
              onClick={() => onDelete(record)}
            />
          </ModuleTooltip>
        </ModuleTableActions>
      </td>
    </tr>
  );
}
