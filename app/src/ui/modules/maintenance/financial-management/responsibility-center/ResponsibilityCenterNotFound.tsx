import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";

export function ResponsibilityCenterNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-6 text-center shadow-sm">
			<h2 className="text-lg font-semibold text-darknavy">
				Responsibility center not found
			</h2>
			<p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-darknavy/55">
				The selected responsibility center may have been deleted or the link is
				no longer valid.
			</p>
			<div className="mt-5">
				<Link
					href={ResponsibilityCenterHref}
					className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back to Responsibility Center
				</Link>
			</div>
		</section>
	);
}
