"use client";

import { GripVertical, LayoutGrid } from "lucide-react";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  WorkspaceApprovalQueue,
  WorkspaceCompanies,
  WorkspaceDashboardGraphData,
  WorkspaceDashboardYearGraphData,
  WorkspaceDashboardYearMetrics,
  type WorkspaceDashboardGraphType,
  WorkspaceRecentActivity,
  WorkspaceSummaryCards,
  WorkspaceSystemNotifications,
} from "@/app/src/data/modules/dashboard/WorkspaceOverviewData";
import {
  WorkspaceDashboardCustomizer,
  type WorkspaceDashboardSectionKey,
  type WorkspaceDashboardSectionOption,
} from "@/app/src/ui/modules/workspace/dashboard/WorkspaceDashboardCustomizer";
import { WorkspaceSpotlightTutorialOpenEvent } from "@/app/src/data/modules/dashboard/WorkspaceSpotlightTutorialData";
import { WorkspaceOverviewCompaniesPanel } from "@/app/src/ui/modules/workspace/dashboard/WorkspaceOverviewCompaniesPanel";
import { WorkspaceOverviewHero } from "@/app/src/ui/modules/workspace/dashboard/WorkspaceOverviewHero";
import {
  WorkspaceDashboardGrossIncomeGraph,
  WorkspaceDashboardMonthlyAccountingGraph,
  WorkspaceDashboardTotalIncomeGraph,
  WorkspaceDashboardYearlyIncomeGraph,
  WorkspaceOverviewPanels,
} from "@/app/src/ui/modules/workspace/dashboard/WorkspaceOverviewPanels";
import { WorkspaceSpotlightTutorial } from "@/app/src/ui/modules/workspace/dashboard/WorkspaceSpotlightTutorial";
import { WorkspaceOverviewStatsGrid } from "@/app/src/ui/modules/workspace/dashboard/WorkspaceOverviewStatsGrid";

const WorkspaceDashboardStorageKey =
  "gr8booksneo.workspaceDashboard.visibleSections";
const ReactGridLayoutStorageKey =
  "gr8booksneo.workspaceDashboard.reactGridLayout";

const WorkspaceDashboardSectionOptions: WorkspaceDashboardSectionOption[] = [
  {
    key: "companies",
    label: "Companies panel",
    description: "Company search and quick company status list.",
  },
  {
    key: "summary",
    label: "Summary metrics",
    description: "Total companies, revenue, approvals, and active users.",
  },
  {
    key: "monthlyGraph",
    label: "Monthly accounting trend",
    description: "Monthly revenue, expenses, net profit, and users graph.",
  },
  {
    key: "yearlyIncomeGraph",
    label: "Yearly income comparison",
    description: "Yearly gross earnings, income, expenses, and users graph.",
  },
  {
    key: "totalIncomeGraph",
    label: "Total income by year",
    description: "Total income and net income comparison graph.",
  },
  {
    key: "grossIncomeGraph",
    label: "Gross income by year",
    description: "Gross earnings and operating expenses comparison graph.",
  },
  {
    key: "performance",
    label: "Performance overview",
    description: "Company revenue, expenses, net profit, and trend table.",
  },
  {
    key: "approvals",
    label: "Approval queue",
    description: "Workspace approvals that need admin action.",
  },
  {
    key: "activity",
    label: "Recent activity",
    description: "Cross-company updates and workspace activity feed.",
  },
  {
    key: "notifications",
    label: "System notifications",
    description: "Maintenance and important workspace notices.",
  },
];

const DefaultVisibleSections: WorkspaceDashboardSectionKey[] = [
  "companies",
  "summary",
  "monthlyGraph",
  "yearlyIncomeGraph",
  "totalIncomeGraph",
  "grossIncomeGraph",
  "performance",
  "approvals",
  "activity",
  "notifications",
];

const DefaultSectionWidths: Record<WorkspaceDashboardSectionKey, number> = {
  approvals: 6,
  activity: 6,
  companies: 4,
  grossIncomeGraph: 6,
  monthlyGraph: 6,
  notifications: 6,
  performance: 12,
  summary: 8,
  totalIncomeGraph: 6,
  yearlyIncomeGraph: 6,
};

