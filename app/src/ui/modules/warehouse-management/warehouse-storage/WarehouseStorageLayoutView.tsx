import type { WarehouseStorageLayoutSlot } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageMapUtils";
import { compareWarehouseStorageLocationTokens } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageMapUtils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type AisleBlockProps = {
  aisle: string;
  onSelectRecord: (recordId: string) => void;
  selectedRecordId: string | null;
  slots: WarehouseStorageLayoutSlot[];
};

export function WarehouseStorageAisleBlock({
  aisle,
  onSelectRecord,
  selectedRecordId,
  slots,
}: AisleBlockProps) {
  const racks = Array.from(new Set(slots.map((slot) => slot.rack))).sort(
    compareWarehouseStorageLocationTokens,
  );

  return (
    <div className="rounded-lg border border-darknavy/10 bg-white p-2 shadow-sm shadow-darknavy/5">
      <div className="mb-2 text-center text-xs font-bold text-darknavy/65">Aisle {aisle}</div>
      <div className="grid gap-2 md:grid-cols-2">
        {racks.map((rack) => {
          const rackSlots = slots.filter((slot) => slot.rack === rack);
          const levels = Array.from(new Set(rackSlots.map((slot) => slot.shelf))).sort(
            compareWarehouseStorageLocationTokens,
          );

          return (
            <div key={rack} className="rounded-md border border-darknavy/5 bg-offwhite/80 p-2">
              <div className="mb-2 text-[11px] font-bold text-darknavy/65">Rack {rack}</div>
              <div className="space-y-2">
                {levels.map((shelf) => (
                  <div key={shelf}>
                    <div className="mb-1 text-[10px] font-bold uppercase text-darknavy/40">
                      Level {shelf}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {rackSlots
                        .filter((slot) => slot.shelf === shelf)
                        .map((slot) => (
                          <SlotButton
                            key={slot.id}
                            isSelected={slot.record?.id === selectedRecordId}
                            onSelectRecord={onSelectRecord}
                            slot={slot}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WarehouseStorageLegendDot({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={joinClasses("h-3 w-3 rounded-sm", className)} />
      {label}
    </span>
  );
}

function SlotButton({
  isSelected,
  onSelectRecord,
  slot,
}: {
  isSelected: boolean;
  onSelectRecord: (recordId: string) => void;
  slot: WarehouseStorageLayoutSlot;
}) {
  return (
    <button
      type="button"
      disabled={!slot.record}
      onClick={() => slot.record && onSelectRecord(slot.record.id)}
      className={joinClasses(
        "grid h-9 place-items-center rounded-md border text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-4",
        getSlotClassName(slot.status),
        isSelected ? getSelectedSlotClassName(slot.status) : "",
        !slot.record ? "cursor-default opacity-95" : "hover:-translate-y-0.5",
      )}
      title={slot.record?.path ?? slot.label}
    >
      {slot.label}
    </button>
  );
}

function getSlotClassName(status: WarehouseStorageLayoutSlot["status"]) {
  switch (status) {
    case "Blocked":
      return "border-slate-200 bg-slate-100 text-slate-500 focus-visible:ring-slate-500/20";
    case "Reserved":
      return "border-amber-200 bg-amber-100 text-amber-700 focus-visible:ring-amber-500/20";
    case "Occupied":
      return "border-blue-200 bg-blue-100 text-blue-700 focus-visible:ring-blue-500/20";
    case "Full":
      return "border-rose-200 bg-rose-100 text-rose-700 focus-visible:ring-rose-500/20";
    case "Maintenance":
      return "border-violet-200 bg-violet-100 text-violet-700 focus-visible:ring-violet-500/20";
    default:
      return "border-emerald-200 bg-emerald-100 text-emerald-700 focus-visible:ring-emerald-500/20";
  }
}

function getSelectedSlotClassName(status: WarehouseStorageLayoutSlot["status"]) {
  switch (status) {
    case "Blocked":
      return "border-slate-500 bg-slate-100 text-slate-700 ring-2 ring-slate-500/35";
    case "Reserved":
      return "border-amber-500 bg-amber-100 text-amber-800 ring-2 ring-amber-500/35";
    case "Occupied":
      return "border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-500/35";
    case "Full":
      return "border-rose-500 bg-rose-100 text-rose-800 ring-2 ring-rose-500/35";
    case "Maintenance":
      return "border-violet-500 bg-violet-100 text-violet-800 ring-2 ring-violet-500/35";
    default:
      return "border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/35";
  }
}
