"use client";

import { useState } from "react";
import { Warehouse } from "lucide-react";
import type { DrawerState } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { WarehouseDrawer } from "@/app/src/ui/modules/warehouse-management/warehouses/WarehouseDrawer";

type WarehouseScope = {
  branchName?: string;
  code?: string;
  id: string;
  name: string;
};

type StorageLayoutWarehouseSwitcherProps = {
  onChange: (warehouseId: string) => void;
  value: string;
  warehouses: ReadonlyArray<WarehouseScope>;
};

export function StorageLayoutWarehouseSwitcher({
  onChange,
  value,
  warehouses,
}: StorageLayoutWarehouseSwitcherProps) {
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
  const options: AppAdvancedDropdownOption[] = warehouses.map((warehouse) => ({
    description: warehouse.branchName || warehouse.code || "",
    label: warehouse.code || "",
    name: warehouse.name,
    value: warehouse.id,
  }));

  return (
    <>
      <section
        aria-label="Warehouse switcher"
        className="rounded-xl border border-darknavy/10 bg-white p-3 shadow-sm"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-skyblue/10 text-skyblue">
            <Warehouse className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 lg:max-w-md">
            <AppAdvancedDropdown
              addAction={{
                label: "Add warehouse",
                onClick: () => setDrawerState({ mode: "add" }),
              }}
              emptyMessage="No warehouses found."
              isClearable={false}
              options={options}
              placeholder="Select warehouse"
              searchPlaceholder="Search warehouse"
              showSelectedDetails
              value={value}
              onChange={(nextValue) =>
                onChange(Array.isArray(nextValue) ? (nextValue[0] ?? "") : nextValue)
              }
            />
          </div>
        </div>
      </section>
      <WarehouseDrawer
        isOpen={Boolean(drawerState)}
        mode={drawerState?.mode ?? "add"}
        warehouse={drawerState?.warehouse}
        onClose={() => setDrawerState(null)}
      />
    </>
  );
}
