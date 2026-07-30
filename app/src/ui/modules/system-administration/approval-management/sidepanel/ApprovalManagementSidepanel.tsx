import { Search } from "lucide-react";
import {
  ApprovalManagementAllStatusesFilter,
  ApprovalManagementStatusFilterOptions,
} from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import type {
  ApprovalManagementRecord,
  ApprovalManagementStatus,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const approvalManagementFieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";

type ApprovalManagementSidepanelProps = {
  isLoading: boolean;
  query: string;
  selectedWorkflowId: string | null;
  statusFilter: ApprovalManagementStatus | typeof ApprovalManagementAllStatusesFilter;
  workflows: ApprovalManagementRecord[];
  onQueryChange: (value: string) => void;
  onSelectWorkflow: (workflowId: string) => void;
  onStatusFilterChange: (
    value: ApprovalManagementStatus | typeof ApprovalManagementAllStatusesFilter,
  ) => void;
};

export function ApprovalManagementSidepanel({
  isLoading,
  onQueryChange,
  onSelectWorkflow,
  onStatusFilterChange,
  query,
  selectedWorkflowId,
  statusFilter,
  workflows,
}: ApprovalManagementSidepanelProps) {
  const dropdownOptions = workflows.map<AppAdvancedDropdownOption>((workflow) => ({
    description: workflow.moduleCode,
    name: workflow.moduleName,
    value: workflow.id,
  }));

  function handleDropdownChange(value: string | string[]) {
    if (typeof value === "string" && value) {
      onSelectWorkflow(value);
    }
  }

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-b border-darknavy/10 bg-white xl:m-4 xl:self-stretch xl:rounded-lg xl:border xl:border-darknavy/10 xl:shadow-sm xl:shadow-darknavy/5 xl:contain-[size]">
      <div className="grid gap-3 border-b border-darknavy/10 p-4 xl:hidden">
        <div>
          <h2 className="text-sm font-semibold text-darknavy">Approval Modules</h2>
          <p className="mt-1 text-xs font-medium text-darknavy/55">Choose a module to configure.</p>
        </div>
        <AppAdvancedDropdown
          disabled={isLoading}
          emptyMessage="No modules match the current search."
          options={dropdownOptions}
          placeholder="Select module"
          searchPlaceholder="Search module"
          value={selectedWorkflowId ?? ""}
          onChange={handleDropdownChange}
        />
      </div>

      <div className="hidden gap-3 border-b border-darknavy/10 p-4 xl:grid">
        <div>
          <h2 className="text-sm font-semibold text-darknavy">Approval Modules</h2>
          <p className="mt-1 text-xs font-medium text-darknavy/55">
            Choose a module, then update how its approvals are routed.
          </p>
        </div>
        <div className="grid gap-2 2xl:grid-cols-[minmax(0,1fr)_10rem]">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/38"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              disabled={isLoading}
              className={joinClasses(approvalManagementFieldClassName, "pl-9")}
              placeholder="Search module"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(
                event.target.value as
                  ApprovalManagementStatus | typeof ApprovalManagementAllStatusesFilter,
              )
            }
            disabled={isLoading}
            className={approvalManagementFieldClassName}
            aria-label="Filter by workflow status"
          >
            {ApprovalManagementStatusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(0,1fr)_7rem] border-b border-darknavy/10 bg-skyblue/12 px-4 py-2 text-xs font-semibold text-darknavy xl:grid">
        <span>Module</span>
        <span>Code</span>
      </div>
      <div className="hidden min-h-0 flex-1 overflow-auto xl:block">
        {isLoading ? (
          <ApprovalManagementSidepanelSkeleton />
        ) : workflows.length > 0 ? (
          workflows.map((workflow) => {
            const isSelected = workflow.id === selectedWorkflowId;

            return (
              <button
                key={workflow.id}
                type="button"
                onClick={() => onSelectWorkflow(workflow.id)}
                className={joinClasses(
                  "grid w-full grid-cols-[minmax(0,1fr)_7rem] items-center gap-3 border-b border-darknavy/8 px-4 py-2.5 text-left text-sm transition hover:bg-offwhite/80",
                  isSelected ? "bg-citron/20" : "bg-white",
                )}
              >
                <span
                  className={joinClasses(
                    "truncate text-darknavy",
                    isSelected ? "font-semibold" : "font-medium",
                  )}
                >
                  {workflow.moduleName}
                </span>
                <span className="text-xs font-bold text-darknavy/72">{workflow.moduleCode}</span>
              </button>
            );
          })
        ) : (
          <div className="p-6 text-sm font-medium text-darknavy/55">
            No modules match the current search.
          </div>
        )}
      </div>
    </aside>
  );
}

function ApprovalManagementSidepanelSkeleton() {
  return (
    <div aria-label="Loading approval modules" aria-busy="true">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="grid min-h-[2.9rem] grid-cols-[minmax(0,1fr)_7rem] items-center gap-3 border-b border-darknavy/8 px-4 py-2.5"
        >
          <AppSkeleton className="h-4 w-3/4 rounded-md" />
          <AppSkeleton className="h-3.5 w-12 rounded-md" />
        </div>
      ))}
    </div>
  );
}
