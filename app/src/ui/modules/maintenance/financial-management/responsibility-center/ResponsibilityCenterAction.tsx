"use client";

import Link from "next/link";
import { ArrowLeft, Edit3, Home, Save, Trash2, X } from "lucide-react";
import {
	ResponsibilityCenterActionCopy,
	ResponsibilityCenterHref,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { useResponsibilityCenterAction } from "@/app/src/hooks/modules/maintenance/financial-management/responsibility-center/useResponsibilityCenterAction";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ResponsibilityCenterDeleteDialog } from "./ResponsibilityCenterDeleteDialog";
import { ResponsibilityCenterDetailsFields } from "./ResponsibilityCenterDetailsFields";
import { ResponsibilityCenterNotFound } from "./ResponsibilityCenterNotFound";

export function ResponsibilityCenterAction() {
	const action = useResponsibilityCenterAction();
	const needsRecord = action.mode === "edit" || action.mode === "view";
	const copy = ResponsibilityCenterActionCopy[action.mode];

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
									onClick={() => action.setIsDeleteOpen(true)}
									className={moduleHeaderActionClassNames.danger}
								>
									<Trash2 className="h-4 w-4" aria-hidden="true" />
									Delete
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
					onInputChange={action.onInputChange}
				/>
			</form>
			<ResponsibilityCenterDeleteDialog
				center={action.center}
				isOpen={action.isDeleteOpen}
				isPending={action.isMutating}
				onCancel={() => action.setIsDeleteOpen(false)}
				onConfirm={action.onConfirmDelete}
			/>
		</>
	);
}
