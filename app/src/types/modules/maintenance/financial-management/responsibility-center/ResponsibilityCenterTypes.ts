export type ResponsibilityCenterStatus = "Active" | "Inactive";

export type ResponsibilityCenterType =
	| "Cost Center"
	| "Profit Center"
	| "Revenue Center"
	| "Investment Center";

export type ResponsibilityCenter = {
	id: string;
	code: string;
	name: string;
	type: ResponsibilityCenterType;
	manager: string;
	parentId?: string;
	status: ResponsibilityCenterStatus;
	description?: string;
	createdAt: string;
	updatedAt: string;
};

export type ResponsibilityCenterActionMode = "add" | "edit" | "view";

export type ResponsibilityCenterFormValues = {
	code: string;
	name: string;
	type: ResponsibilityCenterType;
	manager: string;
	parentId: string;
	status: ResponsibilityCenterStatus;
	description: string;
};

export type ResponsibilityCenterFormErrors = Partial<
	Record<keyof ResponsibilityCenterFormValues, string>
>;
