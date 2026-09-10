import { FileCog, Plus, Upload } from "lucide-react";
import {
  CollectionTypeDescription,
  CollectionTypeParentLabel,
  CollectionTypeTitle,
} from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import type { CollectionTypePermissions } from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function CollectionTypeHeader({
  onAdd,
  onImport,
  permissions,
  addLabel = "Add Collection Type",
  description = CollectionTypeDescription,
  title = CollectionTypeTitle,
}: {
  onAdd: () => void;
  onImport: () => void;
  permissions: CollectionTypePermissions;
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
          {CollectionTypeParentLabel}
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
