"use client";

import { ArrowDown, ArrowUp, GripVertical, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import type { WorkspaceDashboardGraphType } from "@/app/src/data/modules/dashboard/WorkspaceOverviewData";

export type WorkspaceDashboardSectionKey =
  | "companies"
  | "summary"
  | "monthlyGraph"
  | "yearlyIncomeGraph"
  | "totalIncomeGraph"
  | "grossIncomeGraph"
  | "performance"
  | "approvals"
  | "activity"
  | "notifications";

export type WorkspaceDashboardSectionOption = {
  key: WorkspaceDashboardSectionKey;
  label: string;
  description: string;
};

type WorkspaceDashboardCustomizerProps = {
  isOpen: boolean;
  options: WorkspaceDashboardSectionOption[];
  visibleSections: WorkspaceDashboardSectionKey[];
  grossIncomeChartType: WorkspaceDashboardGraphType;
  monthlyChartType: WorkspaceDashboardGraphType;
  totalIncomeChartType: WorkspaceDashboardGraphType;
  yearlyChartType: WorkspaceDashboardGraphType;
  onGrossIncomeChartTypeChange: (
    chartType: WorkspaceDashboardGraphType,
  ) => void;
  onMonthlyChartTypeChange: (chartType: WorkspaceDashboardGraphType) => void;
  onTotalIncomeChartTypeChange: (
    chartType: WorkspaceDashboardGraphType,
  ) => void;
  onYearlyChartTypeChange: (chartType: WorkspaceDashboardGraphType) => void;
  onClose: () => void;
  onMoveSection: (
    sectionKey: WorkspaceDashboardSectionKey,
    direction: "up" | "down",
  ) => void;
  onReorderSection: (
    sourceKey: WorkspaceDashboardSectionKey,
    targetKey: WorkspaceDashboardSectionKey,
  ) => void;
  onReset: () => void;
  onToggleSection: (sectionKey: WorkspaceDashboardSectionKey) => void;
};

export function WorkspaceDashboardCustomizer({
  isOpen,
  options,
  visibleSections,
  grossIncomeChartType,
  monthlyChartType,
  totalIncomeChartType,
  yearlyChartType,
  onGrossIncomeChartTypeChange,
  onMonthlyChartTypeChange,
  onTotalIncomeChartTypeChange,
  onYearlyChartTypeChange,
  onClose,
  onMoveSection,
  onReorderSection,
  onReset,
  onToggleSection,
}: WorkspaceDashboardCustomizerProps) {
  const [draggedSectionKey, setDraggedSectionKey] =
    useState<WorkspaceDashboardSectionKey | null>(null);
  const orderedOptions = [
    ...visibleSections
      .map((sectionKey) =>
        options.find((option) => option.key === sectionKey),
      )
      .filter((option): option is WorkspaceDashboardSectionOption =>
        Boolean(option),
      ),
    ...options.filter((option) => !visibleSections.includes(option.key)),
  ];

  return (
    <>
      <button
        type="button"
        aria-label="Close dashboard customizer"
        onClick={onClose}
        className={`fixed inset-0 z-60 bg-darknavy/35 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Dashboard customizer"
        className={`fixed bottom-0 right-0 top-0 z-70 flex w-full max-w-110 flex-col border-l border-darknavy/10 bg-white shadow-[0_30px_90px_rgba(33,39,56,0.22)] transition-transform duration-300 ease-out sm:top-4 sm:right-4 sm:bottom-4 sm:rounded-2xl sm:border ${
          isOpen ? "translate-x-0" : "translate-x-full sm:translate-x-[calc(100%+1rem)]"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/8 px-5 py-5">
          <div>
            <h2 className="text-lg font-semibold text-darknavy">
              Customize Dashboard
            </h2>
            <p className="mt-1 text-sm leading-5 text-darknavy/55">
              Choose which workspace sections are visible.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dashboard customizer"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-darknavy/50 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <section className="mb-5 rounded-2xl border border-darknavy/8 bg-offwhite p-4">
            <label className="block text-sm font-semibold text-darknavy">
              Performance Graph
            </label>
            <p className="mt-1 text-sm leading-5 text-darknavy/52">
              Choose separate graph styles for each dashboard graph.
            </p>
            <GraphTypeSelect
              label="Monthly Accounting Trend"
              value={monthlyChartType}
              onChange={onMonthlyChartTypeChange}
            />
            <GraphTypeSelect
              label="Yearly Income Comparison"
              value={yearlyChartType}
              onChange={onYearlyChartTypeChange}
            />
            <GraphTypeSelect
              label="Total Income by Year"
              value={totalIncomeChartType}
              onChange={onTotalIncomeChartTypeChange}
            />
            <GraphTypeSelect
              label="Gross Income by Year"
              value={grossIncomeChartType}
              onChange={onGrossIncomeChartTypeChange}
            />
          </section>

          <div className="space-y-3">
            {orderedOptions.map((option) => {
              const isChecked = visibleSections.includes(option.key);
              const visibleIndex = visibleSections.indexOf(option.key);
              const canMove = isChecked && visibleSections.length > 1;
              const canMoveUp = canMove && visibleIndex > 0;
              const canMoveDown =
                canMove && visibleIndex < visibleSections.length - 1;

              return (
                <div
                  key={option.key}
                  draggable={isChecked}
                  onDragStart={() => setDraggedSectionKey(option.key)}
                  onDragEnd={() => setDraggedSectionKey(null)}
                  onDragOver={(event) => {
                    if (!isChecked || !draggedSectionKey) {
                      return;
                    }

                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();

                    if (!draggedSectionKey || draggedSectionKey === option.key) {
                      return;
                    }

                    onReorderSection(draggedSectionKey, option.key);
                    setDraggedSectionKey(null);
                  }}
                  className={`rounded-xl border px-4 py-4 transition ${
                    draggedSectionKey === option.key
                      ? "border-skyblue/45 bg-skyblue/12"
                      : "border-darknavy/8 bg-offwhite hover:border-skyblue/30 hover:bg-skyblue/8"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-darknavy/42">
                      <GripVertical className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSection(option.key)}
                        className="mt-1 h-4 w-4 rounded border-darknavy/25 text-skyblue focus:ring-skyblue/35"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-darknavy">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-sm leading-5 text-darknavy/52">
                          {option.description}
                        </span>
                      </span>
                    </label>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Move ${option.label} up`}
                        disabled={!canMoveUp}
                        onClick={() => onMoveSection(option.key, "up")}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-darknavy/55 transition hover:bg-white hover:text-darknavy disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${option.label} down`}
                        disabled={!canMoveDown}
                        onClick={() => onMoveSection(option.key, "down")}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-darknavy/55 transition hover:bg-white hover:text-darknavy disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  {isChecked ? (
                    <span className="ml-11 mt-3 inline-flex min-h-6 items-center rounded-full bg-skyblue/14 px-2.5 text-xs font-semibold text-darknavy/62">
                      Position {visibleIndex + 1}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-darknavy/8 px-5 py-4">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-darknavy px-4 text-sm font-semibold text-offwhite transition hover:bg-darknavy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            Done
          </button>
        </div>
      </aside>
    </>
  );
}

function GraphTypeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: WorkspaceDashboardGraphType;
  onChange: (chartType: WorkspaceDashboardGraphType) => void;
}) {
  return (
    <>
      <label className="mt-4 block text-xs font-semibold text-darknavy/55 first:mt-3">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value as WorkspaceDashboardGraphType)
        }
        className="mt-2 h-11 w-full rounded-xl border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15"
      >
        <option value="bar">Bar Graph</option>
        <option value="line">Line Graph</option>
        <option value="area">Area Graph</option>
        <option value="donut">Donut Graph</option>
        <option value="pie">Pie Graph</option>
      </select>
    </>
  );
}
