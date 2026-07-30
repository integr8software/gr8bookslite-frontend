import { Settings2 } from "lucide-react";
import type { TransactionNumberScope } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

type TransactionNumberSetupBranchPickerProps = {
  branchOptions: Array<{ code: string; id: string; name: string }>;
  scope: TransactionNumberScope;
  selectedBranchIds: string[];
  onToggleBranch: (branchId: string) => void;
};

export function TransactionNumberSetupBranchPicker({
  branchOptions,
  scope,
  selectedBranchIds,
  onToggleBranch,
}: TransactionNumberSetupBranchPickerProps) {
  const isAllBranches = scope === "all";

  return (
    <section className="rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
      <div className="flex items-start gap-2 border-b border-darknavy/10 px-4 py-3">
        <Settings2 className="mt-0.5 h-4 w-4 text-darknavy/55" aria-hidden="true" />
        <div>
          <h3 className="text-base font-semibold text-darknavy">Branch Coverage</h3>
          <p className="mt-1 text-xs font-medium text-darknavy/50">
            List of branches based on the current company.
          </p>
        </div>
      </div>
      <div className="grid max-h-96 gap-2 overflow-auto p-3">
        {branchOptions.length > 0 ? (
          branchOptions.map((branch) => {
            const checked = isAllBranches || selectedBranchIds.includes(branch.id);

            return (
              <label
                key={branch.id}
                className="flex min-h-12 items-center gap-3 rounded-md border border-darknavy/10 bg-offwhite/45 px-3 text-sm font-semibold text-darknavy"
              >
                <input
                  type={scope === "branch" ? "radio" : "checkbox"}
                  checked={checked}
                  onChange={() => onToggleBranch(branch.id)}
                  className="h-4 w-4 accent-skyblue"
                />
                <span className="min-w-0">
                  <span className="block truncate">{branch.name}</span>
                  <span className="block text-xs text-darknavy/45">{branch.code}</span>
                </span>
              </label>
            );
          })
        ) : (
          <div className="rounded-md border border-darknavy/10 bg-offwhite/45 p-4 text-sm font-medium text-darknavy/55">
            No active branches are available for the current company.
          </div>
        )}
      </div>
    </section>
  );
}
