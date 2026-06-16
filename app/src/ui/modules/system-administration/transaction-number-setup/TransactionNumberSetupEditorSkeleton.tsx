import { RefreshCw, Settings2 } from "lucide-react";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import { transactionNumberPrimaryButtonClassName } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupUi";

export function TransactionNumberSetupEditorSkeleton() {
	return (
		<div
			className="grid content-start gap-5 p-4 lg:p-5"
			aria-label="Loading transaction number setup"
			aria-busy="true"
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="grid gap-2">
					<AppSkeleton className="h-3 w-36 rounded-md" />
					<AppSkeleton className="h-7 w-72 max-w-full rounded-md" />
				</div>
				<button
					type="button"
					disabled
					className={transactionNumberPrimaryButtonClassName}
				>
					<RefreshCw
						className="h-4 w-4 animate-spin"
						aria-hidden="true"
					/>
					Update
				</button>
			</div>

			<div className="flex flex-col gap-5">
				<section className="rounded-md border border-darknavy/10 p-4">
					<div className="mb-4">
						<AppSkeleton className="h-4 w-32 rounded-md" />
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						{Array.from({ length: 8 }).map((_, index) => (
							<div key={index} className="grid gap-2">
								<AppSkeleton className="h-4 w-28 rounded-md" />
								<AppSkeleton className="h-11 w-full rounded-md" />
							</div>
						))}
					</div>
				</section>

				<section className="rounded-md border border-darknavy/10">
					<div className="flex items-center gap-2 border-b border-darknavy/10 px-4 py-3">
						<Settings2
							className="h-4 w-4 text-darknavy/30"
							aria-hidden="true"
						/>
						<AppSkeleton className="h-4 w-32 rounded-md" />
					</div>
					<div className="grid gap-2 p-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<div
								key={index}
								className="flex min-h-12 items-center gap-3 rounded-md border border-darknavy/10 bg-offwhite/45 px-3"
							>
								<AppSkeleton className="h-4 w-4 rounded-full" />
								<div className="grid flex-1 gap-1.5">
									<AppSkeleton className="h-4 w-56 max-w-full rounded-md" />
									<AppSkeleton className="h-3 w-20 rounded-md" />
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
