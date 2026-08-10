import type { CustomizeReportPaperFormat } from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";

export type CustomizeReportRenderPdfRequest = {
  data?: Record<string, unknown>;
  fileName?: string;
  page?: {
    format?: CustomizeReportPaperFormat;
    landscape?: boolean;
  };
  template: string;
};
