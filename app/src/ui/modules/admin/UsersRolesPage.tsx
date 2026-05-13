"use client";

import { Download, Search } from "lucide-react";
import { getUsersRolesData } from "@/app/src/services/modules/admin/ErpAdminService";

export function UsersRolesPage() {
  const { users } = getUsersRolesData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Users & Roles
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Manage people, branch assignments, and role coverage across your
          companies using a single workspace view.
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap gap-3">
          <ToolbarSearch />
          {["All Companies", "All Branches", "All Roles", "Status"].map((label) => (
            <ToolbarChip key={label} label={label} />
          ))}
          <button className="ml-auto inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
            + Add User
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                {["User", "Company", "Branch / Site", "Role", "Status", "Last Active"].map((column) => (
                  <th key={column} className="pb-3 font-medium">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                        {user.initials}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-slate-700">{user.company}</td>
                  <td className="py-4 text-slate-700">{user.branch}</td>
                  <td className="py-4 text-slate-700">{user.role}</td>
                  <td className="py-4">
                    <span className={user.status === "Active" ? badgeClass("green") : badgeClass("gray")}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500">{user.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ToolbarSearch() {
  return (
    <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500">
      <Search className="h-4 w-4" />
      <span>Search users...</span>
    </div>
  );
}

function ToolbarChip({ label }: { label: string }) {
  return (
    <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
      {label}
    </button>
  );
}

function badgeClass(tone: "green" | "gray") {
  return tone === "green"
    ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600"
    : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500";
}

