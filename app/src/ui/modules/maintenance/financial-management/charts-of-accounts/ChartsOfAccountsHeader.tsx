"use client";

import { Download, Home, Plus, Upload } from "lucide-react";
import { Button } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls.tsx";

export function ChartsOfAccountsHeader({
	onAddAccount,
}: {
	onAddAccount: () => void;
}) {
	return (
		<div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
			<div>
				<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
					<Home className="h-3.5 w-3.5" aria-hidden="true" />
					Accounting master data
				</div>
				<h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
					Chart of Accounts
				</h1>
				<p className="mt-2 max-w-2xl text-sm text-slate-500">
					Manage all company accounts and financial statement mapping
				</p>
			</div>
			<div className="flex flex-wrap gap-2">
				<Button variant="secondary">
					<Upload className="h-4 w-4" aria-hidden="true" />
					Import
				</Button>
				<Button variant="secondary">
					<Download className="h-4 w-4" aria-hidden="true" />
					Export
				</Button>
				<Button onClick={onAddAccount}>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add Account
				</Button>
			</div>
		</div>
	);
}
