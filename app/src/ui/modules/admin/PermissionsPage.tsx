"use client";

import { Fragment } from "react";

import { getPermissionsData } from "@/app/src/services/modules/admin/ErpAdminService";

export function PermissionsPage() {
  const { appliesTo, groups, roleName, scopeLevel } = getPermissionsData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Permissions
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Review role access by branch and module, then adjust scope without
          leaving the ERP workspace.
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="grid gap-3 md:grid-cols-4">
              <ControlCard label="Select Role" value={roleName} />
              <ControlCard label="Scope Level" value={scopeLevel} />
              <ControlCard label="Applies To" value={appliesTo} />
              <button className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                Change Scope
              </button>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">Sections</th>
                    {["View", "Create", "Edit", "Delete", "Approve", "Export"].map((column) => (
                      <th key={column} className="pb-3 text-center font-medium">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <Fragment key={group.title}>
                      <tr>
                        <td colSpan={7} className="border-t border-slate-200 py-4 text-sm font-semibold text-slate-900">
                          {group.title}
                        </td>
                      </tr>
                      {group.rows.map((row) => (
                        <tr key={row.label} className="border-t border-slate-100">
                          <td className="py-3 text-slate-700">{row.label}</td>
                          {[row.view, row.create, row.edit, row.delete, row.approve, row.export].map((value, index) => (
                            <td key={`${row.label}-${index}`} className="py-3 text-center">
                              <input checked={value} readOnly type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 p-5">
            <h2 className="text-xl font-semibold text-slate-900">Permission Summary</h2>
            <div className="mt-5 flex items-center gap-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-blue-200 text-xl font-semibold text-slate-900">
                75%
              </div>
              <div className="space-y-2 text-sm">
                <LegendItem label="Full Access" tone="blue" value="18" />
                <LegendItem label="Partial Access" tone="amber" value="6" />
                <LegendItem label="No Access" tone="red" value="6" />
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <DetailRow label="Company" value="Gr8 Construction Inc." />
              <DetailRow label="Branch / Site" value="Houston Site" />
              <DetailRow label="Users with this role" value="6" />
              <DetailRow label="Last Updated" value="May 20, 2024 by John D." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function LegendItem({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "blue" | "amber" | "red";
  value: string;
}) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-500"
      : tone === "amber"
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className={joinClasses("h-2.5 w-2.5 rounded-full", toneClass)} />
      <span className="flex-1 text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}



