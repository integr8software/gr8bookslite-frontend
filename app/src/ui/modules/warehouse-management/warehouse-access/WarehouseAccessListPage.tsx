"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Plus, Search, ShieldCheck, Trash2, Warehouse } from "lucide-react";
import {
  WarehouseAccessHref,
  WarehouseAccessPermissionDescriptions,
  WarehouseAccessPermissionOptions,
  WarehouseAccessPermissionSkeletonCount,
  WarehouseAccessPrimaryButtonClassName,
  WarehouseAccessSecondaryButtonClassName,
  WarehouseAccessUserSkeletonCount,
} from "@/app/src/constants/modules/warehouse-management/warehouse-access/WarehouseAccessConstants";
import { useWarehouseAccessWorkspace } from "@/app/src/hooks/modules/warehouse-management/warehouse-access/useWarehouseAccessWorkspace";
import type { WarehouseAccessPermission } from "@/app/src/types/modules/warehouse-management/warehouse-access/WarehouseAccessTypes";
import type { DrawerState } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { WarehouseDrawer } from "@/app/src/ui/modules/warehouse-management/warehouses/WarehouseDrawer";

export function WarehouseAccessListPage() {
  const page = useWarehouseAccessWorkspace();
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
  const isLoading = page.isLoading;
  const hasAccess = page.filteredAccess.length > 0;
  const warehouseOptions: AppAdvancedDropdownOption[] = page.warehouses.map((warehouseItem) => ({
    description: warehouseItem.branchName || warehouseItem.code,
    label: warehouseItem.code,
    name: warehouseItem.name,
    value: warehouseItem.id,
  }));

  return (
    <section className="grid gap-4 text-darknavy">
      <header>
        <h1 className="text-xl font-semibold leading-tight text-darknavy sm:text-2xl">Warehouse Access</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-darknavy/65">Manage users and permissions by warehouse.</p>
      </header>

      <section className="rounded-xl border border-darknavy/10 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-skyblue/10 text-skyblue">
                <Warehouse className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 lg:max-w-md">
                <AppAdvancedDropdown
                  addAction={{
                    label: "Add warehouse",
                    onClick: () => setDrawerState({ mode: "add" }),
                  }}
                  emptyMessage="No warehouses found."
                  isClearable={false}
                  options={warehouseOptions}
                  placeholder="Select warehouse"
                  searchPlaceholder="Search warehouse"
                  showSelectedDetails
                  value={page.warehouse?.id ?? ""}
                  onChange={(value) => page.selectWarehouse(Array.isArray(value) ? (value[0] ?? "") : value)}
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-wrap gap-2">
              <SummaryPill label="Branch" value={page.warehouse?.branchName || "All"} />
              <SummaryPill label="Assigned" value={String(page.totalAccessCount)} />
              <SummaryPill label="Active" value={String(page.activeAccessCount)} />
            </div>
          </div>
          <Link href={`${WarehouseAccessHref}/add`} className={WarehouseAccessPrimaryButtonClassName}>
            <Plus className="h-4 w-4" /> Grant Access
          </Link>
        </div>
      </section>

      <div className="grid items-stretch gap-3 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="flex h-[36rem] flex-col overflow-hidden rounded-xl border border-darknavy/10 bg-white shadow-sm">
          <div className="border-b border-darknavy/10 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold leading-tight">Users</h2>
                <p className="mt-0.5 text-xs text-darknavy/45">{page.filteredAccess.length} assigned</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-skyblue/10 text-skyblue">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <label className="mt-3 flex items-center gap-2 rounded-md border border-darknavy/15 px-3 focus-within:border-skyblue">
              <Search className="h-4 w-4 text-darknavy/40" />
              <input
                value={page.query}
                className="min-w-0 flex-1 py-2.5 text-sm outline-none"
                placeholder="Search users"
                onChange={(event) => page.setQuery(event.target.value)}
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <WarehouseAccessUserListSkeleton />
            ) : (
              page.filteredAccess.map((access) => (
                <button
                  key={access.id}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${page.selectedAccessId === access.id ? "border-skyblue bg-skyblue/8" : "border-transparent hover:bg-offwhite"}`}
                  onClick={() => page.selectAccess(access)}
                >
                  <Avatar name={access.userName} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{access.userName}</span>
                    <span className="block text-xs text-darknavy/55">{access.permissions.length} permissions</span>
                  </span>
                  <span className={`h-2 w-2 rounded-full ${access.status === "Active" ? "bg-emerald-600" : "bg-amber-500"}`} aria-label={access.status} />
                </button>
              ))
            )}
            {!isLoading && page.filteredAccess.length === 0 ? <EmptyUsersState query={page.query} /> : null}
          </div>
        </aside>

        <main className="flex h-[36rem] flex-col overflow-hidden rounded-xl border border-darknavy/10 bg-white shadow-sm">
          {isLoading ? (
            <WarehouseAccessDetailSkeleton />
          ) : page.draft && hasAccess ? (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-darknavy/10 px-5 py-4">
                <Avatar name={page.draft.userName} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold leading-tight">{page.draft.userName}</h2>
                  <p className="truncate text-xs text-darknavy/50">{page.draft.userEmail ?? getEmail(page.draft.userName)}</p>
                </div>
                {page.isDirty ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Unsaved</span> : null}
                <select
                  value={page.draft.status}
                  className="rounded border border-darknavy/15 bg-white px-2.5 py-2 text-xs font-semibold outline-none"
                  onChange={(event) => page.updateDraft("status", event.target.value as "Active" | "Inactive")}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold leading-tight">Permissions</h3>
                    <p className="mt-0.5 text-xs text-darknavy/45">Edit what this user can do in the selected warehouse.</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs font-semibold text-skyblue hover:bg-skyblue/10"
                    onClick={page.toggleAllPermissions}
                  >
                    {page.draft.permissions.length === WarehouseAccessPermissionOptions.length ? "Clear all" : "Select all"}
                  </button>
                </div>
                <div className="grid gap-2 rounded-xl border border-darknavy/10 bg-offwhite/25 p-2 sm:grid-cols-2 2xl:grid-cols-3">
                  {WarehouseAccessPermissionOptions.map((permission) => (
                    <PermissionOption
                      key={permission}
                      permission={permission}
                      checked={page.draft!.permissions.includes(permission)}
                      onToggle={() => page.togglePermission(permission)}
                    />
                  ))}
                </div>
              </div>

              <footer className="mt-auto flex flex-col gap-3 border-t border-darknavy/10 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:justify-start"
                  onClick={() => setIsRevokeOpen(true)}
                >
                  <Trash2 className="h-4 w-4" /> Revoke
                </button>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button type="button" disabled={!page.isDirty} className={WarehouseAccessSecondaryButtonClassName} onClick={page.discardChanges}>
                    Discard
                  </button>
                  <button
                    type="button"
                    disabled={page.isMutating || !page.isDirty || page.draft.permissions.length === 0}
                    className={WarehouseAccessPrimaryButtonClassName}
                    onClick={page.saveChanges}
                  >
                    <Check className="h-4 w-4" /> Save
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <EmptyAccessState query={page.query} warehouseName={page.warehouse?.name ?? "this warehouse"} />
          )}
        </main>
      </div>

      <AppDialog
        isOpen={isRevokeOpen}
        isPending={page.isMutating}
        title="Revoke warehouse access?"
        description={`Remove ${page.draft?.userName ?? "this user"} from ${page.warehouse?.name ?? "this warehouse"}?`}
        confirmLabel="Revoke"
        tone="danger"
        onCancel={() => setIsRevokeOpen(false)}
        onConfirm={() => {
          page.revokeAccess();
          setIsRevokeOpen(false);
        }}
      />
      <WarehouseDrawer
        isOpen={Boolean(drawerState)}
        mode={drawerState?.mode ?? "add"}
        warehouse={drawerState?.warehouse}
        onClose={() => setDrawerState(null)}
      />
    </section>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-md bg-offwhite px-3 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">{label}</span>
      <span className="font-bold">{value}</span>
    </span>
  );
}

function EmptyAccessState({ compact = false, query, warehouseName }: { compact?: boolean; query: string; warehouseName: string }) {
  const hasSearch = query.trim().length > 0;

  return (
    <div className={`grid h-full place-items-center text-center ${compact ? "px-4 py-8" : "min-h-[30rem] p-8"}`}>
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-skyblue/10 text-skyblue">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <p className="mt-3 text-sm font-semibold">{hasSearch ? "No matching users" : "No access assigned yet"}</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-darknavy/50">
          {hasSearch ? "Try another search term or clear the search field." : `${warehouseName} does not have assigned users yet.`}
        </p>
        {hasSearch || compact ? null : (
          <Link href={`${WarehouseAccessHref}/add`} className={`${WarehouseAccessPrimaryButtonClassName} mt-4`}>
            <Plus className="h-4 w-4" /> Grant Access
          </Link>
        )}
      </div>
    </div>
  );
}

function EmptyUsersState({ query }: { query: string }) {
  const hasSearch = query.trim().length > 0;

  return (
    <div className="grid h-full min-h-[16rem] place-items-center rounded-lg border border-dashed border-darknavy/10 bg-offwhite/30 px-4 text-center">
      <div>
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white text-skyblue shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <p className="mt-3 text-sm font-semibold">{hasSearch ? "No matching users" : "No users assigned"}</p>
        <p className="mt-1 text-xs leading-5 text-darknavy/45">{hasSearch ? "Try a different search." : "Use Grant Access to add users."}</p>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-darknavy text-xs font-bold text-white">
      {name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}

function getEmail(name: string) {
  return `${name.trim().toLowerCase().replace(/\s+/g, ".")}@company.com`;
}

function PermissionOption({ checked, onToggle, permission }: { checked: boolean; onToggle: () => void; permission: WarehouseAccessPermission }) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${checked ? "border-skyblue/35 bg-skyblue/8" : "border-gray-300 bg-white hover:border-skyblue"}`}
    >
      <input type="checkbox" checked={checked} className="peer sr-only" onChange={onToggle} />
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-darknavy/25 peer-checked:border-skyblue peer-checked:bg-skyblue peer-checked:text-white">
        {checked ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      <span>
        <span className="block text-sm font-semibold">{permission}</span>
        <span className="block text-xs text-darknavy/50">{WarehouseAccessPermissionDescriptions[permission]}</span>
      </span>
    </label>
  );
}

function WarehouseAccessUserListSkeleton() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: WarehouseAccessUserSkeletonCount }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3 rounded-lg border border-transparent px-3 py-2.5">
          <div className="h-10 w-10 rounded-full bg-darknavy/10" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-darknavy/10" />
            <div className="h-3 w-24 rounded bg-darknavy/8" />
          </div>
          <div className="h-2 w-2 rounded-full bg-darknavy/10" />
        </div>
      ))}
    </div>
  );
}

function WarehouseAccessDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-wrap items-center gap-3 border-b border-darknavy/10 px-5 py-4">
        <div className="h-10 w-10 rounded-full bg-darknavy/10" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-48 rounded bg-darknavy/10" />
          <div className="h-3 w-64 rounded bg-darknavy/8" />
        </div>
        <div className="h-9 w-24 rounded bg-darknavy/8" />
      </div>
      <div className="p-5">
        <div className="mb-3 space-y-2">
          <div className="h-4 w-28 rounded bg-darknavy/10" />
          <div className="h-3 w-72 rounded bg-darknavy/8" />
        </div>
        <div className="grid gap-2 rounded-xl border border-darknavy/10 bg-offwhite/25 p-2 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: WarehouseAccessPermissionSkeletonCount }, (_, index) => (
            <div key={index} className="h-20 rounded-lg bg-white p-3">
              <div className="h-4 w-3/5 rounded bg-darknavy/10" />
              <div className="mt-3 h-3 w-5/6 rounded bg-darknavy/8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