const MinimumSectionWidths: Record<WorkspaceDashboardSectionKey, number> = {
  approvals: 4,
  activity: 4,
  companies: 3,
  grossIncomeGraph: 4,
  monthlyGraph: 4,
  notifications: 4,
  performance: 6,
  summary: 4,
  totalIncomeGraph: 4,
  yearlyIncomeGraph: 4,
};

type AutoArrangePreset = {
  label: string;
  order: WorkspaceDashboardSectionKey[];
  widths: Record<WorkspaceDashboardSectionKey, number>;
};

const AutoArrangePresets: AutoArrangePreset[] = [
  {
    label: "Compact",
    order: [
      "summary",
      "monthlyGraph",
      "yearlyIncomeGraph",
      "totalIncomeGraph",
      "grossIncomeGraph",
      "companies",
      "notifications",
      "activity",
      "approvals",
      "performance",
    ],
    widths: {
      approvals: 4,
      activity: 4,
      companies: 4,
      grossIncomeGraph: 4,
      monthlyGraph: 4,
      notifications: 4,
      performance: 8,
      summary: 8,
      totalIncomeGraph: 4,
      yearlyIncomeGraph: 4,
    },
  },
  {
    label: "Balanced",
    order: [
      "companies",
      "summary",
      "monthlyGraph",
      "yearlyIncomeGraph",
      "totalIncomeGraph",
      "grossIncomeGraph",
      "performance",
      "approvals",
      "activity",
      "notifications",
    ],
    widths: DefaultSectionWidths,
  },
  {
    label: "Wide Focus",
    order: [
      "summary",
      "monthlyGraph",
      "yearlyIncomeGraph",
      "totalIncomeGraph",
      "grossIncomeGraph",
      "performance",
      "companies",
      "approvals",
      "activity",
      "notifications",
    ],
    widths: {
      approvals: 6,
      activity: 6,
      companies: 6,
      grossIncomeGraph: 6,
      monthlyGraph: 6,
      notifications: 6,
      performance: 12,
      summary: 12,
      totalIncomeGraph: 6,
      yearlyIncomeGraph: 6,
    },
  },
  {
    label: "Operations",
    order: [
      "approvals",
      "companies",
      "activity",
      "notifications",
      "summary",
      "monthlyGraph",
      "yearlyIncomeGraph",
      "totalIncomeGraph",
      "grossIncomeGraph",
      "performance",
    ],
    widths: {
      approvals: 6,
      activity: 6,
      companies: 6,
      grossIncomeGraph: 6,
      monthlyGraph: 6,
      notifications: 6,
      performance: 12,
      summary: 12,
      totalIncomeGraph: 6,
      yearlyIncomeGraph: 6,
    },
  },
  {
    label: "Feed First",
    order: [
      "activity",
      "notifications",
      "companies",
      "summary",
      "approvals",
      "monthlyGraph",
      "yearlyIncomeGraph",
      "totalIncomeGraph",
      "grossIncomeGraph",
      "performance",
    ],
    widths: {
      approvals: 6,
      activity: 6,
      companies: 4,
      grossIncomeGraph: 6,
      monthlyGraph: 6,
      notifications: 6,
      performance: 12,
      summary: 8,
      totalIncomeGraph: 6,
      yearlyIncomeGraph: 6,
    },
  },
];

const DragAutoScrollMaxSpeed = 22;
const DragAutoScrollZone = 120;
const MasonryGridGap = 24;
const MasonryRowHeight = 8;

type DragPreview = {
  key: WorkspaceDashboardSectionKey;
  offsetX: number;
  offsetY: number;
  width: number;
  x: number;
  y: number;
};

