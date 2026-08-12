"use client";

import { useState } from "react";
import { Route, ShieldCheck } from "lucide-react";
import { ApproverSetupPage } from "@/app/src/ui/modules/approval-management/approver-setup/ApproverSetupPage";
import { ApprovalManagementShell } from "@/app/src/ui/modules/approval-management/approval-rules/ApprovalManagementShell";

type ApprovalManagementTab = "approver-setup" | "approval-rules";

const ApprovalManagementTabs: Array<{
  id: ApprovalManagementTab;
  label: string;
  Icon: typeof ShieldCheck;
}> = [
  { id: "approver-setup", label: "Approver Setup", Icon: ShieldCheck },
  { id: "approval-rules", label: "Approval Rules", Icon: Route },
];

export function SystemAdministrationApprovalManagementMain() {
  const [activeTab, setActiveTab] = useState<ApprovalManagementTab>("approver-setup");

  return (
    <section className="grid min-h-0 gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-darknavy/10 bg-white p-2 shadow-sm shadow-darknavy/5">
        {ApprovalManagementTabs.map(({ Icon, id, label }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={
                isActive
                  ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-3 text-sm font-semibold text-white shadow-sm shadow-skyblue/25"
                  : "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-darknavy/65 transition hover:bg-offwhite hover:text-darknavy"
              }
              aria-pressed={isActive}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "approver-setup" ? <ApproverSetupPage /> : null}
      {activeTab === "approval-rules" ? <ApprovalManagementShell /> : null}
    </section>
  );
}
