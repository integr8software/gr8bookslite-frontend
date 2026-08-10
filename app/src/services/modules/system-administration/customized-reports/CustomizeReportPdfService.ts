import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { CustomizeReportRenderPdfRequest } from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportApiTypes";

export async function RenderCustomizeReportPdf(payload: CustomizeReportRenderPdfRequest) {
  const response = await ApiClient.post<Blob>("/api/customize-report/render", payload, {
    baseURL: "",
    responseType: "blob",
  });

  return response.data;
}
