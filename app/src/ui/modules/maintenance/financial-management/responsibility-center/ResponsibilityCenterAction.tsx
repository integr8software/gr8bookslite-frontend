"use client";

import Link from "next/link";
import {
	ArrowLeft,
	CheckCircle2,
	CircleOff,
	Edit3,
	Home,
	Save,
	X,
} from "lucide-react";
import {
	ResponsibilityCenterActionCopy,
	ResponsibilityCenterHref,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { useResponsibilityCenterAction } from "@/app/src/hooks/modules/maintenance/financial-management/responsibility-center/useResponsibilityCenterAction";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ResponsibilityCenterSetStatusDialog } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterSetStatusDialog";
import { ResponsibilityCenterDetailsFields } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterDetailsFields";
import { ResponsibilityCenterNotFound } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterNotFound";

export function ResponsibilityCenterAction() {
	const action = useResponsibilityCenterAction();
	const needsRecord = action.mode === "edit" || action.mode === "view";
	const copy = ResponsibilityCenterActionCopy[action.mode];
	const StatusIcon = action.nextStatus === "Inactive" ? CircleOff : CheckCircle2;
	const statusLabel =
		action.nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active";

	if (needsRecord && !action.center) {
		return <ResponsibilityCenterNotFound />;
	}

	return (
		<>
			<form onSubmit={action.onSubmit} className="grid gap-5">
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={copy.title}
					description={copy.description}
					eyebrow={
						<>
							<Home className="h-3.5 w-3.5" aria-hidden="true" />
							Accounting master data
						</>
					}
					actions={
						<>
							{action.mode === "view" ? (
								<Link
									href={ResponsibilityCenterHref}
									className={moduleHeaderActionClassNames.secondary}
								>
									<ArrowLeft className="h-4 w-4" aria-hidden="true" />
									Back
								</Link>
							) : null}
							{action.mode === "view" && action.center ? (
								<Link
									href={`${ResponsibilityCenterHref}/edit/${action.center.id}`}
									className={moduleHeaderActionClassNames.secondary}
								>
									<Edit3 className="h-4 w-4" aria-hidden="true" />
									Edit
								</Link>
							) : null}
							{action.center ? (
								<button
									type="button"
									onClick={() => action.setIsStatusDialogOpen(true)}
									className={inactiveActionClassName}
								>
									<StatusIcon className="h-4 w-4" aria-hidden="true" />
									{statusLabel}
								</button>
							) : null}
							{action.mode === "edit" && action.center ? (
								<Link
									href={`${ResponsibilityCenterHref}/view/${action.center.id}`}
									className={moduleHeaderActionClassNames.secondary}
								>
									<X className="h-4 w-4" aria-hidden="true" />
									Cancel
								</Link>
							) : null}
							{!action.isReadonly ? (
								<button
									type="submit"
									className={moduleHeaderActionClassNames.primary}
								>
									<Save className="h-4 w-4" aria-hidden="true" />
									Save Center
								</button>
							) : null}
						</>
					}
				/>
				<ResponsibilityCenterDetailsFields
					errors={action.errors}
					isReadonly={action.isReadonly}
					parentOptions={action.parentOptions}
					values={action.values}
					onFieldChange={action.onFieldChange}
					onInputChange={action.onInputChange}
				/>
			</form>
			<ResponsibilityCenterSetStatusDialog
				center={action.center}
				isOpen={action.isStatusDialogOpen}
				isPending={action.isMutating}
				onCancel={() => action.setIsStatusDialogOpen(false)}
				onConfirm={action.onConfirmStatusChange}
			/>
		</>
	);
}

const inactiveActionClassName =
	"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-coralpink/25 bg-white px-4 text-sm font-semibold text-coralpink";
