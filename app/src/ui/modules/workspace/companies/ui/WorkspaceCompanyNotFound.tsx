import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function WorkspaceCompanyNotFound({
	description = "The record may have been moved, set inactive, or removed from the mock workspace data.",
	href,
	title,
}: {
	description?: string;
	href: string;
	title: string;
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
			<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-skyblue/15 text-darknavy">
				<SearchX className="h-5 w-5" aria-hidden="true" />
			</span>
			<h1 className="mt-4 text-xl font-semibold text-darknavy">{title}</h1>
			<p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-darknavy/58">
				{description}
			</p>
			<Link href={href} className={`${moduleHeaderActionClassNames.secondary} mt-5`}>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
		</section>
	);
}
