import Link from "next/link";
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
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import {
	getNextWorkspaceCompanyStatus,
} from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import type {
	WorkspaceCompanyActionMode,
	WorkspaceCompanyStatus,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function WorkspaceCompanyActionHeader({
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
	extraActions?: React.ReactNode;
	formId: string;
	isReadonly: boolean;
	isPending?: boolean;
	mode: WorkspaceCompanyActionMode;
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
							className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-70`}
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
