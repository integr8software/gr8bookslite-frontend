import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { RenderCustomizeReportPdf } from "@/app/src/services/modules/system-administration/customized-reports/CustomizeReportPdfService";
import type {
  CustomizeReportModuleOption,
  CustomizeReportPageSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";

const CustomizeReportPreviewErrorMessage = "Unable to generate PDF preview.";

type UseCustomizeReportPdfPreviewParams = {
  pageSetup: CustomizeReportPageSetup;
  reportData: Record<string, unknown>;
  selectedReport: CustomizeReportModuleOption | null;
  templatePreview: string;
};

export function useCustomizeReportPdfPreview({
  pageSetup,
  reportData,
  selectedReport,
  templatePreview,
}: UseCustomizeReportPdfPreviewParams) {
  const previewMutation = useMutation({
    mutationFn: RenderCustomizeReportPdf,
  });

  async function handlePreviewPdf() {
    if (!selectedReport) {
      toast.error("Select a report module before previewing.");
      return;
    }

    const previewWindow = window.open("", "_blank");

    try {
      const pdfBlob = await previewMutation.mutateAsync({
        template: templatePreview,
        data: reportData,
        fileName: `${selectedReport.documentPrefix}-custom-report-preview`,
        page: {
          format: pageSetup.format,
          height: pageSetup.height,
          landscape: pageSetup.orientation === "landscape",
          width: pageSetup.width,
        },
      });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (previewWindow) {
        previewWindow.location.href = pdfUrl;
      } else {
        window.location.href = pdfUrl;
      }

      toast.success("PDF preview generated.");
    } catch (error) {
      previewWindow?.close();
      toast.error(error instanceof Error ? error.message : CustomizeReportPreviewErrorMessage);
    }
  }

  return {
    handlePreviewPdf,
    isRendering: previewMutation.isPending,
  };
}
