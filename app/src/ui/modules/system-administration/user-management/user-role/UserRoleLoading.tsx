import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";

export function UserRoleLoading() {
	return (
		<div
			className="grid gap-3"
			aria-busy="true"
			aria-label="Loading user roles"
		>
			{Array.from({ length: 4 }).map((_, index) => (
				<div
					key={index}
					className="grid gap-3 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
				>
					<div className="flex min-w-0 items-start gap-3">
						<AppSkeleton className="h-10 w-10 shrink-0 rounded-md" />
						<div className="min-w-0 flex-1">
							<AppSkeleton className="h-4 w-36 rounded-md" />
							<AppSkeleton className="mt-3 h-3 w-full max-w-md rounded-md" />
						</div>
					</div>
					<AppSkeleton className="h-4 w-24 rounded-md lg:justify-self-end" />
					<div className="flex gap-2 lg:justify-self-end">
						<AppSkeleton className="h-9 w-9 rounded-md" />
						<AppSkeleton className="h-9 w-9 rounded-md" />
					</div>
				</div>
			))}
		</div>
	);
}
