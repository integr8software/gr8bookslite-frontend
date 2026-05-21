import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { PartyManagementHref } from "@/app/src/constants/modules/party-management/PartyManagementConstants";

export function PartyInformationNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<div className="flex items-center gap-3">
				<span className="flex h-10 w-10 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
					<UserRound className="h-5 w-5" aria-hidden="true" />
				</span>
				<div>
					<h1 className="text-lg font-semibold text-darknavy">
						Party information not found
					</h1>
					<p className="mt-1 text-sm text-darknavy/55">
						The selected party record does not exist.
					</p>
				</div>
			</div>
			<Link
				href={PartyManagementHref}
				className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 transition hover:bg-skyblue/10"
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back to list
			</Link>
		</section>
	);
}
