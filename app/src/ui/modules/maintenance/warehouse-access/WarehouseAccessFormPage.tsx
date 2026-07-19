"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { ArrowLeft, Building2, Check, Search, ShieldCheck, Users } from "lucide-react";
import {
  WarehouseAccessCompactFieldClassName,
  WarehouseAccessHref,
  WarehouseAccessLinkButtonClassName,
  WarehouseAccessPermissionOptions,
  WarehouseAccessPermissionSkeletonCount,
  WarehouseAccessUserSkeletonCount,
  WarehouseAccessWarehouseSkeletonCount,
} from "@/app/src/constants/modules/maintenance/warehouse-access/WarehouseAccessConstants";
import { useWarehouseAccessFormPage } from "@/app/src/hooks/modules/maintenance/warehouse-access/useWarehouseAccessFormPage";
import type { WarehouseAccessUserFilter } from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function WarehouseAccessFormPage() {
  const page = useWarehouseAccessFormPage();
  const [userFilter, setUserFilter] = useState<WarehouseAccessUserFilter>("Available");
  const [showWarehouseMatrix, setShowWarehouseMatrix] = useState(false);
  const isAssigned = (user: (typeof page.filteredUsers)[number]) => page.hasAccessInEveryWarehouse(user.id, user.name);
  const availableUsers = page.filteredUsers.filter((user) => !isAssigned(user));
  const assignedUsers = page.filteredUsers.filter(isAssigned);
  const displayedUsers = userFilter === "Available" ? availableUsers : userFilter === "Assigned" ? assignedUsers : page.filteredUsers;
  const allFilteredSelected = availableUsers.length > 0 && availableUsers.every((user) => page.selectedUserIds.includes(user.id));
  const selectedUsers = page.filteredUsers.filter((user) => page.selectedUserIds.includes(user.id));
  const selectedWarehouseCount = page.selectedWarehouses.length;
  const assignmentCount = page.selectedUserIds.length * selectedWarehouseCount;
  const canGrant =
    !page.isMutating &&
    page.selectedUserIds.length > 0 &&
    selectedWarehouseCount > 0 &&
    page.selectedWarehouses.every((warehouse) => (page.permissionsByWarehouse[warehouse.id]?.length ?? 0) > 0);

  return (
    <section className="grid gap-3 text-darknavy">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold leading-tight sm:text-2xl">Grant Warehouse Access</h1>
          <p className="mt-1.5 text-sm leading-6 text-darknavy/65">Select warehouses, users, and permissions without leaving the same view.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={WarehouseAccessHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <button type="button" disabled={!canGrant} className={moduleHeaderActionClassNames.primary} onClick={page.grantAccess}>
            <ShieldCheck className="h-4 w-4" /> Grant Access
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-darknavy/10 px-3 py-2.5">
          <PanelTitle icon={<Building2 className="h-4 w-4" />} title="Warehouses" detail={`${selectedWarehouseCount} of ${page.warehouses.length} selected`} />
          <button type="button" className={`${WarehouseAccessLinkButtonClassName} ml-auto`} onClick={page.toggleAllWarehouses}>
            {page.warehouseIds.length === page.warehouses.length ? "Clear all" : "Select all"}
          </button>
        </div>
        <div className="grid max-h-44 gap-2 overflow-y-auto p-3 sm:grid-cols-2 xl:grid-cols-5">
          {page.isLoading ? (
            <WarehouseAccessWarehouseSkeleton />
          ) : (
            page.warehouses.map((warehouse) => (
              <label
                key={warehouse.id}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 transition ${
                  page.warehouseIds.includes(warehouse.id) ? "border-skyblue bg-skyblue/10" : "border-darknavy/10 hover:bg-offwhite"
                }`}
              >
                <input
                  type="checkbox"
                  checked={page.warehouseIds.includes(warehouse.id)}
                  className="h-4 w-4 accent-skyblue"
                  onChange={() => page.toggleWarehouse(warehouse.id)}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{warehouse.name}</span>
                  <span className="block truncate text-xs text-darknavy/45">{warehouse.branchName || warehouse.code}</span>
                </span>
              </label>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(28rem,0.9fr)]">
        <section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm xl:border-l-2 xl:border-l-darknavy/15">
          <div className="flex flex-wrap items-center gap-3 border-b border-darknavy/10 px-3 py-2.5">
            <PanelTitle icon={<Users className="h-4 w-4" />} title="Users" detail={`${page.selectedUserIds.length} selected`} />
            <div className="ml-auto flex items-center gap-3">
              {page.selectedUserIds.length > 0 ? (
                <button type="button" className="text-xs font-semibold text-darknavy/55 transition hover:text-darknavy" onClick={page.clearSelectedUsers}>
                  Clear selection
                </button>
              ) : null}
              <button type="button" className={WarehouseAccessLinkButtonClassName} disabled={availableUsers.length === 0} onClick={page.toggleAllFiltered}>
                {allFilteredSelected ? "Clear available" : "Select available"}
              </button>
            </div>
          </div>

          <div className="grid gap-2 border-b border-darknavy/10 p-3 lg:grid-cols-[minmax(16rem,1fr)_12rem_auto]">
            <label className="flex h-10 items-center gap-2 rounded-md border border-darknavy/15 px-3 focus-within:border-skyblue">
              <Search className="h-4 w-4 text-darknavy/40" />
              <input
                value={page.query}
                className="min-w-0 flex-1 text-sm outline-none"
                placeholder="Search name or email"
                onChange={(event) => page.setQuery(event.target.value)}
              />
            </label>
            <select value={page.branchFilter} className={WarehouseAccessCompactFieldClassName} onChange={(event) => page.setBranchFilter(event.target.value)}>
              <option value="All">All branches</option>
              {page.branchOptions.map((branch) => (
                <option key={branch}>{branch}</option>
              ))}
            </select>
            <div className="flex rounded-md bg-offwhite p-1">
              <FilterButton active={userFilter === "Available"} label={`Available ${availableUsers.length}`} onClick={() => setUserFilter("Available")} />
              <FilterButton active={userFilter === "Assigned"} label={`Assigned ${assignedUsers.length}`} onClick={() => setUserFilter("Assigned")} />
              <FilterButton active={userFilter === "All"} label={`All ${page.filteredUsers.length}`} onClick={() => setUserFilter("All")} />
            </div>
          </div>

          <div className="max-h-[23rem] overflow-y-auto p-2">
            {page.isLoading ? (
              <WarehouseAccessSelectableUserSkeleton />
            ) : (
              <div className="grid gap-1 sm:grid-cols-2">
                {displayedUsers.map((user) => {
                  const assigned = isAssigned(user);
                  const selected = page.selectedUserIds.includes(user.id);

                  return (
                    <label
                      key={user.id}
                      className={`flex items-center gap-3 rounded-md border px-3 py-2 transition ${
                        assigned
                          ? "cursor-not-allowed border-transparent opacity-55"
                          : selected
                            ? "cursor-pointer border-skyblue bg-skyblue/10"
                            : "cursor-pointer border-transparent hover:bg-offwhite"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={assigned}
                        className="h-4 w-4 accent-skyblue"
                        onChange={() => page.toggleUser(user.id)}
                      />
                      <Avatar name={user.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{user.name}</span>
                        <span className="block truncate text-xs text-darknavy/50">
                          {user.email} - {user.branchName}
                        </span>
                      </span>
                      {assigned ? (
                        <span className="rounded-full bg-darknavy/5 px-2 py-1 text-[11px] font-semibold">Has access</span>
                      ) : selected ? (
                        <Check className="h-4 w-4 text-skyblue" />
                      ) : null}
                    </label>
                  );
                })}
              </div>
            )}
            {!page.isLoading && displayedUsers.length === 0 ? (
              <EmptyState title={page.query ? "No matching users" : `No ${userFilter.toLowerCase()} users`} />
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-darknavy/10 px-3 py-2.5">
            <PanelTitle
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Permissions"
              detail={selectedWarehouseCount > 0 ? `${selectedWarehouseCount} warehouse${selectedWarehouseCount === 1 ? "" : "s"}` : "Select warehouse first"}
            />
            {page.selectedWarehouses.length > 1 ? (
              <button
                type="button"
                className={`${WarehouseAccessLinkButtonClassName} ml-auto`}
                onClick={() => {
                  if (showWarehouseMatrix) page.useSamePermissionsForAll();
                  setShowWarehouseMatrix((current) => !current);
                }}
              >
                {showWarehouseMatrix ? "Same for all" : "Per warehouse"}
              </button>
            ) : null}
          </div>

          <div className="p-3">
            {page.isLoading ? <WarehouseAccessPermissionPanelSkeleton /> : null}

            {!page.isLoading && page.selectedWarehouses.length === 0 ? <EmptyState title="Select at least one warehouse" /> : null}

            {!page.isLoading && page.selectedWarehouses.length > 0 && !showWarehouseMatrix ? (
              <div className="grid gap-2">
                {WarehouseAccessPermissionOptions.map((permission) => {
                  const checked = page.selectedWarehouses.every((warehouse) => (page.permissionsByWarehouse[warehouse.id] ?? []).includes(permission));

                  return (
                    <label
                      key={permission}
                      className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition ${
                        checked ? "border-skyblue bg-skyblue/10" : "border-darknavy/10 hover:bg-offwhite"
                      }`}
                    >
                      <input type="checkbox" checked={checked} className="h-4 w-4 accent-skyblue" onChange={() => page.togglePermissionForAll(permission)} />
                      <span className="text-sm font-semibold">{permission}</span>
                    </label>
                  );
                })}
              </div>
            ) : null}

            {!page.isLoading && page.selectedWarehouses.length > 0 && showWarehouseMatrix ? (
              <div className="max-h-[23rem] overflow-auto rounded-md border border-darknavy/10">
                <table className="w-full min-w-[44rem] border-collapse text-sm">
                  <thead className="bg-offwhite/70">
                    <tr>
                      <th className="sticky left-0 top-0 z-20 min-w-40 border-b border-r border-darknavy/20 bg-offwhite px-3 py-2 text-left font-semibold shadow-[inset_-1px_0_0_rgba(8,27,54,0.16)]">
                        Warehouse
                      </th>
                      {WarehouseAccessPermissionOptions.map((permission) => {
                        const checked = page.selectedWarehouses.every((warehouse) => (page.permissionsByWarehouse[warehouse.id] ?? []).includes(permission));

                        return (
                          <th
                            key={permission}
                            className="sticky top-0 z-10 min-w-24 border-b border-darknavy/10 bg-offwhite px-2 py-2 text-center align-bottom"
                          >
                            <label className="inline-grid cursor-pointer justify-items-center gap-1.5">
                              <span className="max-w-20 text-[11px] leading-4">{permission}</span>
                              <input
                                type="checkbox"
                                checked={checked}
                                className="h-4 w-4 accent-skyblue"
                                onChange={() => page.togglePermissionForAll(permission)}
                              />
                            </label>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {page.selectedWarehouses.map((warehouse) => {
                      const permissions = page.permissionsByWarehouse[warehouse.id] ?? [];

                      return (
                        <tr key={warehouse.id} className="hover:bg-offwhite/50">
                          <th className="sticky left-0 z-10 border-r border-t border-darknavy/20 bg-white px-3 py-2 text-left shadow-[inset_-1px_0_0_rgba(8,27,54,0.16)]">
                            <span className="block font-semibold">{warehouse.code}</span>
                            <span className="block text-xs font-normal text-darknavy/45">{warehouse.branchName || warehouse.name}</span>
                          </th>
                          {WarehouseAccessPermissionOptions.map((permission) => (
                            <td key={permission} className="border-t border-darknavy/10 p-2 text-center">
                              <input
                                aria-label={`${permission} for ${warehouse.name}`}
                                type="checkbox"
                                checked={permissions.includes(permission)}
                                className="h-4 w-4 accent-skyblue"
                                onChange={() => page.togglePermission(warehouse.id, permission)}
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <footer className="sticky bottom-0 z-20 flex flex-col gap-3 rounded-lg border border-darknavy/10 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {page.selectedUserIds.length} user
            {page.selectedUserIds.length === 1 ? "" : "s"} x {selectedWarehouseCount} warehouse
            {selectedWarehouseCount === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-darknavy/50">Up to {assignmentCount} assignments; existing access is skipped.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedUsers.length > 0 ? (
            <div className="hidden -space-x-2 md:flex">
              {selectedUsers.slice(0, 5).map((user) => (
                <Avatar key={user.id} name={user.name} small />
              ))}
              {selectedUsers.length > 5 ? (
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-darknavy/10 text-[10px] font-bold">
                  +{selectedUsers.length - 5}
                </span>
              ) : null}
            </div>
          ) : null}
          <button type="button" disabled={!canGrant} className={moduleHeaderActionClassNames.primary} onClick={page.grantAccess}>
            <ShieldCheck className="h-4 w-4" /> Grant Access
          </button>
        </div>
      </footer>
    </section>
  );
}

function PanelTitle({ detail, icon, title }: { detail: string; icon: ReactNode; title: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-skyblue text-white">{icon}</span>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-bold">{title}</h2>
        <p className="truncate text-xs text-darknavy/50">{detail}</p>
      </div>
    </div>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`rounded px-2.5 py-1.5 text-xs font-semibold transition ${
        active ? "bg-white text-darknavy shadow-sm" : "text-darknavy/50 hover:text-darknavy"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border-2 border-white bg-darknavy font-bold text-white ${
        small ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-xs"
      }`}
    >
      {initials(name)}
    </span>
  );
}

function EmptyState({ description, title }: { description?: string; title: string }) {
  return (
    <div className="grid min-h-36 place-items-center p-6 text-center">
      <div>
        <Users className="mx-auto h-8 w-8 text-darknavy/15" />
        <p className="mt-3 text-sm font-semibold">{title}</p>
        {description ? <p className="mt-1 max-w-sm text-xs leading-5 text-darknavy/50">{description}</p> : null}
      </div>
    </div>
  );
}

function WarehouseAccessWarehouseSkeleton() {
  return (
    <>
      {Array.from({ length: WarehouseAccessWarehouseSkeletonCount }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-2 rounded-md border border-darknavy/10 px-2.5 py-2">
          <div className="h-4 w-4 rounded bg-darknavy/10" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-darknavy/10" />
            <div className="h-3 w-1/2 rounded bg-darknavy/8" />
          </div>
        </div>
      ))}
    </>
  );
}

function WarehouseAccessSelectableUserSkeleton() {
  return (
    <div className="grid gap-1 sm:grid-cols-2">
      {Array.from({ length: WarehouseAccessUserSkeletonCount }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3 rounded-md border border-transparent px-3 py-2">
          <div className="h-4 w-4 rounded bg-darknavy/10" />
          <div className="h-9 w-9 rounded-full bg-darknavy/10" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-darknavy/10" />
            <div className="h-3 w-5/6 rounded bg-darknavy/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

function WarehouseAccessPermissionPanelSkeleton() {
  return (
    <div className="grid animate-pulse gap-2">
      {Array.from({ length: WarehouseAccessPermissionSkeletonCount }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-md border border-darknavy/10 px-3 py-2.5">
          <div className="h-4 w-4 rounded bg-darknavy/10" />
          <div className="h-3.5 w-36 rounded bg-darknavy/10" />
        </div>
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
