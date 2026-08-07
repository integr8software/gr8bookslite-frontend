"use client";

import { useMemo } from "react";
import { ResponsibilityCenterInitialFormValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterClassification,
	ResponsibilityCenterFormValues,
	ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";

type ProjectNameDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	onCreateProject?: (project: ResponsibilityCenter) => void;
};

export function ProjectNameDialog({
	isOpen,
	onClose,
	onCreateProject,
}: ProjectNameDialogProps) {
	const classifications = useResponsibilityCenterStore(
		(state) => state.classifications,
	);
	const types = useResponsibilityCenterStore((state) => state.types);
	const initialValues = useMemo(
		() => createProjectNameInitialValues(classifications, types),
		[classifications, types],
	);

	return (
		<ResponsibilityCenterDrawer
			initialValues={initialValues}
			isOpen={isOpen}
			mode="add"
			onClose={onClose}
			onSaved={onCreateProject}
		/>
	);
}

function createProjectNameInitialValues(
	classifications: ResponsibilityCenterClassification[],
	types: ResponsibilityCenterTypeOption[],
): ResponsibilityCenterFormValues {
	const projectType = types.find((type) => type.name === "Project");
	const projectClassification = classifications.find(
		(classification) => classification.id === projectType?.classificationId,
	);
	const costCenterClassification = classifications.find(
		(classification) => classification.name === "Cost Center",
	);
	const classification = projectClassification ?? costCenterClassification;

	return {
		...ResponsibilityCenterInitialFormValues,
		category: "Project",
		classificationId: classification?.id ?? "",
		financialType: classification?.name ?? "Cost Center",
		typeId: projectType?.id ?? "",
	};
}