export function WorkspaceOverviewPage() {
  const dragAutoScrollFrameRef = useRef<number | null>(null);
  const dragAutoScrollSpeedRef = useRef(0);
  const layoutGridRef = useRef<HTMLElement | null>(null);
  const sectionContentRefs = useRef(
    new Map<WorkspaceDashboardSectionKey, HTMLDivElement>(),
  );
  const sectionElementRefs = useRef(
    new Map<WorkspaceDashboardSectionKey, HTMLDivElement>(),
  );
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [draggedSectionKey, setDraggedSectionKey] =
    useState<WorkspaceDashboardSectionKey | null>(null);
  const [dragOverSectionKey, setDragOverSectionKey] =
    useState<WorkspaceDashboardSectionKey | null>(null);
  const [autoArrangePresetIndex, setAutoArrangePresetIndex] = useState(0);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [monthlyChartType, setMonthlyChartType] =
    useState<WorkspaceDashboardGraphType>("bar");
  const [yearlyChartType, setYearlyChartType] =
    useState<WorkspaceDashboardGraphType>("bar");
  const [totalIncomeChartType, setTotalIncomeChartType] =
    useState<WorkspaceDashboardGraphType>("bar");
  const [grossIncomeChartType, setGrossIncomeChartType] =
    useState<WorkspaceDashboardGraphType>("bar");
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [sectionRowSpans, setSectionRowSpans] = useState<
    Partial<Record<WorkspaceDashboardSectionKey, number>>
  >({});
  const [sectionWidths, setSectionWidths] =
    useState<Record<WorkspaceDashboardSectionKey, number>>(DefaultSectionWidths);
  const [visibleSections, setVisibleSections] = useState<
    WorkspaceDashboardSectionKey[]
  >(DefaultVisibleSections);
  const activeCompanies = WorkspaceCompanies.filter(
    (company) => company.status === "Active",
  ).length;

  const openSpotlightTutorial = useCallback(() => {
    window.dispatchEvent(new Event(WorkspaceSpotlightTutorialOpenEvent));
  }, []);

  useEffect(() => {
    window.localStorage.removeItem(ReactGridLayoutStorageKey);

    const storedValue = window.localStorage.getItem(WorkspaceDashboardStorageKey);

    if (!storedValue) {
      queueMicrotask(() => setHasLoadedPreferences(true));
      return;
    }

    try {
      const parsedValue = JSON.parse(storedValue);

      if (Array.isArray(parsedValue)) {
        queueMicrotask(() =>
          setVisibleSections(ParseVisibleSections(parsedValue, true)),
        );
      } else {
        const parsedPreferences = ParseDashboardPreferences(parsedValue);

        if (parsedPreferences) {
          queueMicrotask(() => {
            setVisibleSections(parsedPreferences.sections);
            setSectionWidths(parsedPreferences.widths);
            setMonthlyChartType(parsedPreferences.monthlyChartType);
            setYearlyChartType(parsedPreferences.yearlyChartType);
            setTotalIncomeChartType(parsedPreferences.totalIncomeChartType);
            setGrossIncomeChartType(parsedPreferences.grossIncomeChartType);
          });
        }
      }
    } catch {
      window.localStorage.removeItem(WorkspaceDashboardStorageKey);
    } finally {
      queueMicrotask(() => setHasLoadedPreferences(true));
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedPreferences) {
      return;
    }

    window.localStorage.setItem(
      WorkspaceDashboardStorageKey,
      JSON.stringify({
        sections: visibleSections,
        widths: sectionWidths,
        grossIncomeChartType,
        monthlyChartType,
        version: 2,
        totalIncomeChartType,
        yearlyChartType,
      }),
    );
  }, [
    grossIncomeChartType,
    hasLoadedPreferences,
    monthlyChartType,
    sectionWidths,
    totalIncomeChartType,
    visibleSections,
    yearlyChartType,
  ]);

  useEffect(() => {
    return () => {
      dragAutoScrollSpeedRef.current = 0;

      if (dragAutoScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(dragAutoScrollFrameRef.current);
        dragAutoScrollFrameRef.current = null;
      }
    };
  }, []);

  const measureSectionRowSpans = useCallback(() => {
    const nextRowSpans: Partial<Record<WorkspaceDashboardSectionKey, number>> =
      {};

    visibleSections.forEach((sectionKey) => {
      const contentElement = sectionContentRefs.current.get(sectionKey);

      if (!contentElement) {
        return;
      }

      nextRowSpans[sectionKey] = Math.max(
        1,
        Math.ceil(
          (contentElement.getBoundingClientRect().height + MasonryGridGap) /
            (MasonryRowHeight + MasonryGridGap),
        ),
      );
    });

    setSectionRowSpans((currentRowSpans) => {
      const hasChanged = visibleSections.some(
        (sectionKey) =>
          currentRowSpans[sectionKey] !== nextRowSpans[sectionKey],
      );

      return hasChanged ? nextRowSpans : currentRowSpans;
    });
  }, [visibleSections]);

  useLayoutEffect(() => {
    measureSectionRowSpans();

    const resizeObserver = new ResizeObserver(() => {
      measureSectionRowSpans();
    });

    visibleSections.forEach((sectionKey) => {
      const contentElement = sectionContentRefs.current.get(sectionKey);

      if (contentElement) {
        resizeObserver.observe(contentElement);
      }
    });

    return () => resizeObserver.disconnect();
  }, [isEditingLayout, measureSectionRowSpans, sectionWidths, visibleSections]);

  function toggleSection(sectionKey: WorkspaceDashboardSectionKey) {
    setVisibleSections((currentSections) =>
      currentSections.includes(sectionKey)
        ? currentSections.filter((currentSection) => currentSection !== sectionKey)
        : [...currentSections, sectionKey],
    );
    setSectionWidths((currentWidths) => ({
      ...currentWidths,
      [sectionKey]: currentWidths[sectionKey] ?? DefaultSectionWidths[sectionKey],
    }));
  }

  function moveSection(
    sectionKey: WorkspaceDashboardSectionKey,
    direction: "up" | "down",
  ) {
    setVisibleSections((currentSections) => {
      const currentIndex = currentSections.indexOf(sectionKey);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (
        currentIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= currentSections.length
      ) {
        return currentSections;
      }

      const nextSections = [...currentSections];
      const [movedSection] = nextSections.splice(currentIndex, 1);
      nextSections.splice(targetIndex, 0, movedSection);

      return nextSections;
    });
  }

  function reorderSection(
    sourceKey: WorkspaceDashboardSectionKey,
    targetKey: WorkspaceDashboardSectionKey,
  ) {
    setVisibleSections((currentSections) => {
      const sourceIndex = currentSections.indexOf(sourceKey);
      const targetIndex = currentSections.indexOf(targetKey);

      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return currentSections;
      }

      const nextSections = [...currentSections];
      const [movedSection] = nextSections.splice(sourceIndex, 1);
      nextSections.splice(targetIndex, 0, movedSection);

      return nextSections;
    });
  }

  function resetSections() {
    setVisibleSections(DefaultVisibleSections);
    setSectionWidths(DefaultSectionWidths);
    setMonthlyChartType("bar");
    setYearlyChartType("bar");
    setTotalIncomeChartType("bar");
    setGrossIncomeChartType("bar");
  }

  function toggleLayoutEditing() {
    setIsEditingLayout((currentValue) => !currentValue);
    setIsCustomizerOpen(false);
  }

  function autoArrangeSections() {
    const preset = AutoArrangePresets[autoArrangePresetIndex];
    const orderLookup = new Map(
      preset.order.map((sectionKey, index) => [sectionKey, index]),
    );

    setVisibleSections((currentSections) =>
      [...currentSections].sort(
        (leftSection, rightSection) =>
          (orderLookup.get(leftSection) ?? Number.MAX_SAFE_INTEGER) -
          (orderLookup.get(rightSection) ?? Number.MAX_SAFE_INTEGER),
      ),
    );
    setSectionWidths((currentWidths) => ({
      ...currentWidths,
      ...preset.widths,
    }));
    setAutoArrangePresetIndex(
      (currentIndex) => (currentIndex + 1) % AutoArrangePresets.length,
    );
  }

  function startCardPointerDrag(
    sectionKey: WorkspaceDashboardSectionKey,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (!isEditingLayout) {
      return;
    }

    const sectionElement = sectionElementRefs.current.get(sectionKey);

    if (!sectionElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect = sectionElement.getBoundingClientRect();

    setDraggedSectionKey(sectionKey);
    setDragOverSectionKey(sectionKey);
    setDragPreview({
      key: sectionKey,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      x: event.clientX,
      y: event.clientY,
    });

    function handlePointerMove(pointerEvent: globalThis.PointerEvent) {
      setDragPreview((currentPreview) =>
        currentPreview
          ? {
              ...currentPreview,
              x: pointerEvent.clientX,
              y: pointerEvent.clientY,
            }
          : currentPreview,
      );
      updateDragAutoScroll(pointerEvent.clientY);
      arrangeSectionByPointer(sectionKey, pointerEvent.clientX, pointerEvent.clientY);
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      setDraggedSectionKey(null);
      setDragOverSectionKey(null);
      setDragPreview(null);
      stopDragAutoScroll();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function arrangeSectionByPointer(
    sourceKey: WorkspaceDashboardSectionKey,
    clientX: number,
    clientY: number,
  ) {
    const targetSection = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>("[data-dashboard-section-key]")
      ?.dataset.dashboardSectionKey;

    if (
      !IsWorkspaceDashboardSectionKey(targetSection) ||
      targetSection === sourceKey
    ) {
      return;
    }

    setDragOverSectionKey(targetSection);
    reorderSectionsForDrag(sourceKey, targetSection);
  }

  function reorderSectionsForDrag(
    sourceKey: WorkspaceDashboardSectionKey,
    targetKey: WorkspaceDashboardSectionKey,
  ) {
    setVisibleSections((currentSections) => {
      const sourceIndex = currentSections.indexOf(sourceKey);
      const targetIndex = currentSections.indexOf(targetKey);

      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return currentSections;
      }

      const nextSections = [...currentSections];
      const [movedSection] = nextSections.splice(sourceIndex, 1);
      nextSections.splice(targetIndex, 0, movedSection);

      return nextSections;
    });
  }

  function updateDragAutoScroll(clientY: number) {
    const viewportHeight = window.innerHeight;
    let nextSpeed = 0;

    if (clientY < DragAutoScrollZone) {
      const intensity = (DragAutoScrollZone - clientY) / DragAutoScrollZone;
      nextSpeed = -Math.ceil(intensity * DragAutoScrollMaxSpeed);
    } else if (clientY > viewportHeight - DragAutoScrollZone) {
      const intensity =
        (clientY - (viewportHeight - DragAutoScrollZone)) / DragAutoScrollZone;
      nextSpeed = Math.ceil(intensity * DragAutoScrollMaxSpeed);
    }

    dragAutoScrollSpeedRef.current = nextSpeed;

    if (nextSpeed !== 0 && dragAutoScrollFrameRef.current === null) {
      dragAutoScrollFrameRef.current =
        window.requestAnimationFrame(runDragAutoScroll);
    }
  }

  function runDragAutoScroll() {
    const speed = dragAutoScrollSpeedRef.current;

    if (speed === 0) {
      dragAutoScrollFrameRef.current = null;
      return;
    }

    window.scrollBy({ top: speed });
    dragAutoScrollFrameRef.current =
      window.requestAnimationFrame(runDragAutoScroll);
  }

  function stopDragAutoScroll() {
    dragAutoScrollSpeedRef.current = 0;

    if (dragAutoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(dragAutoScrollFrameRef.current);
      dragAutoScrollFrameRef.current = null;
    }
  }

  function resizeSectionWidth(
    sectionKey: WorkspaceDashboardSectionKey,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (!isEditingLayout || !layoutGridRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = sectionWidths[sectionKey] ?? DefaultSectionWidths[sectionKey];
    const gridWidth = layoutGridRef.current.getBoundingClientRect().width;
    const columnWidth = gridWidth / 12;

    function handlePointerMove(pointerEvent: globalThis.PointerEvent) {
      const columnDelta = Math.round((pointerEvent.clientX - startX) / columnWidth);
      const nextWidth = ClampSectionWidth(sectionKey, startWidth + columnDelta);

      setSectionWidths((currentWidths) =>
        currentWidths[sectionKey] === nextWidth
          ? currentWidths
          : {
              ...currentWidths,
              [sectionKey]: nextWidth,
            },
      );
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <>
      <WorkspaceSpotlightTutorial />
      <div className="mx-auto flex w-full max-w-376 flex-col gap-6">
        <WorkspaceOverviewHero
          isEditingLayout={isEditingLayout}
          onCustomize={() => setIsCustomizerOpen(true)}
          onStartSpotlightTutorial={openSpotlightTutorial}
          onToggleLayoutEditing={toggleLayoutEditing}
        />

        {isEditingLayout ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={autoArrangeSections}
              className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-skyblue/35 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:bg-skyblue/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Auto Arrange
              <span className="rounded-full bg-skyblue/12 px-2 py-1 text-xs text-darknavy/58">
                {AutoArrangePresets[autoArrangePresetIndex].label}
              </span>
            </button>
          </div>
        ) : null}

        {visibleSections.length > 0 ? (
          <section
            ref={layoutGridRef}
            className={`workspace-dashboard-layout grid grid-cols-1 items-start gap-6 xl:grid-cols-12 ${
              isEditingLayout
                ? "rounded-[1.75rem] border border-dashed border-skyblue/35 bg-skyblue/5 p-3"
                : ""
            }`}
          >
            {visibleSections.map((sectionKey) => (
              <div
                key={sectionKey}
                ref={(element) => {
                  if (element) {
                    sectionElementRefs.current.set(sectionKey, element);
                  } else {
                    sectionElementRefs.current.delete(sectionKey);
                  }
                }}
                data-dashboard-section-key={sectionKey}
                className={`workspace-dashboard-section group relative min-w-0 transition duration-200 ease-out ${
                  isEditingLayout
                    ? "rounded-[1.75rem] outline outline-1 outline-skyblue/25"
                    : ""
                } ${
                  draggedSectionKey === sectionKey
                    ? "scale-[0.985] opacity-45"
                    : "opacity-100"
                } ${
                  dragOverSectionKey === sectionKey
                    ? "outline-2 outline-skyblue shadow-[0_18px_45px_rgba(87,196,229,0.18)]"
                    : ""
                }`}
                style={
                  {
                    "--dashboard-section-span":
                      sectionWidths[sectionKey] ?? DefaultSectionWidths[sectionKey],
                    "--dashboard-section-row-span":
                      sectionRowSpans[sectionKey] ?? 1,
                  } as CSSProperties
                }
              >
                <div
                  ref={(element) => {
                    if (element) {
                      sectionContentRefs.current.set(sectionKey, element);
                    } else {
                      sectionContentRefs.current.delete(sectionKey);
                    }
                  }}
                >
                  {isEditingLayout ? (
                    <div className="mb-2 flex items-center justify-between gap-3 rounded-2xl border border-darknavy/8 bg-white px-3 py-2 shadow-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Move ${GetSectionLabel(sectionKey)}`}
                          onPointerDown={(event) =>
                            startCardPointerDrag(sectionKey, event)
                          }
                          className="flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl border border-darknavy/10 text-darknavy/45 transition hover:border-skyblue/35 hover:text-darknavy active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <p className="truncate text-sm font-semibold text-darknavy">
                          {GetSectionLabel(sectionKey)}
                        </p>
                      </div>
                      <p className="rounded-xl bg-offwhite px-3 py-1.5 text-xs font-semibold text-darknavy/50">
                        {sectionWidths[sectionKey] ??
                          DefaultSectionWidths[sectionKey]}
                        /12
                      </p>
                    </div>
                  ) : null}

                  <WorkspaceDashboardSection
                    activeCompanies={activeCompanies}
                    grossIncomeChartType={grossIncomeChartType}
                    monthlyChartType={monthlyChartType}
                    sectionKey={sectionKey}
                    totalIncomeChartType={totalIncomeChartType}
                    yearlyChartType={yearlyChartType}
                  />
                </div>

                {isEditingLayout ? (
                  <button
                    type="button"
                    aria-label={`Resize ${GetSectionLabel(sectionKey)} width`}
                    onPointerDown={(event) =>
                      resizeSectionWidth(sectionKey, event)
                    }
                    className="absolute -right-2 top-1/2 hidden h-14 w-4 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-white bg-skyblue shadow-[0_12px_24px_rgba(33,39,56,0.18)] transition hover:scale-110 xl:block"
                  />
                ) : null}
              </div>
            ))}
          </section>
        ) : (
          <section className="rounded-[1.75rem] border border-dashed border-darknavy/18 bg-white px-6 py-10 text-center">
            <p className="text-sm font-semibold text-darknavy">
              No dashboard sections selected.
            </p>
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-darknavy px-4 text-sm font-semibold text-offwhite transition hover:bg-darknavy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              Customize Dashboard
            </button>
          </section>
        )}
      </div>

      <WorkspaceDashboardCustomizer
        grossIncomeChartType={grossIncomeChartType}
        isOpen={isCustomizerOpen}
        monthlyChartType={monthlyChartType}
        options={WorkspaceDashboardSectionOptions}
        totalIncomeChartType={totalIncomeChartType}
        visibleSections={visibleSections}
        onClose={() => setIsCustomizerOpen(false)}
        onGrossIncomeChartTypeChange={setGrossIncomeChartType}
        onMonthlyChartTypeChange={setMonthlyChartType}
        onMoveSection={moveSection}
        onReorderSection={reorderSection}
        onReset={resetSections}
        onTotalIncomeChartTypeChange={setTotalIncomeChartType}
        onToggleSection={toggleSection}
        onYearlyChartTypeChange={setYearlyChartType}
        yearlyChartType={yearlyChartType}
      />

      {dragPreview ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-80 origin-top-left scale-[0.99] opacity-90 shadow-[0_28px_80px_rgba(33,39,56,0.22)]"
          style={{
            left: dragPreview.x - dragPreview.offsetX,
            top: dragPreview.y - dragPreview.offsetY,
            width: dragPreview.width,
          }}
        >
          <div className="rounded-[1.75rem] border border-skyblue/45 bg-white/96 p-2">
            <div className="mb-2 flex items-center gap-2 rounded-2xl border border-darknavy/8 bg-white px-3 py-2 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-skyblue/35 text-darknavy">
                <GripVertical className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="truncate text-sm font-semibold text-darknavy">
                {GetSectionLabel(dragPreview.key)}
              </p>
            </div>
            <div className="max-h-96 overflow-hidden">
              <WorkspaceDashboardSection
                activeCompanies={activeCompanies}
                grossIncomeChartType={grossIncomeChartType}
                monthlyChartType={monthlyChartType}
                sectionKey={dragPreview.key}
                totalIncomeChartType={totalIncomeChartType}
                yearlyChartType={yearlyChartType}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

type WorkspaceDashboardSectionProps = {
  activeCompanies: number;
  grossIncomeChartType: WorkspaceDashboardGraphType;
  monthlyChartType: WorkspaceDashboardGraphType;
  sectionKey: WorkspaceDashboardSectionKey;
  totalIncomeChartType: WorkspaceDashboardGraphType;
  yearlyChartType: WorkspaceDashboardGraphType;
};

function WorkspaceDashboardSection({
  activeCompanies,
  grossIncomeChartType,
  monthlyChartType,
  sectionKey,
  totalIncomeChartType,
  yearlyChartType,
}: WorkspaceDashboardSectionProps) {
  switch (sectionKey) {
    case "companies":
      return <WorkspaceOverviewCompaniesPanel companies={WorkspaceCompanies} />;
    case "summary":
      return (
        <WorkspaceOverviewStatsGrid
          activeCompanies={activeCompanies}
          cards={WorkspaceSummaryCards}
          totalCompanies={WorkspaceCompanies.length}
        />
      );
    case "monthlyGraph":
      return (
        <WorkspaceDashboardMonthlyAccountingGraph
          data={WorkspaceDashboardGraphData}
          graphType={monthlyChartType}
        />
      );
    case "yearlyIncomeGraph":
      return (
        <WorkspaceDashboardYearlyIncomeGraph
          data={WorkspaceDashboardYearGraphData}
          graphType={yearlyChartType}
        />
      );
    case "totalIncomeGraph":
      return (
        <WorkspaceDashboardTotalIncomeGraph
          data={WorkspaceDashboardYearMetrics}
          graphType={totalIncomeChartType}
        />
      );
    case "grossIncomeGraph":
      return (
        <WorkspaceDashboardGrossIncomeGraph
          data={WorkspaceDashboardYearMetrics}
          graphType={grossIncomeChartType}
        />
      );
    case "performance":
      return (
        <WorkspaceOverviewPanels
          approvals={[]}
          companies={WorkspaceCompanies}
          recentActivity={[]}
          showApprovals={false}
          showPerformance
          showRecentActivity={false}
          showSystemNotifications={false}
          systemNotifications={[]}
        />
      );
    case "approvals":
      return (
        <WorkspaceOverviewPanels
          approvals={WorkspaceApprovalQueue}
          companies={[]}
          recentActivity={[]}
          showApprovals
          showPerformance={false}
          showRecentActivity={false}
          showSystemNotifications={false}
          systemNotifications={[]}
        />
      );
    case "activity":
      return (
        <WorkspaceOverviewPanels
          approvals={[]}
          companies={[]}
          recentActivity={WorkspaceRecentActivity}
          showApprovals={false}
          showPerformance={false}
          showRecentActivity
          showSystemNotifications={false}
          systemNotifications={[]}
        />
      );
    case "notifications":
      return (
        <WorkspaceOverviewPanels
          approvals={[]}
          companies={[]}
          recentActivity={[]}
          showApprovals={false}
          showPerformance={false}
          showRecentActivity={false}
          showSystemNotifications
          systemNotifications={WorkspaceSystemNotifications}
        />
      );
  }
}

function GetSectionLabel(sectionKey: WorkspaceDashboardSectionKey) {
  return (
    WorkspaceDashboardSectionOptions.find((option) => option.key === sectionKey)
      ?.label ?? "Dashboard section"
  );
}

function ClampSectionWidth(
  sectionKey: WorkspaceDashboardSectionKey,
  width: number,
) {
  return Math.min(Math.max(width, MinimumSectionWidths[sectionKey]), 12);
}

function ParseVisibleSections(value: unknown[], shouldMigrateGraphs = false) {
  const parsedSections = value.filter(
    (sectionKey): sectionKey is WorkspaceDashboardSectionKey =>
      IsWorkspaceDashboardSectionKey(sectionKey),
  );

  if (parsedSections.length === 0) {
    return DefaultVisibleSections;
  }

  if (!shouldMigrateGraphs) {
    return parsedSections;
  }

  const graphSections: WorkspaceDashboardSectionKey[] = [
    "monthlyGraph",
    "yearlyIncomeGraph",
    "totalIncomeGraph",
    "grossIncomeGraph",
  ];
  const hasGraphSection = parsedSections.some((sectionKey) =>
    graphSections.includes(sectionKey),
  );

  if (hasGraphSection || !parsedSections.includes("performance")) {
    return parsedSections;
  }

  return parsedSections.flatMap((sectionKey) =>
    sectionKey === "performance" ? [...graphSections, sectionKey] : sectionKey,
  );
}

function ParseDashboardPreferences(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as {
    chartType?: unknown;
    grossIncomeChartType?: unknown;
    monthlyChartType?: unknown;
    sections?: unknown;
    totalIncomeChartType?: unknown;
    version?: unknown;
    widths?: Partial<Record<WorkspaceDashboardSectionKey, unknown>>;
    yearlyChartType?: unknown;
  };

  if (!Array.isArray(candidate.sections)) {
    return null;
  }

  const sections = ParseVisibleSections(candidate.sections, candidate.version !== 2);
  const widths = { ...DefaultSectionWidths };

  if (candidate.widths && typeof candidate.widths === "object") {
    WorkspaceDashboardSectionOptions.forEach((option) => {
      const width = candidate.widths?.[option.key];

      if (typeof width === "number" && Number.isFinite(width)) {
        widths[option.key] = ClampSectionWidth(option.key, Math.round(width));
      }
    });
  }

  return {
    monthlyChartType: IsWorkspaceDashboardGraphType(candidate.monthlyChartType)
      ? candidate.monthlyChartType
      : IsWorkspaceDashboardGraphType(candidate.chartType)
        ? candidate.chartType
        : "bar",
    yearlyChartType: IsWorkspaceDashboardGraphType(candidate.yearlyChartType)
      ? candidate.yearlyChartType
      : IsWorkspaceDashboardGraphType(candidate.chartType)
        ? candidate.chartType
        : "bar",
    totalIncomeChartType: IsWorkspaceDashboardGraphType(
      candidate.totalIncomeChartType,
    )
      ? candidate.totalIncomeChartType
      : IsWorkspaceDashboardGraphType(candidate.yearlyChartType)
        ? candidate.yearlyChartType
        : IsWorkspaceDashboardGraphType(candidate.chartType)
          ? candidate.chartType
          : "bar",
    grossIncomeChartType: IsWorkspaceDashboardGraphType(
      candidate.grossIncomeChartType,
    )
      ? candidate.grossIncomeChartType
      : IsWorkspaceDashboardGraphType(candidate.yearlyChartType)
        ? candidate.yearlyChartType
        : IsWorkspaceDashboardGraphType(candidate.chartType)
          ? candidate.chartType
          : "bar",
    sections,
    widths,
  };
}

function IsWorkspaceDashboardSectionKey(
  value: unknown,
): value is WorkspaceDashboardSectionKey {
  return WorkspaceDashboardSectionOptions.some((option) => option.key === value);
}

function IsWorkspaceDashboardGraphType(
  value: unknown,
): value is WorkspaceDashboardGraphType {
  return (
    value === "area" ||
    value === "bar" ||
    value === "donut" ||
    value === "line" ||
    value === "pie"
  );
}


