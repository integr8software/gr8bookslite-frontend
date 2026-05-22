"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Download, Plus, Upload } from "lucide-react";
import { TermManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagement";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { TermManagementTable } from "./TermManagementTable";

export function TermManagementListPage() {
  const terms = useTermManagementStore((state) => state.terms);
  const deleteTerm = useTermManagementStore((state) => state.deleteTerm);
  const isLoading = useTermManagementStore((state) => state.isLoading);
  const isMutating = useTermManagementStore((state) => state.isMutating);
  const [pendingDeleteTerm, setPendingDeleteTerm] =
    useState<TermManagement | null>(null);

  function handleConfirmDelete() {
    if (!pendingDeleteTerm) {
      return;
    }

    deleteTerm(pendingDeleteTerm.id);
    setPendingDeleteTerm(null);
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Term Management"
        description="Manage datemode and period definitions used for term reporting and payment cycles."
        eyebrow={
          <>
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Accounting master data
          </>
        }
        actions={<TermManagementHeaderActions />}
      />

      <TermManagementTable
        isLoading={isLoading}
        terms={terms}
        onDeleteTerm={setPendingDeleteTerm}
      />

      <AppDialog
        isOpen={Boolean(pendingDeleteTerm)}
        isPending={isMutating}
        title="Delete term definition?"
        description={`This will remove ${pendingDeleteTerm?.description ?? "the selected term"}.`}
        confirmLabel="Delete Term"
        tone="danger"
        onCancel={() => setPendingDeleteTerm(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}

function TermManagementHeaderActions() {
  return (
    <>
      <button type="button" className={moduleHeaderActionClassNames.secondary}>
        <Upload className="h-4 w-4" aria-hidden="true" />
        Import
      </button>
      <button type="button" className={moduleHeaderActionClassNames.secondary}>
        <Download className="h-4 w-4" aria-hidden="true" />
        Export
      </button>
      <Link
        href={`${TermManagementHref}/add`}
        className={moduleHeaderActionClassNames.primary}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Term
      </Link>
    </>
  );
}
