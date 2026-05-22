import Link from "next/link";
import { Edit3, Eye } from "lucide-react";
import { PartyManagementHref } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";

export function PartyInformationRecordActions({
	id,
	name,
}: {
	id: string;
	name: string;
}) {
	return (
		<div className="flex items-center justify-center gap-1">
			<IconLink href={`${PartyManagementHref}/view/${id}`} label={`View ${name}`}>
				<Eye className="h-4 w-4" aria-hidden="true" />
			</IconLink>
			<IconLink href={`${PartyManagementHref}/edit/${id}`} label={`Edit ${name}`}>
				<Edit3 className="h-4 w-4" aria-hidden="true" />
			</IconLink>
		</div>
	);
}

function IconLink({
	children,
	href,
	label,
}: {
	children: React.ReactNode;
	href: string;
	label: string;
}) {
	return (
		<Link
			href={href}
			aria-label={label}
			className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5"
		>
			{children}
		</Link>
	);
}
