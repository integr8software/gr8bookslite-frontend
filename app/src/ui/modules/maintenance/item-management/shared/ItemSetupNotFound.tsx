import Link from "next/link";
import { Tags } from "lucide-react";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type ItemSetupNotFoundProps = {
	href: string;
	title: string;
};

export function ItemSetupNotFound({ href, title }: ItemSetupNotFoundProps) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-skyblue/12 text-skyblue">
				<Tags className="h-6 w-6" aria-hidden="true" />
			</div>
			<h1 className="mt-4 text-xl font-semibold text-darknavy">
				{title} not found
			</h1>
			<p className="mx-auto mt-2 max-w-md text-sm text-darknavy/60">
				The setup record may have been removed or the record identifier is invalid.
			</p>
			<Link href={href} className={`${moduleHeaderActionClassNames.primary} mt-5`}>
				Back
			</Link>
		</section>
	);
}

