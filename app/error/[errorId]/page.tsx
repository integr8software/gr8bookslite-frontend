import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	StatusErrorPage,
	type StatusErrorPageVariant,
} from "@/app/src/ui/shared/StatusErrorPage";

const supportedErrorIds = ["401", "403", "500"] as const;

type ErrorRouteParams = {
	errorId: string;
};

type ErrorRoutePageProps = {
	params: Promise<ErrorRouteParams>;
};

const errorMetadata: Record<StatusErrorPageVariant, Metadata> = {
	"401": {
		title: "401 Unauthorized Access | GR8BooksLite",
		description: "Unauthorized access state for GR8BooksLite.",
		robots: {
			follow: false,
			index: false,
		},
	},
	"403": {
		title: "403 Forbidden | GR8BooksLite",
		description: "Forbidden access state for GR8BooksLite.",
		robots: {
			follow: false,
			index: false,
		},
	},
	"500": {
		title: "500 Server Error | GR8BooksLite",
		description: "Server error page for GR8BooksLite.",
		robots: {
			follow: false,
			index: false,
		},
	},
};

export async function generateMetadata({
	params,
}: ErrorRoutePageProps): Promise<Metadata> {
	const { errorId } = await params;

	if (!isSupportedErrorId(errorId)) {
		return {};
	}

	return errorMetadata[errorId];
}

export default async function ErrorRoutePage({ params }: ErrorRoutePageProps) {
	const { errorId } = await params;

	if (!isSupportedErrorId(errorId)) {
		notFound();
	}

	return <StatusErrorPage variant={errorId} />;
}

function isSupportedErrorId(errorId: string): errorId is StatusErrorPageVariant {
	return supportedErrorIds.includes(errorId as StatusErrorPageVariant);
}
