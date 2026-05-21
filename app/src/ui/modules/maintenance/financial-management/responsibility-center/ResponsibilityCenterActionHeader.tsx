import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import {
	ResponsibilityCenterActionCopy,
	ResponsibilityCenterHref,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterActionMode,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import {
	ResponsibilityCenterDangerButton,
	ResponsibilityCenterPrimaryButton,
	ResponsibilityCenterSecondaryLink,
} from "./ResponsibilityCenterButtons";

type ResponsibilityCenterActionHeaderProps = {
	center?: ResponsibilityCenter;
	isReadonly: boolean;
	mode: ResponsibilityCenterActionMode;
	onDeleteCenter: () => void;
};

export function ResponsibilityCenterActionHeader({
	center,
	isReadonly,
	mode,
	onDeleteCenter,
}: ResponsibilityCenterActionHeaderProps) {
	const copy = ResponsibilityCenterActionCopy[mode];

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h2 className="text-xl font-semibold text-darknavy">{copy.title}</h2>
				<p className="mt-1 text-sm text-darknavy/55">{copy.description}</p>
			</div>
			<div className="flex flex-wrap gap-2">
				{mode === "view" ? (
					<ResponsibilityCenterSecondaryLink
						href={ResponsibilityCenterHref}
						icon={ArrowLeft}
						label="Back"
					/>
				) : null}
				{mode === "view" && center ? (
					<ResponsibilityCenterSecondaryLink
						href={`${ResponsibilityCenterHref}/edit/${center.id}`}
						icon={Edit3}
						label="Edit"
					/>
				) : null}
				{center ? (
					<ResponsibilityCenterDangerButton
						onClick={onDeleteCenter}
						icon={Trash2}
						label="Delete"
					/>
				) : null}
				{mode === "edit" && center ? (
					<ResponsibilityCenterSecondaryLink
						href={`${ResponsibilityCenterHref}/view/${center.id}`}
						icon={X}
						label="Cancel"
					/>
				) : null}
				{!isReadonly ? (
					<ResponsibilityCenterPrimaryButton
						type="submit"
						icon={Save}
						label="Save Center"
					/>
				) : null}
			</div>
		</div>
	);
}
