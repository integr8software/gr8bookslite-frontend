import { useEffect } from "react";
import {
  ApproverSetupAllApproversCondition,
  ApproverSetupMaxApprovers,
} from "@/app/src/constants/modules/system-administration/user-management/approver-setup/ApproverSetupConstants";
import type {
  ApproverCondition,
  ApproverSetupUser,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import {
  getApproverConditionHelpText,
  getApproverConditionLimit,
} from "@/app/src/validations/modules/system-administration/user-management/approver-setup/ApproverSetupValidation";

type ApproverSetupUserSelectListProps = {
  condition: ApproverCondition;
  onChange: (userIds: string[]) => void;
  selectedUserIds: string[];
  users: ApproverSetupUser[];
};

export function ApproverSetupUserSelectList({
  condition,
  onChange,
  selectedUserIds,
  users,
}: ApproverSetupUserSelectListProps) {
  const requiresAllApprovers = condition === ApproverSetupAllApproversCondition;
  const slotCount = getApproverConditionLimit(condition, users);
  const visibleSlotCount = requiresAllApprovers ? 0 : slotCount;

  useEffect(() => {
    if (!requiresAllApprovers) {
      return;
    }

    const allUserIds = users
      .slice(0, ApproverSetupMaxApprovers)
      .map((user) => user.id);
    const hasSameSelection =
      selectedUserIds.length === allUserIds.length &&
      allUserIds.every((userId) => selectedUserIds.includes(userId));

    if (!hasSameSelection) {
      onChange(allUserIds);
    }
  }, [onChange, requiresAllApprovers, selectedUserIds, users]);

  function updateSlot(slotIndex: number, userId: string) {
    const nextUserIds = [...selectedUserIds];

    nextUserIds[slotIndex] = userId;
    onChange(nextUserIds.filter(Boolean).slice(0, visibleSlotCount));
  }

  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-darknavy">Approvers</div>
      {users.length === 0 ? (
        <div className="rounded-md border border-dashed border-darknavy/15 bg-offwhite/45 px-3 py-3 text-sm font-medium text-darknavy/50">
          No company users available.
        </div>
      ) : requiresAllApprovers ? (
        <AllApproversSummary users={users.slice(0, ApproverSetupMaxApprovers)} />
      ) : (
        <div className="grid gap-3">
          {Array.from({ length: visibleSlotCount }).map((_, slotIndex) => (
            <ApproverSelectSlot
              key={slotIndex}
              slotIndex={slotIndex}
              selectedUserIds={selectedUserIds}
              users={users}
              onChange={updateSlot}
            />
          ))}
        </div>
      )}
      <p className="mt-2 text-xs font-medium text-darknavy/50">
        {getApproverConditionHelpText(condition, users)}
      </p>
    </div>
  );
}

function ApproverSelectSlot({
  onChange,
  selectedUserIds,
  slotIndex,
  users,
}: {
  onChange: (slotIndex: number, userId: string) => void;
  selectedUserIds: string[];
  slotIndex: number;
  users: ApproverSetupUser[];
}) {
  const selectedUserId = selectedUserIds[slotIndex] ?? "";

  return (
    <label>
      <span className="text-xs font-semibold text-darknavy/45">Approver {slotIndex + 1}</span>
      <select
        value={selectedUserId}
        onChange={(event) => onChange(slotIndex, event.target.value)}
        className="mt-1 h-11 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
      >
        <option value="">Select approver</option>
        {users.map((user) => {
          const isSelectedElsewhere = selectedUserIds.some(
            (userId, index) => index !== slotIndex && userId === user.id,
          );

          return (
            <option key={user.id} value={user.id} disabled={isSelectedElsewhere}>
              {user.name} - {user.email}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function AllApproversSummary({ users }: { users: ApproverSetupUser[] }) {
  const previewUsers = users.slice(0, 4);
  const remainingCount = users.length - previewUsers.length;

  return (
    <div className="rounded-md border border-darknavy/10 bg-offwhite/40 p-3">
      <div className="text-sm font-semibold text-darknavy">
        All {users.length} company users will be included.
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {previewUsers.map((user) => (
          <span
            key={user.id}
            className="inline-flex max-w-full rounded-full border border-darknavy/10 bg-white px-2.5 py-1 text-xs font-semibold text-darknavy/70"
          >
            {user.name}
          </span>
        ))}
        {remainingCount > 0 ? (
          <span className="inline-flex rounded-full border border-darknavy/10 bg-white px-2.5 py-1 text-xs font-semibold text-darknavy/45">
            +{remainingCount} more
          </span>
        ) : null}
      </div>
    </div>
  );
}
