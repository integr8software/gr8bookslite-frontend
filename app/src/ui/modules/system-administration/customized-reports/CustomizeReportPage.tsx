"use client";

import { useCustomizeReportDesigner } from "@/app/src/hooks/modules/system-administration/customized-reports/useCustomizeReportDesigner";
import { CustomizeReportDesignerCanvas } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportDesignerCanvas";
import { CustomizeReportDesignerHeader } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportDesignerHeader";
import { CustomizeReportElementsPanel } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportElementsPanel";
import { CustomizeReportInspectorPanel } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportInspectorPanel";
import { CustomizeReportToolsDialog } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportToolsDialog";
import { CustomizedReportNotFound } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizedReportNotFound";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export function CustomizeReportPage() {
  const {
    alignmentGuides,
    canvasScrollRef,
    canRedo,
    canUndo,
    deleteTargetType,
    fields,
    gridSize,
    handleAddLine,
    handleAddStaticText,
    handleAddTableColumn,
    handleApplyPresetTemplate,
    handleAlignDistributeSelected,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
    handleConfirmDeleteSelectedElement,
    handleDuplicateSelectedElement,
    handleElementSelect,
    handleLayerSelectedElement,
    handleLinePointerDown,
    handleLogoUpload,
    handlePageFormatChange,
    handlePageOrientationChange,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePreviewPdf,
    handleRedoLayout,
    handleResetLayout,
    handleResizePointerDown,
    handleRemoveTableColumn,
    handleSaveLayout,
    handleTablePointerDown,
    handleToggleFieldVisibility,
    handleToggleLineVisibility,
    handleToggleSelectedLock,
    handleUndoLayout,
    hasMultiSelection,
    isCanvasPanning,
    isElementsPanelOpen,
    isRendering,
    isToolsDialogOpen,
    lines,
    marginSetup,
    pageSetup,
    reportData,
    selectedElementSet,
    selectedElementType,
    selectedElements,
    selectedField,
    selectedFieldId,
    selectedLine,
    selectedPresetTemplateId,
    selectedReport,
    selectedReportId,
    setDeleteTargetType,
    setGridSize,
    setIsElementsPanelOpen,
    setIsToolsDialogOpen,
    setSelectedPresetTemplateId,
    setSelectedReportId,
    setSnapToGrid,
    setZoom,
    snapToGrid,
    tableSetup,
    templatePreview,
    updateMarginSetup,
    updateSelectedField,
    updateSelectedLine,
    updateTableColumn,
    updateTableSetup,
    zoom,
  } = useCustomizeReportDesigner();

  if (!selectedReport) {
    return <CustomizedReportNotFound />;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-6">
      <AppDialog
        confirmLabel="Delete"
        description="This removes the selected report element from the layout."
        iconTone="error"
        isOpen={deleteTargetType !== null}
        onCancel={() => setDeleteTargetType(null)}
        onConfirm={handleConfirmDeleteSelectedElement}
        title="Delete selected element?"
        tone="danger"
      />
      <CustomizeReportDesignerHeader
        canRedo={canRedo}
        canUndo={canUndo}
        isRendering={isRendering}
        onOpenTools={() => setIsToolsDialogOpen(true)}
        onPageFormatChange={handlePageFormatChange}
        onPageOrientationChange={handlePageOrientationChange}
        onPresetTemplateApply={handleApplyPresetTemplate}
        onPreviewPdf={handlePreviewPdf}
        onRedoLayout={handleRedoLayout}
        onResetLayout={handleResetLayout}
        onSaveLayout={handleSaveLayout}
        onSelectedPresetTemplateIdChange={setSelectedPresetTemplateId}
        onSelectedReportIdChange={setSelectedReportId}
        onUndoLayout={handleUndoLayout}
        onZoomChange={setZoom}
        pageSetup={pageSetup}
        selectedPresetTemplateId={selectedPresetTemplateId}
        selectedReport={selectedReport}
        selectedReportId={selectedReportId}
        zoom={zoom}
      />

      <CustomizeReportToolsDialog
        gridSize={gridSize}
        isOpen={isToolsDialogOpen}
        marginSetup={marginSetup}
        onAddLine={handleAddLine}
        onAddStaticText={handleAddStaticText}
        onClose={() => setIsToolsDialogOpen(false)}
        onGridSizeChange={setGridSize}
        onLogoUpload={handleLogoUpload}
        onMarginSetupChange={updateMarginSetup}
        onSnapToGridChange={setSnapToGrid}
        snapToGrid={snapToGrid}
      />
      <section
        className={`grid gap-4 ${
          isElementsPanelOpen
            ? "xl:grid-cols-[240px_minmax(0,1fr)_290px]"
            : "xl:grid-cols-[48px_minmax(0,1fr)_290px]"
        }`}
      >
        <CustomizeReportElementsPanel
          fields={fields}
          isOpen={isElementsPanelOpen}
          lines={lines}
          onElementSelect={handleElementSelect}
          onOpenChange={setIsElementsPanelOpen}
          onToggleFieldVisibility={handleToggleFieldVisibility}
          onToggleLineVisibility={handleToggleLineVisibility}
          selectedElementSet={selectedElementSet}
        />
        <CustomizeReportDesignerCanvas
          alignmentGuides={alignmentGuides}
          canvasScrollRef={canvasScrollRef}
          fields={fields}
          gridSize={gridSize}
          isCanvasPanning={isCanvasPanning}
          lines={lines}
          marginSetup={marginSetup}
          onCanvasPointerDown={handleCanvasPointerDown}
          onCanvasPointerMove={handleCanvasPointerMove}
          onCanvasPointerUp={handleCanvasPointerUp}
          onElementSelect={handleElementSelect}
          onFieldPointerDown={handlePointerDown}
          onLinePointerDown={handleLinePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onResizePointerDown={handleResizePointerDown}
          onTablePointerDown={handleTablePointerDown}
          pageSetup={pageSetup}
          reportData={reportData}
          selectedElementSet={selectedElementSet}
          selectedElementType={selectedElementType}
          selectedFieldId={selectedFieldId}
          snapToGrid={snapToGrid}
          tableSetup={tableSetup}
          zoom={zoom}
        />
        <CustomizeReportInspectorPanel
          hasMultiSelection={hasMultiSelection}
          marginSetup={marginSetup}
          onAddTableColumn={handleAddTableColumn}
          onAlignDistribute={handleAlignDistributeSelected}
          onDeleteField={() => setDeleteTargetType("field")}
          onDeleteLine={() => setDeleteTargetType("line")}
          onDuplicate={handleDuplicateSelectedElement}
          onLayer={handleLayerSelectedElement}
          onRemoveTableColumn={handleRemoveTableColumn}
          onToggleLock={handleToggleSelectedLock}
          onTableColumnChange={updateTableColumn}
          onTableSetupChange={updateTableSetup}
          onUpdateField={updateSelectedField}
          onUpdateLine={updateSelectedLine}
          pageSetup={pageSetup}
          selectedElementType={selectedElementType}
          selectedElements={selectedElements}
          selectedField={selectedField}
          selectedLine={selectedLine}
          tableSetup={tableSetup}
          templatePreview={templatePreview}
        />
      </section>
    </main>
  );
}

