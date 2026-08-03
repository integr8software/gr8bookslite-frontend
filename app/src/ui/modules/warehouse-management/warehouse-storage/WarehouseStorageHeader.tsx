import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import {
  WarehouseStorageActionLabel,
  WarehouseStorageDescription,
  WarehouseStorageHref,
  WarehouseStorageTitle,
} from "@/app/src/constants/modules/warehouse-management/warehouse-storage/WarehouseStorageConstants";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function WarehouseStorageHeader() {
  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={WarehouseStorageTitle}
      description={WarehouseStorageDescription}
      actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
      eyebrow={
        <>
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          Warehouse management
        </>
      }
      actions={
        <Link href={`${WarehouseStorageHref}/add`} className={moduleHeaderActionClassNames.primary}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {WarehouseStorageActionLabel}
        </Link>
      }
    />
  );
}
