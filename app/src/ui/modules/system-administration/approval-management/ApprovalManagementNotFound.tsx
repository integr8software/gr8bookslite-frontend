import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ApprovalManagementHref } from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function ApprovalManagementNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-6 text-center shadow-sm">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
				<ShieldCheck className="h-6 w-6" aria-hidden="true" />
			</div>
			<h1 className="mt-4 text-xl font-semibold text-darknavy">
				Approval Workflow Not Found
			</h1>
			<p className="mx-auto mt-2 max-w-md text-sm text-darknavy/55">
				The selected approval workflow may have been moved or removed.
			</p>
			<Link
				href={ApprovalManagementHref}
				className={`mt-5 ${moduleHeaderActionClassNames.secondary}`}
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back to Workflows
			</Link>
		</section>
	);
}
