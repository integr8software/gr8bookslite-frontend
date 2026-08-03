import { createRequire } from "module";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;
export const runtime = "nodejs";

type JsreportRenderRequest = {
	template?: string;
	data?: Record<string, unknown>;
	fileName?: string;
	page?: {
		format?: "A4" | "Letter" | "Legal";
		landscape?: boolean;
	};
};

type JsreportInstance = {
	init: () => Promise<void>;
	render: (request: {
		template: Record<string, unknown>;
		data?: Record<string, unknown>;
	}) => Promise<{ content: Buffer }>;
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

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as JsreportRenderRequest;

		if (!body.template?.trim()) {
			return NextResponse.json(
				{ message: "Template content is required." },
				{ status: 400 },
			);
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
		const message =
			error instanceof Error ? error.message : "Unable to render the report.";

		return NextResponse.json(
			{
				message,
			},
			{ status: 500 },
		);
	}
}
