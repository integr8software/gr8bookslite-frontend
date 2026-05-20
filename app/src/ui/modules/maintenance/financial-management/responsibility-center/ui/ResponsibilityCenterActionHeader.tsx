import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import {
	ResponsibilityCenterActionCopy,
	ResponsibilityCenterHref,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterActionMode,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

type ResponsibilityCenterActionHeaderProps = {
	center?: ResponsibilityCenter;
	isReadonly: boolean;
	mode: ResponsibilityCenterActionMode;
	onDeleteCenter: () => void;
};

export function ResponsibilityCenterActionHeader({
	center,
	isReadonly,
	mode,
	onDeleteCenter,
}: ResponsibilityCenterActionHeaderProps) {
	const copy = ResponsibilityCenterActionCopy[mode];

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h2 className="text-xl font-semibold text-darknavy">{copy.title}</h2>
				<p className="mt-1 text-sm text-darknavy/55">{copy.description}</p>
			</div>
			<div className="flex flex-wrap gap-2">
				{mode === "view" ? (
					<Link
						href={ResponsibilityCenterHref}
						className={secondaryButtonClassName}
					>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back
					</Link>
				) : null}
				{mode === "view" && center ? (
					<Link
						href={`${ResponsibilityCenterHref}/edit/${center.id}`}
						className={secondaryButtonClassName}
					>
						<Edit3 className="h-4 w-4" aria-hidden="true" />
						Edit
					</Link>
				) : null}
				{center ? (
					<button
						type="button"
						onClick={onDeleteCenter}
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-coralpink/25 bg-white px-4 text-sm font-semibold text-coralpink shadow-sm transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
						Delete
					</button>
				) : null}
				{mode === "edit" && center ? (
					<Link
						href={`${ResponsibilityCenterHref}/view/${center.id}`}
						className={secondaryButtonClassName}
					>
						<X className="h-4 w-4" aria-hidden="true" />
						Cancel
					</Link>
				) : null}
				{!isReadonly ? (
					<button
						type="submit"
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						<Save className="h-4 w-4" aria-hidden="true" />
						Save Center
					</button>
				) : null}
			</div>
		</div>
	);
}

const secondaryButtonClassName =
	"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";
