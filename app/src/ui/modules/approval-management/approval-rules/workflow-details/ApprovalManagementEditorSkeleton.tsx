import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";

export function ApprovalManagementEditorSkeleton() {
	return (
		<div className="grid content-start gap-5 p-4 lg:p-5" aria-busy="true">
			<div className="flex items-start justify-between gap-3">
				<div className="grid gap-2">
					<AppSkeleton className="h-3 w-32 rounded-md" />
					<AppSkeleton className="h-6 w-64 rounded-md" />
				</div>
				<AppSkeleton className="h-10 w-24 rounded-md" />
			</div>
			<AppSkeleton className="h-96 rounded-md" />
		</div>
	);
}
