"use client";

import { getAuditLogsData } from "@/app/src/services/modules/admin/ErpAdminService";

export function AuditLogsPage() {
  const { logs } = getAuditLogsData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Audit Logs
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Track significant actions across companies, modules, and branches from
          a single searchable stream.
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="rounded-[1.75rem] border border-slate-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{log.action}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {log.actor} â€¢ {log.module}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {log.timestamp}
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-600">
                <p>Company: <span className="font-semibold text-slate-900">{log.company}</span></p>
                <p>Branch: <span className="font-semibold text-slate-900">{log.branch}</span></p>
                <p>Actor: <span className="font-semibold text-slate-900">{log.actor}</span></p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{log.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

