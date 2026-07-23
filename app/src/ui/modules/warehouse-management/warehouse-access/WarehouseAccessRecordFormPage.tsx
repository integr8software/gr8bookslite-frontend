"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import {
  WarehouseAccessFieldClassName,
  WarehouseAccessHref,
  WarehouseAccessPermissionOptions,
  WarehouseAccessPermissionSkeletonCount,
  WarehouseAccessRecordFieldSkeletonCount,
  WarehouseAccessStatusOptions,
  WarehouseAccessTitle,
} from "@/app/src/constants/modules/warehouse-management/warehouse-access/WarehouseAccessConstants";
import { useWarehouseAccessRecordFormPage } from "@/app/src/hooks/modules/warehouse-management/warehouse-access/useWarehouseAccessRecordFormPage";
import type { WarehouseAccessDirectoryUser, WarehouseAccessPermission } from "@/app/src/types/modules/warehouse-management/warehouse-access/WarehouseAccessTypes";
import type { WarehouseModuleFormValues } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";

export function WarehouseAccessRecordFormPage() {
  const page = useWarehouseAccessRecordFormPage();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const isReadonly = page.mode === "view";
  const title = page.mode === "add" ? "Add Warehouse Access" : page.mode === "edit" ? "Edit Warehouse Access" : "Warehouse Access Details";

  if (page.isLoading) {
    return <WarehouseAccessRecordFormSkeleton title={title} />;
  }

  if (page.isNotFound) {
    return <WarehouseAccessNotFound />;
  }

  function updateField<TKey extends keyof WarehouseModuleFormValues>(field: TKey, value: WarehouseModuleFormValues[TKey]) {
    page.setForm({ ...page.form, [field]: value });
  }

  return (
    <form className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={title}
        description={isReadonly ? "Review the selected warehouse access assignment." : "Assign a user and permissions to a warehouse."}
        eyebrow={
          <>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {WarehouseAccessTitle}
          </>
        }
        actions={
          <>
            <Link href={WarehouseAccessHref} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {!isReadonly ? (
              <button type="button" disabled={page.isMutating} className={moduleHeaderActionClassNames.primary} onClick={() => setIsSaveDialogOpen(true)}>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            ) : null}
          </>
        }
      />
      <section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-darknavy">Warehouse</span>
            <select
              value={page.form.warehouseId}
              disabled={isReadonly}
              className={WarehouseAccessFieldClassName}
              onChange={(event) => updateField("warehouseId", event.target.value)}
            >
              {page.warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </label>
          <UserField
            form={page.form}
            readOnly={isReadonly}
            users={page.users}
            onChange={(userId) => {
              const selectedUser = page.users.find((user) => user.id === userId);

              if (!selectedUser) return;

              page.setForm({
                ...page.form,
                userEmail: selectedUser.email,
                userId: selectedUser.id,
                userName: selectedUser.name,
              });
            }}
          />
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-darknavy">Status</span>
            <select
              value={page.form.status}
              disabled={isReadonly}
              className={WarehouseAccessFieldClassName}
              onChange={(event) => updateField("status", event.target.value)}
            >
              {WarehouseAccessStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <PermissionField readOnly={isReadonly} value={page.form.permissions} onChange={(value) => updateField("permissions", value)} />
        </div>
      </section>
      <AppDialog
        confirmLabel="Confirm"
        description="This will save the warehouse access assignment."
        iconTone="question"
        isOpen={isSaveDialogOpen}
        isPending={page.isMutating}
        pendingLabel={getModuleSavePendingLabel(page.mode)}
        title={page.mode === "edit" ? "Save changes?" : "Save this record?"}
        tone="success"
        onCancel={() => setIsSaveDialogOpen(false)}
        onConfirm={() => page.handleSave(page.form)}
      />
    </form>
  );
}

function WarehouseAccessNotFound() {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-darknavy">Warehouse access not found</h1>
      <p className="mt-2 text-sm text-darknavy/55">The selected warehouse access record may have been removed.</p>
      <Link href={WarehouseAccessHref} className={`${moduleHeaderActionClassNames.secondary} mt-5`}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
    </section>
  );
}

function WarehouseAccessRecordFormSkeleton({ title }: { title: string }) {
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={title}
        description="Loading warehouse access assignment."
        eyebrow={
          <>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {WarehouseAccessTitle}
          </>
        }
        actions={
          <Link href={WarehouseAccessHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        }
      />
      <section className="animate-pulse rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: WarehouseAccessRecordFieldSkeletonCount }, (_, index) => (
            <div key={index} className="grid gap-2">
              <div className="h-4 w-24 rounded bg-darknavy/10" />
              <div className="h-11 rounded-md bg-darknavy/8" />
            </div>
          ))}
          <div className="grid gap-2 md:col-span-2">
            <div className="h-4 w-24 rounded bg-darknavy/10" />
            <div className="grid gap-2 rounded-md border border-darknavy/10 p-3 sm:grid-cols-2">
              {Array.from({ length: WarehouseAccessPermissionSkeletonCount }, (_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-darknavy/10" />
                  <div className="h-3.5 w-36 rounded bg-darknavy/8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

function UserField({
  form,
  onChange,
  readOnly,
  users,
}: {
  form: WarehouseModuleFormValues;
  readOnly: boolean;
  users: WarehouseAccessDirectoryUser[];
  onChange: (userId: string) => void;
}) {
  const selectedUserId = form.userId || users.find((user) => user.name === form.userName)?.id || "";

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-darknavy">User</span>
      <select value={selectedUserId} disabled={readOnly} className={WarehouseAccessFieldClassName} onChange={(event) => onChange(event.target.value)}>
        <option value="" disabled>
          Select user
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} - {user.branchName}
          </option>
        ))}
      </select>
      {form.userEmail ? <span className="text-xs text-darknavy/50">{form.userEmail}</span> : null}
    </label>
  );
}

function PermissionField({
  onChange,
  readOnly,
  value,
}: {
  readOnly: boolean;
  value: WarehouseAccessPermission[];
  onChange: (value: WarehouseAccessPermission[]) => void;
}) {
  return (
    <fieldset className="grid gap-2 md:col-span-2">
      <legend className="text-sm font-semibold text-darknavy">Permissions</legend>
      <div className="grid gap-2 rounded-md border border-darknavy/10 p-3 sm:grid-cols-2">
        {WarehouseAccessPermissionOptions.map((permission) => (
          <label key={permission} className="flex items-center gap-2 text-sm font-medium text-darknavy">
            <input
              type="checkbox"
              checked={value.includes(permission)}
              disabled={readOnly}
              className="h-4 w-4 accent-skyblue"
              onChange={(event) => {
                onChange(event.target.checked ? [...value, permission] : value.filter((current) => current !== permission));
              }}
            />
            {permission}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
