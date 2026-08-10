import { useState } from "react";
import toast from "react-hot-toast";
import type { CustomizeReportModuleOption, CustomizeReportPageSetup } from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";

type UseCustomizeReportPdfPreviewParams = {
  pageSetup: CustomizeReportPageSetup;
  reportData: unknown;
  selectedReport: CustomizeReportModuleOption | null;
  templatePreview: string;
};

export function useCustomizeReportPdfPreview({
  pageSetup,
  reportData,
  selectedReport,
  templatePreview,
}: UseCustomizeReportPdfPreviewParams) {
  const [isRendering, setIsRendering] = useState(false);

  async function handlePreviewPdf() {
    if (!selectedReport) {
      toast.error("Select a report module before previewing.");
      return;
    }

    setIsRendering(true);
    const previewWindow = window.open("", "_blank");

    try {
      const response = await fetch("/api/customize-report/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: templatePreview,
          data: reportData,
          fileName: `${selectedReport.documentPrefix}-custom-report-preview`,
          page: {
            format: pageSetup.format,
            landscape: pageSetup.orientation === "landscape",
          },
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorBody?.message || "Unable to generate PDF preview.");
      }

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (previewWindow) {
        previewWindow.location.href = pdfUrl;
      } else {
        window.location.href = pdfUrl;
      }

      toast.success("PDF preview generated.");
    } catch (error) {
      previewWindow?.close();
      toast.error(error instanceof Error ? error.message : "Unable to generate PDF preview.");
    } finally {
      setIsRendering(false);
    }
  }

  return {
    handlePreviewPdf,
    isRendering,
  };
}
