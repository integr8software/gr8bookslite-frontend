import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type IconProps = {
	icon: LucideIcon;
	label: string;
};

type LinkProps = IconProps & {
	href: string;
};

export function ResponsibilityCenterSecondaryLink({
	href,
	icon: Icon,
	label,
}: LinkProps) {
	return (
		<Link href={href} className={secondaryButtonClassName}>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{label}
		</Link>
	);
}

export const iconButtonClassName =
	"flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";

const secondaryButtonClassName =
	"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";
