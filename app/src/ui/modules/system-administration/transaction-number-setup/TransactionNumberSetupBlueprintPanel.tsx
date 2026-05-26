import { Code2, Database, ShieldCheck } from "lucide-react";
import {
	TransactionNumberApiEndpoints,
	TransactionNumberDatabaseTables,
	TransactionNumberEdgeCases,
} from "@/app/src/data/modules/system-administration/transaction-number-setup/TransactionNumberSetupData";
import { TransactionNumberGenerationPseudoCode } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberGenerationService";

export function TransactionNumberSetupBlueprintPanel() {
	return (
		<section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="mb-4 flex items-center gap-2">
					<Database className="h-5 w-5 text-skyblue" aria-hidden="true" />
					<h2 className="text-base font-semibold text-darknavy">
						Database Design
					</h2>
				</div>
				<div className="grid gap-3">
					{TransactionNumberDatabaseTables.map((table) => (
						<article
							key={table.name}
							className="rounded-md border border-darknavy/10 bg-offwhite/45 p-3"
						>
							<h3 className="font-mono text-xs font-semibold text-darknavy">
								{table.name}
							</h3>
							<p className="mt-1 text-xs text-darknavy/55">{table.purpose}</p>
							<div className="mt-2 flex flex-wrap gap-1.5">
								{table.columns.map((column) => (
									<span
										key={column}
										className="rounded bg-white px-2 py-1 font-mono text-[0.7rem] text-darknavy/70 ring-1 ring-darknavy/8"
									>
										{column}
									</span>
								))}
							</div>
						</article>
					))}
				</div>
			</div>
			<div className="grid gap-4">
				<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
					<div className="mb-4 flex items-center gap-2">
						<Code2 className="h-5 w-5 text-skyblue" aria-hidden="true" />
						<h2 className="text-base font-semibold text-darknavy">
							API Surface
						</h2>
					</div>
					<div className="grid gap-2">
						{TransactionNumberApiEndpoints.map((endpoint) => (
							<div
								key={`${endpoint.method}-${endpoint.path}`}
								className="rounded-md border border-darknavy/10 p-3"
							>
								<div className="flex items-center gap-2">
									<span className="rounded bg-skyblue/15 px-2 py-1 font-mono text-[0.7rem] font-semibold text-darknavy">
										{endpoint.method}
									</span>
									<span className="font-mono text-xs text-darknavy">
										{endpoint.path}
									</span>
								</div>
								<p className="mt-1 text-xs text-darknavy/55">
									{endpoint.purpose}
								</p>
							</div>
						))}
					</div>
				</div>
				<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
					<div className="mb-4 flex items-center gap-2">
						<ShieldCheck className="h-5 w-5 text-skyblue" aria-hidden="true" />
						<h2 className="text-base font-semibold text-darknavy">
							Concurrency Guard
						</h2>
					</div>
					<pre className="max-h-64 overflow-auto rounded-md bg-darknavy p-3 text-[0.7rem] leading-5 text-offwhite">
						{TransactionNumberGenerationPseudoCode}
					</pre>
					<div className="mt-3 grid gap-1.5">
						{TransactionNumberEdgeCases.map((edgeCase) => (
							<p key={edgeCase} className="text-xs text-darknavy/60">
								{edgeCase}
							</p>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
