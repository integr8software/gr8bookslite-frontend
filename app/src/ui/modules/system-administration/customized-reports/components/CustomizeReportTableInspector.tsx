import { Maximize2, Plus, Table2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { FieldNumberControl } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportFormControls";
import {
  InspectorNumberInputClassName,
  ToolbarButtonClassName,
} from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import type {
  CustomizeReportAlign,
  CustomizeReportMarginSetup,
  CustomizeReportPageSetup,
  CustomizeReportTableBorderSetup,
  CustomizeReportTableColumn,
  CustomizeReportTableColumnKey,
  CustomizeReportTableSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
import {
  clamp,
  createUniformTableBorderSetup,
  getTableBorderSetup,
} from "@/app/src/ui/modules/system-administration/customized-reports/utils/CustomizeReportDesignerUtils";

type CustomizeReportTableInspectorProps = {
  marginSetup: CustomizeReportMarginSetup;
  pageSetup: CustomizeReportPageSetup;
  tableSetup: CustomizeReportTableSetup;
  onAddColumn: () => void;
  onRemoveColumn: (columnKey: CustomizeReportTableColumnKey) => void;
  onTableColumnChange: (
    columnKey: CustomizeReportTableColumnKey,
    updater: (column: CustomizeReportTableColumn) => CustomizeReportTableColumn,
  ) => void;
  onTableSetupChange: (
    updater: (setup: CustomizeReportTableSetup) => CustomizeReportTableSetup,
  ) => void;
};

export function CustomizeReportTableInspector(props: CustomizeReportTableInspectorProps) {
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const visibleColumnCount = props.tableSetup.columns.filter((column) => column.visible).length;

  return (
    <>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-600">
            <Table2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800">Items Table</p>
            <p className="mt-1 text-xs text-slate-500">
              {visibleColumnCount} visible columns, {props.tableSetup.previewRows} design rows
            </p>
          </div>
        </div>
        <button
          className={`${ToolbarButtonClassName} mt-3 w-full justify-center`}
          onClick={() => setIsDesignerOpen(true)}
          type="button"
        >
          <Table2 className="h-4 w-4" />
          Table Designer
        </button>
      </div>

      {isDesignerOpen ? (
        <CustomizeReportTableDesignerDialog
          {...props}
          onClose={() => setIsDesignerOpen(false)}
        />
      ) : null}
    </>
  );
}

function CustomizeReportTableDesignerDialog({
  marginSetup,
  onAddColumn,
  onClose,
  onRemoveColumn,
  onTableColumnChange,
  onTableSetupChange,
  pageSetup,
  tableSetup,
}: CustomizeReportTableInspectorProps & { onClose: () => void }) {
  const borderSetup = getTableBorderSetup(tableSetup);
  const allBordersVisible = Object.values(borderSetup).every(Boolean);

  function fitTableToMargins() {
    onTableSetupChange((currentSetup) => {
      const left = marginSetup.visible ? marginSetup.left : currentSetup.x;
      const right = marginSetup.visible ? marginSetup.right : pageSetup.width - currentSetup.x - currentSetup.width;

      return {
        ...currentSetup,
        x: clamp(left, 0, pageSetup.width - 160),
        width: clamp(pageSetup.width - left - right, 160, pageSetup.width - left),
      };
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Table Designer</p>
            <p className="mt-1 text-xs text-slate-500">
              Adjust table size, design rows, columns, labels, widths, and alignment.
            </p>
          </div>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            title="Close"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 overflow-auto p-4">
          <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <section className="rounded-md border border-slate-200 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">Table Size</p>
                <button className={`${ToolbarButtonClassName} h-8 px-2.5`} onClick={fitTableToMargins} type="button">
                  <Maximize2 className="h-4 w-4" />
                  Fit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FieldNumberControl
                  label="X"
                  value={tableSetup.x}
                  onChange={(value) =>
                    onTableSetupChange((currentSetup) => ({
                      ...currentSetup,
                      x: clamp(value, 0, pageSetup.width - currentSetup.width),
                    }))
                  }
                />
                <FieldNumberControl
                  label="Y"
                  value={tableSetup.y}
                  onChange={(value) =>
                    onTableSetupChange((currentSetup) => ({
                      ...currentSetup,
                      y: clamp(value, 0, pageSetup.height - currentSetup.rowHeight),
                    }))
                  }
                />
                <FieldNumberControl
                  label="Width"
                  value={tableSetup.width}
                  onChange={(value) =>
                    onTableSetupChange((currentSetup) => ({
                      ...currentSetup,
                      width: clamp(value, 160, pageSetup.width - currentSetup.x),
                    }))
                  }
                />
                <FieldNumberControl
                  label="Font"
                  value={tableSetup.fontSize}
                  onChange={(value) =>
                    onTableSetupChange((currentSetup) => ({
                      ...currentSetup,
                      fontSize: clamp(value, 8, 24),
                    }))
                  }
                />
                <FieldNumberControl
                  label="Rows"
                  value={tableSetup.previewRows}
                  onChange={(value) =>
                    onTableSetupChange((currentSetup) => ({
                      ...currentSetup,
                      previewRows: clamp(value, 1, 20),
                    }))
                  }
                />
                <FieldNumberControl
                  label="Row Height"
                  value={tableSetup.rowHeight}
                  onChange={(value) =>
                    onTableSetupChange((currentSetup) => ({
                      ...currentSetup,
                      rowHeight: clamp(value, 18, 48),
                    }))
                  }
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className={`${ToolbarButtonClassName} justify-center`}
                  onClick={() =>
                    onTableSetupChange((currentSetup) => ({
                      ...currentSetup,
                      previewRows: clamp(currentSetup.previewRows - 1, 1, 20),
                    }))
                  }
                  type="button"
                >
                  Remove Row
                </button>
                <button
                  className={`${ToolbarButtonClassName} justify-center`}
                  onClick={() =>
                    onTableSetupChange((currentSetup) => ({
                      ...currentSetup,
                      previewRows: clamp(currentSetup.previewRows + 1, 1, 20),
                    }))
                  }
                  type="button"
                >
                  Add Row
                </button>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  checked={allBordersVisible}
                  className="h-4 w-4 accent-orange-500"
                  onChange={(event) =>
                    onTableSetupChange((currentSetup) => ({
                      ...currentSetup,
                      showBorders: event.target.checked,
                      borderSetup: createUniformTableBorderSetup(event.target.checked),
                    }))
                  }
                  type="checkbox"
                />
                All border lines
              </label>
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Border Lines</p>
                <div className="grid grid-cols-2 gap-2">
                  {TableBorderOptions.map((option) => (
                    <label key={option.key} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        checked={borderSetup[option.key]}
                        className="h-4 w-4 accent-orange-500"
                        onChange={(event) =>
                          onTableSetupChange((currentSetup) => {
                            const nextBorderSetup = {
                              ...getTableBorderSetup(currentSetup),
                              [option.key]: event.target.checked,
                            };

                            return {
                              ...currentSetup,
                              showBorders: Object.values(nextBorderSetup).some(Boolean),
                              borderSetup: nextBorderSetup,
                            };
                          })
                        }
                        type="checkbox"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  checked={tableSetup.showHeader}
                  className="h-4 w-4 accent-orange-500"
                  onChange={(event) =>
                    onTableSetupChange((currentSetup) => ({
                      ...currentSetup,
                      showHeader: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                Show table header
              </label>
            </section>

            <section className="rounded-md border border-slate-200 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">Columns</p>
                <button className={`${ToolbarButtonClassName} h-8 px-2.5`} onClick={onAddColumn} type="button">
                  <Plus className="h-4 w-4" />
                  Add Column
                </button>
              </div>

              <div className="grid min-w-[38rem] grid-cols-[2.25rem_minmax(10rem,1fr)_6rem_7rem_2.25rem] gap-2 border-b border-slate-100 pb-2 text-xs font-semibold uppercase text-slate-500">
                <span>Show</span>
                <span>Column Name</span>
                <span>Width</span>
                <span>Align</span>
                <span />
              </div>

              <div className="mt-2 min-w-[38rem] space-y-2">
                {tableSetup.columns.map((column) => (
                  <div
                    key={column.key}
                    className="grid grid-cols-[2.25rem_minmax(10rem,1fr)_6rem_7rem_2.25rem] items-center gap-2 rounded-md border border-slate-100 bg-slate-50 p-2"
                  >
                    <input
                      checked={column.visible}
                      className="h-4 w-4 accent-orange-500"
                      onChange={(event) =>
                        onTableColumnChange(column.key, (currentColumn) => ({
                          ...currentColumn,
                          visible: event.target.checked,
                        }))
                      }
                      title="Show column"
                      type="checkbox"
                    />
                    <input
                      className={InspectorNumberInputClassName}
                      onChange={(event) =>
                        onTableColumnChange(column.key, (currentColumn) => ({
                          ...currentColumn,
                          label: event.target.value,
                        }))
                      }
                      value={column.label}
                    />
                    <input
                      className={InspectorNumberInputClassName}
                      min={24}
                      onChange={(event) =>
                        onTableColumnChange(column.key, (currentColumn) => ({
                          ...currentColumn,
                          width: clamp(Number(event.target.value), 24, 260),
                        }))
                      }
                      type="number"
                      value={column.width}
                    />
                    <select
                      className={InspectorNumberInputClassName}
                      onChange={(event) =>
                        onTableColumnChange(column.key, (currentColumn) => ({
                          ...currentColumn,
                          align: event.target.value as CustomizeReportAlign,
                        }))
                      }
                      value={column.align}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-100 bg-white text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={tableSetup.columns.length <= 1}
                      onClick={() => onRemoveColumn(column.key)}
                      title="Remove column"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 p-4">
          <button className={ToolbarButtonClassName} onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const TableBorderOptions: Array<{
  key: keyof CustomizeReportTableBorderSetup;
  label: string;
}> = [
  { key: "top", label: "Top" },
  { key: "right", label: "Right" },
  { key: "bottom", label: "Bottom" },
  { key: "left", label: "Left" },
  { key: "insideHorizontal", label: "Inside horizontal" },
  { key: "insideVertical", label: "Inside vertical" },
];
