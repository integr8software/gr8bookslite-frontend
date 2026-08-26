export type MasterPlanAndPackageStatus = "Active" | "Draft" | "Inactive";

export type MasterPlanAndPackageScalePeriod = "monthly" | "yearly";

export type MasterPlanAndPackageScaleUnit = "branch" | "user";

export type MasterPlanAndPackageScope = "ALL" | "ONBOARDING" | "ADDITIONAL_COMPANY";

export type MasterPlanAndPackageReductionTier = {
	reductionPercent: number;
	thresholdCount: number;
};

export type MasterPlanAndPackagePricing = {
	monthlyBasePrice: number;
	monthlyPercentOff: number;
	yearlyBasePrice: number;
	yearlyPercentOff: number;
};

export type MasterPlanAndPackageScaleRule = {
	addOnPrice: number;
	includedFreeCount: number;
	reductionTiers: MasterPlanAndPackageReductionTier[];
};

export type MasterPlanAndPackageScaleRules = Record<
	MasterPlanAndPackageScaleUnit,
	MasterPlanAndPackageScaleRule
>;

export type MasterPlanAndPackageScalePricing = MasterPlanAndPackageScaleRules;

export type MasterPlanAndPackageFeatureOption = {
	description: string;
	id: string;
	name: string;
	section: string;
};

export type MasterPlanAndPackageRecord = {
	code: string;
	description: string;
	featureIds: string[];
	id: string;
	name: string;
	pricing: MasterPlanAndPackagePricing;
	scalePricing: MasterPlanAndPackageScalePricing;
	scope: MasterPlanAndPackageScope;
	status: MasterPlanAndPackageStatus;
	trialDays: number;
};

export type MasterPlanAndPackageFormValues = {
	code?: string;
	description: string;
	featureIds: string[];
	id?: string;
	branchAddOnPrice?: number;
	branchIncludedFree?: number;
	branchReductionTiers?: MasterPlanAndPackageReductionTier[];
	monthlyBasePrice: number;
	monthlyPercentOff: number;
	name: string;
	scope: MasterPlanAndPackageScope;
	scopes: MasterPlanAndPackageScope[];
	status: MasterPlanAndPackageStatus;
	trialDays: number;
	userAddOnPrice?: number;
	userIncludedFree?: number;
	userReductionTiers?: MasterPlanAndPackageReductionTier[];
	yearlyBasePrice: number;
	yearlyPercentOff: number;
};

export type MasterPlanAndPackageFormErrors = Partial<
	Record<keyof MasterPlanAndPackageFormValues, string>
>;

export type MasterPlanAndPackageTableColumnKey =
	| "name"
	| "status"
	| "pricing";

export type MasterPlanAndPackageDetailsPageProps = {
	recordId: string;
};

export type MasterPlanAndPackageFormPageProps = {
	mode: "add" | "edit";
	recordId?: string;
};

export type MasterPlanAndPackageTableRowProps = {
	row: import("@tanstack/react-table").Row<MasterPlanAndPackageRecord>;
	onToggleStatus: (recordId: string) => void;
};

export type ScaleRuleValues = {
	addOnPrice: number;
	includedFree: number;
	reductionTiers: MasterPlanAndPackageReductionTier[];
};

export type ScaleRuleSectionProps = ScaleRuleValues & {
	errors: Partial<Record<keyof ScaleRuleValues, string>>;
	icon: import("lucide-react").LucideIcon;
	unitLabel: string;
	onUpdate: (values: ScaleRuleValues) => void;
};

export type NumberFieldConfig = {
	error?: string;
	value: number;
	onChange: (value: number) => void;
};

