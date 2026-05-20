"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ListTree } from "lucide-react";
import {
	ChartsOfAccountsActionCopy,
	ChartsOfAccountsHref,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type { ChartsOfAccountsActionMode } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";

export function ChartsOfAccountsAction() {
	const pathname = usePathname();
	const mode = getActionMode(pathname);
	const copy = ChartsOfAccountsActionCopy[mode];

	return (
		<section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-slate-100 px-4 py-6 text-slate-950 sm:-mx-5 sm:px-6 lg:-mx-6">
			<div className="mx-auto grid min-h-[calc(100dvh-8rem)] max-w-3xl place-items-center">
				<div className="w-full rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
						<ListTree className="h-6 w-6" aria-hidden="true" />
					</div>

					<p className="mt-5 text-xs font-semibold uppercase tracking-wide text-blue-700">
						Chart of Accounts
					</p>
					<h1 className="mt-2 text-2xl font-semibold text-slate-950">
						{copy.heading}
					</h1>
					<p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
						{copy.helper}
					</p>

					<div className="mt-6 flex justify-center">
						<Link
							href={ChartsOfAccountsHref}
							className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back to Accounts
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

function getActionMode(pathname: string): ChartsOfAccountsActionMode {
	if (pathname.includes("/edit/")) {
		return "edit";
	}

	if (pathname.includes("/view/")) {
		return "view";
	}

	return "add";
}
