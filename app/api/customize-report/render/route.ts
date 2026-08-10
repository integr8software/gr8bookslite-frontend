import { createRequire } from "module";
import { NextResponse } from "next/server";
import type { CustomizeReportPaperFormat } from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";

export const dynamic = "force-dynamic";
export const maxDuration = 120;
export const runtime = "nodejs";

type CustomizeReportRenderPdfPayload = {
  data?: Record<string, unknown>;
  fileName?: string;
  page?: {
    format?: CustomizeReportPaperFormat;
    landscape?: boolean;
  };
  template: string;
};

type JsreportInstance = {
  init: () => Promise<void>;
  render: (request: { template: Record<string, unknown>; data?: Record<string, unknown> }) => Promise<{ content: Buffer }>;
};

type JsreportFactory = (options?: Record<string, unknown>) => JsreportInstance & {
  use: (extension: unknown) => void;
};

const require = createRequire(import.meta.url);
let reporterPromise: Promise<JsreportInstance> | null = null;

async function createReporter() {
  const jsreport = require("@jsreport/jsreport-core") as JsreportFactory;
  const chromePdf = require("@jsreport/jsreport-chrome-pdf") as () => unknown;
  const handlebars = require("@jsreport/jsreport-handlebars") as () => unknown;

  const reporter = jsreport({
    reportTimeout: 120000,
    chrome: {
      strategy: "dedicated-process",
      launchOptions: {
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
        timeout: 120000,
        protocolTimeout: 120000,
      },
    },
  });

  reporter.use(chromePdf());
  reporter.use(handlebars());

  await reporter.init();

  return reporter;
}

function getReporter() {
  reporterPromise ??= createReporter();
  return reporterPromise;
}

function sanitizeFileName(fileName?: string) {
  return (fileName || "custom-report")
    .replace(/[^a-z0-9-_]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRenderRequest(value: unknown): CustomizeReportRenderPdfPayload | null {
  if (!isRecord(value) || typeof value.template !== "string" || !value.template.trim()) {
    return null;
  }

  const page = isRecord(value.page) ? value.page : {};
  const format = page.format;
  const landscape = page.landscape;

  if (format !== undefined && !["A4", "Letter", "Legal"].includes(String(format))) {
    return null;
  }

  if (landscape !== undefined && typeof landscape !== "boolean") {
    return null;
  }

  const parsedFormat =
    typeof format === "string" && ["A4", "Letter", "Legal"].includes(format) ? (format as CustomizeReportPaperFormat) : undefined;

  return {
    data: isRecord(value.data) ? value.data : undefined,
    fileName: typeof value.fileName === "string" ? value.fileName : undefined,
    page: {
      format: parsedFormat,
      landscape,
    },
    template: value.template,
  };
}

export async function POST(request: Request) {
  try {
    const body = parseRenderRequest(await request.json());

    if (!body) {
      return NextResponse.json({ message: "Valid report template content is required." }, { status: 400 });
    }

    const reporter = await getReporter();
    const report = await reporter.render({
      template: {
        content: body.template,
        engine: "handlebars",
        recipe: "chrome-pdf",
        chrome: {
          format: body.page?.format || "A4",
          landscape: body.page?.landscape || false,
          marginTop: "0in",
          marginRight: "0in",
          marginBottom: "0in",
          marginLeft: "0in",
          printBackground: true,
          waitForNetworkIdle: false,
        },
      },
      data: body.data,
    });

    const fileName = `${sanitizeFileName(body.fileName)}.pdf`;

    return new NextResponse(new Uint8Array(report.content), {
      headers: {
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("[customize-report:render] PDF render failed", {
      message: error instanceof Error ? error.message : "Unknown render error.",
    });

    return NextResponse.json(
      {
        message: "Unable to render the report.",
      },
      { status: 500 },
    );
  }
}
