import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { CustomizeReportPaperFormat } from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";

type CustomizeReportRenderPdfPayload = {
  data?: Record<string, unknown>;
  fileName?: string;
  page?: {
    format?: CustomizeReportPaperFormat;
    landscape?: boolean;
  };
  template: string;
};

export async function RenderCustomizeReportPdf(payload: CustomizeReportRenderPdfPayload) {
  const response = await ApiClient.post<Blob>("/api/customize-report/render", payload, {
    baseURL: "",
    responseType: "blob",
  });

  return response.data;
}
