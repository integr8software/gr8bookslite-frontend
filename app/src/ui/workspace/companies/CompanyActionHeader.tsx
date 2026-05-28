import Link from "next/link";
import type { ReactNode } from "react";
import {
	ArrowLeft,
	CheckCircle2,
	CircleOff,
	Edit3,
	LoaderCircle,
	Save,
	X,
	type LucideIcon,
} from "lucide-react";
import {
	WorkspaceCompanyEditFromViewQuery,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
	getNextWorkspaceCompanyStatus,
} from "@/app/src/data/workspace/companies/WorkspaceCompanyData";
import type {
	WorkspaceCompanyFormMode,
	WorkspaceCompanyStatus,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const WorkspaceCompanySubmitActionClassName =
	"theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold shadow-[0_12px_30px_rgb(var(--skyblue-rgb)/0.24)] transition hover:bg-skyblue/85 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-70";

export function CompanyActionHeader({
	cancelHref,
	description,
	editHref,
	eyebrowIcon: EyebrowIcon,
	eyebrowLabel,
	extraActions,
	formId,
	isReadonly,
	isPending = false,
	mode,
	saveLabel,
	status,
	title,
	onStatusChange,
}: {
	cancelHref: string;
	description: string;
	editHref?: string;
	eyebrowIcon: LucideIcon;
	eyebrowLabel: string;
	extraActions?: ReactNode;
	formId: string;
	isReadonly: boolean;
	isPending?: boolean;
	mode: WorkspaceCompanyFormMode;
	saveLabel: string;
	status?: WorkspaceCompanyStatus;
	title: string;
	onStatusChange?: () => void;
}) {
	const nextStatus = status ? getNextWorkspaceCompanyStatus(status) : undefined;
	const StatusIcon = nextStatus === "Active" ? CheckCircle2 : CircleOff;
	const resolvedEditHref =
		editHref && !editHref.includes("?")
			? `${editHref}?${WorkspaceCompanyEditFromViewQuery}`
			: editHref;

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={title}
			description={description}
			eyebrow={
				<>
					<EyebrowIcon className="h-3.5 w-3.5" aria-hidden="true" />
					{eyebrowLabel}
				</>
			}
			actions={
				<>
					{mode === "view" ? (
						<Link href={cancelHref} className={moduleHeaderActionClassNames.secondary}>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
					) : null}
					{mode === "view" && resolvedEditHref ? (
						<Link href={resolvedEditHref} className={moduleHeaderActionClassNames.secondary}>
							<Edit3 className="h-4 w-4" aria-hidden="true" />
							Edit
						</Link>
					) : null}
					{extraActions}
					{mode !== "view" ? (
						<Link href={cancelHref} className={moduleHeaderActionClassNames.secondary}>
							<X className="h-4 w-4" aria-hidden="true" />
							Cancel
						</Link>
					) : null}
					{status && onStatusChange ? (
						<button
							type="button"
							onClick={onStatusChange}
							className={
								nextStatus === "Inactive"
									? moduleHeaderActionClassNames.danger
									: moduleHeaderActionClassNames.secondary
							}
						>
							<StatusIcon className="h-4 w-4" aria-hidden="true" />
							{nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active"}
						</button>
					) : null}
					{!isReadonly ? (
						<button
							type="submit"
							form={formId}
							disabled={isPending}
							aria-busy={isPending}
							className={joinClasses(WorkspaceCompanySubmitActionClassName)}
						>
							{isPending ? (
								<LoaderCircle
									className="h-4 w-4 animate-spin"
									aria-hidden="true"
								/>
							) : (
								<Save className="h-4 w-4" aria-hidden="true" />
							)}
							{isPending ? "Saving..." : saveLabel}
						</button>
					) : null}
				</>
			}
		/>
	);
}
