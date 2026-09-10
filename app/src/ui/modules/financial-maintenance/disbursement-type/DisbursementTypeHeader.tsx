import { FileCog, Plus, Upload } from "lucide-react";
import {
  DisbursementTypeDescription,
  DisbursementTypeParentLabel,
  DisbursementTypeTitle,
} from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import type { DisbursementTypePermissions } from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function DisbursementTypeHeader({
  onAdd,
  onImport,
  permissions,
  addLabel = "Add Disbursement Type",
  description = DisbursementTypeDescription,
  title = DisbursementTypeTitle,
}: {
  onAdd: () => void;
  onImport: () => void;
  permissions: DisbursementTypePermissions;
  addLabel?: string;
  description?: string;
  title?: string;
}) {
  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={title}
      description={description}
      actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
      eyebrow={
        <>
          <FileCog className="h-3.5 w-3.5" aria-hidden="true" />
          {DisbursementTypeParentLabel}
        </>
      }
      actions={
        <>
          {permissions.canImport ? (
            <button
              type="button"
              onClick={onImport}
              data-spotlight-id="maintenance-import-records"
              className={`${moduleHeaderActionClassNames.secondary} order-2 lg:order-1`}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Import
            </button>
          ) : null}
          {permissions.canCreate ? (
            <button
              type="button"
              onClick={onAdd}
              data-spotlight-id="maintenance-create-record"
              className={`${moduleHeaderActionClassNames.primary} order-1 lg:order-2`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {addLabel}
            </button>
          ) : null}
        </>
      }
    />
  );
}
