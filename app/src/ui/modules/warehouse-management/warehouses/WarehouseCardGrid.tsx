import { Building2, FileText, MapPin, Phone, UserRound, Warehouse } from "lucide-react";
import { WarehouseCardGridPageSizeOptions, WarehouseCardGridSkeletonCount } from "@/app/src/constants/modules/warehouse-management/warehouses/WarehouseConstants";
import { getWarehouseAvailableBranchLabel } from "@/app/src/data/modules/warehouse-management/warehouses/WarehouseData";
import type { WarehouseTableProps } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { WarehouseRecordActions } from "@/app/src/ui/modules/warehouse-management/warehouses/WarehouseRecordActions";
import { ModuleTablePagination } from "@/app/src/ui/shared/module/module-table/ModuleTablePagination";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";

export function WarehouseCardGrid({ isLoading, permissions, setPendingDeleteWarehouse, table, onEditWarehouse, onViewWarehouse }: WarehouseTableProps) {
  const rows = table.getRowModel().rows;
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: WarehouseCardGridSkeletonCount }, (_, index) => (
          <WarehouseCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid content-start gap-4">
      {rows.length > 0 ? (
        <div className="grid max-w-[92rem] gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map(({ id, original: warehouse }) => {
            const availableBranches = warehouse.availableBranches.length > 0 ? warehouse.availableBranches : warehouse.branchName ? [warehouse.branchName] : [];
            const availabilityLabel = getWarehouseAvailableBranchLabel(warehouse);
            const additionalBranchCount = Math.max(0, availableBranches.length - 1);
            const missingDetailCount = [warehouse.address, warehouse.managerName, warehouse.contactNo].filter((value) => !value.trim()).length;
            const descriptionLineClampClassName = ["line-clamp-1", "line-clamp-2", "line-clamp-3", "line-clamp-4"][missingDetailCount];

            return (
              <article
                key={id}
                className="group flex min-h-60 flex-col rounded-lg border border-darknavy/10 bg-white p-3 shadow-sm shadow-darknavy/5 transition hover:-translate-y-0.5 hover:border-skyblue/60 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-skyblue/12 text-darknavy">
                    <Warehouse className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onViewWarehouse(warehouse)}
                        className="truncate text-left font-semibold text-darknavy hover:text-skyblue"
                      >
                        {warehouse.name}
                      </button>
                      <span
                        className={
                          warehouse.status === "Active"
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                            : "rounded-full bg-darknavy/6 px-2.5 py-1 text-[11px] font-semibold text-darknavy/55"
                        }
                      >
                        {warehouse.status}
                      </span>
                    </div>
                    <p className="truncate text-sm font-medium text-darknavy/75">{warehouse.code}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-darknavy/65">
                  <p className="flex min-w-0 items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{availabilityLabel}</span>
                    {warehouse.branchAvailabilityMode === "Specific Branches" && additionalBranchCount > 0 ? (
                      <span className="shrink-0 rounded-full bg-skyblue/10 px-1.5 py-0.5 font-semibold text-darknavy">+{additionalBranchCount}</span>
                    ) : null}
                  </p>
                  {warehouse.address ? (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> <span className="truncate">{warehouse.address}</span>
                    </p>
                  ) : null}
                  {warehouse.managerName ? (
                    <p className="flex items-center gap-2">
                      <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> <span className="truncate">{warehouse.managerName}</span>
                    </p>
                  ) : null}
                  {warehouse.contactNo ? (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> <span className="truncate">{warehouse.contactNo}</span>
                    </p>
                  ) : null}
                  <p className="flex min-w-0 items-start gap-2">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <ModuleTooltip className="min-w-0 flex-1" title={warehouse.description || "No description provided"} position="top">
                      <span className={`block leading-5 ${descriptionLineClampClassName}`}>{warehouse.description || "No description provided"}</span>
                    </ModuleTooltip>
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-center pt-4">
                  <WarehouseRecordActions
                    permissions={permissions}
                    warehouse={warehouse}
                    onDeleteWarehouse={setPendingDeleteWarehouse}
                    onEditWarehouse={onEditWarehouse}
                    onViewWarehouse={onViewWarehouse}
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-darknavy/15 bg-white p-8 text-center">
          <div>
            <Warehouse className="mx-auto h-8 w-8 text-darknavy/25" />
            <h2 className="mt-3 font-semibold text-darknavy">No warehouses found</h2>
            <p className="mt-1 text-sm text-darknavy/55">Try changing your search or filters.</p>
          </div>
        </div>
      )}

      <div className="-mb-3 -mx-3">
        <ModuleTablePagination
          firstRow={firstRow}
          label="warehouses"
          lastRow={lastRow}
          page={pageIndex + 1}
          pageLimit={3}
          pageSize={pageSize}
          pageSizeOptions={[...WarehouseCardGridPageSizeOptions]}
          totalRows={totalRows}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </div>
    </div>
  );
}

function WarehouseCardSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-lg border border-darknavy/8 bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-lg bg-darknavy/10" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-4/5 rounded bg-darknavy/10" />
          <div className="h-3 w-24 rounded bg-darknavy/8" />
        </div>
        <div className="h-6 w-16 rounded-full bg-darknavy/8" />
      </div>
      <div className="mt-5 grid gap-3">
        <div className="h-3 w-11/12 rounded bg-darknavy/8" />
        <div className="h-3 w-3/4 rounded bg-darknavy/8" />
        <div className="h-3 w-2/3 rounded bg-darknavy/8" />
        <div className="h-12 w-full rounded bg-darknavy/8" />
      </div>
      <div className="mt-6 mx-auto h-9 w-36 rounded bg-darknavy/8" />
    </div>
  );
}
