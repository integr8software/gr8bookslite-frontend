import { useState } from "react";
import { X } from "lucide-react";
import {
  CustomizeReportPaperSizeOptions,
  CustomizeReportPaperSourceOptions,
} from "@/app/src/data/modules/system-administration/customized-reports/CustomizeReportData";
import { InspectorNumberInputClassName } from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import type {
  CustomizeReportMarginSetup,
  CustomizeReportPageSetup,
  CustomizeReportPaperFormat,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
import {
  clamp,
  getPageSetup,
} from "@/app/src/ui/modules/system-administration/customized-reports/utils/CustomizeReportDesignerUtils";

type PageSetupTab = "margins" | "paper" | "layout";

type CustomizeReportPageSetupDialogProps = {
  isOpen: boolean;
  marginSetup: CustomizeReportMarginSetup;
  pageSetup: CustomizeReportPageSetup;
  onClose: () => void;
  onMarginSetupChange: (
    updater: (setup: CustomizeReportMarginSetup) => CustomizeReportMarginSetup,
  ) => void;
  onPageSetupChange: (
    updater: (setup: CustomizeReportPageSetup) => CustomizeReportPageSetup,
  ) => void;
};

const PixelsPerInch = 96;

export function CustomizeReportPageSetupDialog({
  isOpen,
  marginSetup,
  onClose,
  onMarginSetupChange,
  onPageSetupChange,
  pageSetup,
}: CustomizeReportPageSetupDialogProps) {
  const [activeTab, setActiveTab] = useState<PageSetupTab>("paper");

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-bold text-slate-900">Page Setup</p>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            title="Close"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 overflow-auto p-4">
          <div className="mb-4 inline-flex overflow-hidden rounded-md border border-slate-200 bg-white">
            {PageSetupTabs.map((tab) => (
              <button
                key={tab.id}
                className={`h-9 px-3 text-sm font-semibold transition ${
                  activeTab === tab.id ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "margins" ? (
            <MarginsSetup
              marginSetup={marginSetup}
              onMarginSetupChange={onMarginSetupChange}
              pageSetup={pageSetup}
            />
          ) : activeTab === "paper" ? (
            <PaperSetup
              marginSetup={marginSetup}
              onPageSetupChange={onPageSetupChange}
              pageSetup={pageSetup}
            />
          ) : (
            <LayoutSetup
              marginSetup={marginSetup}
              onPageSetupChange={onPageSetupChange}
              pageSetup={pageSetup}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4">
          <button
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
            type="button"
          >
            Set As Default
          </button>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center justify-center rounded-md bg-orange-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              onClick={onClose}
              type="button"
            >
              OK
            </button>
            <button
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarginsSetup({
  marginSetup,
  onMarginSetupChange,
  pageSetup,
}: {
  marginSetup: CustomizeReportMarginSetup;
  onMarginSetupChange: (
    updater: (setup: CustomizeReportMarginSetup) => CustomizeReportMarginSetup,
  ) => void;
  pageSetup: CustomizeReportPageSetup;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
      <div>
        <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            checked={marginSetup.visible}
            className="h-4 w-4 accent-orange-500"
            onChange={(event) =>
              onMarginSetupChange((currentSetup) => ({
                ...currentSetup,
                visible: event.target.checked,
              }))
            }
            type="checkbox"
          />
          Show margin guide
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <label key={side} className="space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">{side}</span>
              <input
                className={InspectorNumberInputClassName}
                min={0}
                onChange={(event) =>
                  onMarginSetupChange((currentSetup) => ({
                    ...currentSetup,
                    [side]: inchesToPixels(clamp(Number(event.target.value), 0, 2.5)),
                  }))
                }
                step={0.1}
                type="number"
                value={pixelsToInches(marginSetup[side])}
              />
            </label>
          ))}
        </div>
      </div>
      <PageSetupPreview marginSetup={marginSetup} pageSetup={pageSetup} />
    </div>
  );
}

function PaperSetup({
  marginSetup,
  onPageSetupChange,
  pageSetup,
}: {
  marginSetup: CustomizeReportMarginSetup;
  onPageSetupChange: (
    updater: (setup: CustomizeReportPageSetup) => CustomizeReportPageSetup,
  ) => void;
  pageSetup: CustomizeReportPageSetup;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
      <div className="space-y-4">
        <div className="rounded-md border border-slate-200 p-3">
          <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Paper Size</p>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Paper size</span>
            <select
              className={InspectorNumberInputClassName}
              onChange={(event) => {
                const format = event.target.value as CustomizeReportPaperFormat;
                onPageSetupChange((currentSetup) => ({
                  ...getPageSetup(format, currentSetup.orientation),
                  applyTo: currentSetup.applyTo,
                  firstPageSource: currentSetup.firstPageSource,
                  otherPagesSource: currentSetup.otherPagesSource,
                }));
              }}
              value={pageSetup.format}
            >
              {CustomizeReportPaperSizeOptions.map((option) => (
                <option key={option.format} value={option.format}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">Width</span>
              <input
                className={InspectorNumberInputClassName}
                min={3}
                onChange={(event) =>
                  onPageSetupChange((currentSetup) => ({
                    ...currentSetup,
                    format: "Custom",
                    width: inchesToPixels(clamp(Number(event.target.value), 3, 22)),
                  }))
                }
                step={0.1}
                type="number"
                value={pixelsToInches(pageSetup.width)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">Height</span>
              <input
                className={InspectorNumberInputClassName}
                min={3}
                onChange={(event) =>
                  onPageSetupChange((currentSetup) => ({
                    ...currentSetup,
                    format: "Custom",
                    height: inchesToPixels(clamp(Number(event.target.value), 3, 22)),
                  }))
                }
                step={0.1}
                type="number"
                value={pixelsToInches(pageSetup.height)}
              />
            </label>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 p-3">
          <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Paper Source</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <PaperSourceSelect
              label="First page"
              onChange={(value) =>
                onPageSetupChange((currentSetup) => ({
                  ...currentSetup,
                  firstPageSource: value,
                }))
              }
              value={pageSetup.firstPageSource || "Default tray"}
            />
            <PaperSourceSelect
              label="Other pages"
              onChange={(value) =>
                onPageSetupChange((currentSetup) => ({
                  ...currentSetup,
                  otherPagesSource: value,
                }))
              }
              value={pageSetup.otherPagesSource || "Default tray"}
            />
          </div>
        </div>
      </div>
      <PageSetupPreview marginSetup={marginSetup} pageSetup={pageSetup} />
    </div>
  );
}

function LayoutSetup({
  marginSetup,
  onPageSetupChange,
  pageSetup,
}: {
  marginSetup: CustomizeReportMarginSetup;
  onPageSetupChange: (
    updater: (setup: CustomizeReportPageSetup) => CustomizeReportPageSetup,
  ) => void;
  pageSetup: CustomizeReportPageSetup;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Orientation</span>
          <select
            className={InspectorNumberInputClassName}
            onChange={(event) => {
              const orientation = event.target.value as CustomizeReportPageSetup["orientation"];
              onPageSetupChange((currentSetup) => ({
                ...getPageSetup(currentSetup.format, orientation),
                applyTo: currentSetup.applyTo,
                firstPageSource: currentSetup.firstPageSource,
                otherPagesSource: currentSetup.otherPagesSource,
              }));
            }}
            value={pageSetup.orientation}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Apply to</span>
          <select
            className={InspectorNumberInputClassName}
            onChange={(event) =>
              onPageSetupChange((currentSetup) => ({
                ...currentSetup,
                applyTo: event.target.value as CustomizeReportPageSetup["applyTo"],
              }))
            }
            value={pageSetup.applyTo || "whole-document"}
          >
            <option value="whole-document">Whole document</option>
            <option value="this-section">This section</option>
          </select>
        </label>
      </div>
      <PageSetupPreview marginSetup={marginSetup} pageSetup={pageSetup} />
    </div>
  );
}

function PaperSourceSelect({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        className={`${InspectorNumberInputClassName} h-28`}
        onChange={(event) => onChange(event.target.value)}
        size={4}
        value={value}
      >
        {CustomizeReportPaperSourceOptions.map((source) => (
          <option key={source} value={source}>
            {source}
          </option>
        ))}
      </select>
    </label>
  );
}

function PageSetupPreview({
  marginSetup,
  pageSetup,
}: {
  marginSetup: CustomizeReportMarginSetup;
  pageSetup: CustomizeReportPageSetup;
}) {
  const maxPreviewHeight = 132;
  const maxPreviewWidth = 96;
  const scale = Math.min(maxPreviewWidth / pageSetup.width, maxPreviewHeight / pageSetup.height);
  const previewWidth = Math.max(48, pageSetup.width * scale);
  const previewHeight = Math.max(64, pageSetup.height * scale);

  return (
    <div className="rounded-md border border-slate-200 p-3">
      <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Preview</p>
      <div className="flex min-h-40 items-center justify-center rounded-md bg-slate-50">
        <div
          className="relative bg-white shadow-sm ring-1 ring-slate-300"
          style={{
            width: previewWidth,
            height: previewHeight,
          }}
        >
          {marginSetup.visible ? (
            <div
              className="absolute border border-dashed border-orange-400"
              style={{
                inset: `${marginSetup.top * scale}px ${marginSetup.right * scale}px ${marginSetup.bottom * scale}px ${marginSetup.left * scale}px`,
              }}
            />
          ) : null}
          {Array.from({ length: 8 }, (_, index) => (
            <span
              key={index}
              className="absolute left-[18%] h-px bg-slate-800"
              style={{
                top: `${18 + index * 9}%`,
                width: index % 3 === 0 ? "58%" : "42%",
              }}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-slate-500">
        {pixelsToInches(pageSetup.width)}&quot; x {pixelsToInches(pageSetup.height)}&quot;
      </p>
    </div>
  );
}

function pixelsToInches(value: number) {
  return Number((value / PixelsPerInch).toFixed(2));
}

function inchesToPixels(value: number) {
  return Math.round(value * PixelsPerInch);
}

const PageSetupTabs: Array<{ id: PageSetupTab; label: string }> = [
  { id: "margins", label: "Margins" },
  { id: "paper", label: "Paper" },
  { id: "layout", label: "Layout" },
];
