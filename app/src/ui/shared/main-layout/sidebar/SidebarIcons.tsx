import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	ArrowRightLeft,
	BadgeDollarSign,
	BadgePercent,
	BookOpen,
	Boxes,
	Building2,
	CalendarClock,
	ClipboardList,
	Coins,
	CreditCard,
	FileCheck2,
	FileCog,
	FileSignature,
	FileText,
	Folder,
	Gauge,
	GitBranch,
	Landmark,
	LayoutDashboard,
	ListTree,
	Mail,
	MapPin,
	Package,
	PackageCheck,
	Receipt,
	ReceiptText,
	Ruler,
	Scale,
	Search,
	Settings,
	ShieldCheck,
	ShoppingCart,
	Slice,
	Tags,
	Target,
	UserCog,
	UserCircle,
	Users,
	WalletCards,
	Warehouse,
	Weight,
	WeightTilde,
} from "lucide-react";
import type {
	MainIconName,
	MainNavigationItem,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { joinClasses } from "./utils";

export const MainIcons: Record<MainIconName, LucideIcon> = {
	approval: ShieldCheck,
	announcement: Mail,
	asset: Building2,
	branch: GitBranch,
	billing: CreditCard,
	cashIn: ReceiptText,
	cashOut: WalletCards,
	company: Building2,
	dashboard: LayoutDashboard,
	inventory: Boxes,
	invoice: FileText,
	journal: BookOpen,
	maintenance: Settings,
	payable: CreditCard,
	profile: UserCircle,
	promotion: BadgePercent,
	purchasing: ShoppingCart,
	sales: BadgeDollarSign,
	security: ShieldCheck,
	settings: Settings,
	subscription: WalletCards,
	support: Users,
	user: UserCog,
};

export const SidebarAllowedIcons: Record<string, LucideIcon> = {
	...MainIcons,
	activity: Activity,
	bank: Landmark,
	calendar: CalendarClock,
	clipboard: ClipboardList,
	coins: Coins,
	creditCard: CreditCard,
	fileCheck: FileCheck2,
	fileSignature: FileSignature,
	folder: Folder,
	gauge: Gauge,
	link: FileText,
	mail: Mail,
	mapPin: MapPin,
	package: Package,
	packageCheck: PackageCheck,
	receipt: ReceiptText,
	ruler: Ruler,
	scale: Scale,
	search: Search,
	shieldCheck: ShieldCheck,
	slice: Slice,
	tags: Tags,
	target: Target,
	arrowRightLeft: ArrowRightLeft,
	users: Users,
	accounting: Landmark,
	warehouse: Warehouse,
	weight: Weight,
	weightTilde: WeightTilde,
};

const SidebarItemIcons: Record<string, LucideIcon> = {
	"workspace-overview": Gauge,
	"workspace-dashboard": Gauge,
	"workspace-activity-feed": Activity,
	"workspace-companies": Building2,
	"workspace-company-management": Building2,
	"workspace-branches": GitBranch,
	"workspace-users-management": UserCog,
	"workspace-permissions": ShieldCheck,
	"workspace-audit": Activity,
	"workspace-subscriptions": WalletCards,
	"workspace-billing-and-subscription": WalletCards,
	"workspace-invoices": FileText,
	"workspace-vouchers-and-coupons": BadgePercent,
	"workspace-modules-features": ListTree,
	"workspace-domains-ports": GitBranch,
	"workspace-integrations": Settings,
	"workspace-system-settings": Settings,
	"workspace-security-center": ShieldCheck,
	"workspace-backups": Warehouse,
	"workspace-announcements": Mail,
	"workspace-support-tickets": FileText,
	"workspace-maintenance": Settings,
	"master-dashboard": Gauge,
	"master-announcements": Mail,
	"master-subscriber-management": WalletCards,
	"master-plan-and-packages": Package,
	"master-subscriptions": WalletCards,
	"master-invoices": FileText,
	"master-promotions": BadgePercent,
	"master-subscriber-promotions": BadgePercent,
	"master-audit-logs": Activity,
	"master-support-tickets": FileText,
	"master-system-settings": Settings,
	"workspace-module-financial-management": Landmark,
	"workspace-module-sales-management": BadgeDollarSign,
	"workspace-module-purchasing": ShoppingCart,
	"workspace-module-inventory": Boxes,
	"workspace-module-projects": ClipboardList,
	"workspace-module-human-resources": Users,
	"maintenance-financial": Landmark,
	"maintenance-items": Package,
	"maintenance-warehouse-management": Warehouse,
	"maintenance-charts-of-accounts": Scale,
	"maintenance-bank-masterfile": Landmark,
	"maintenance-default-account": FileCog,
	"system-administration-multi-currency-setup": Coins,
	"transaction-number-setup": ReceiptText,
	"maintenance-discount": BadgePercent,
	"maintenance-discount-management": BadgePercent,
	"maintenance-term": CalendarClock,
	"maintenance-term-management": CalendarClock,
	"maintenance-transaction-type": Receipt,
	"maintenance-payment-type": CreditCard,
	"maintenance-responsibility-center": Target,
	"maintenance-inventory-warehouse": Warehouse,
	"maintenance-warehouse": Warehouse,
	"system-administration-form-signatory": FileSignature,
	"maintenance-item": Package,
	"maintenance-item-sub-category": Tags,
	"maintenance-party-management": Users,
	"maintenance-party": Users,
	"cash-disbursement-voucher": FileCheck2,
	"cash-disbursement-request-payment": FileText,
	"maintenance-user-management": UserCog,
	"maintenance-users": UserCog,
	"maintenance-user-role": Users,
	"maintenance-approver-setup": ShieldCheck,
	"branch-management": GitBranch,
	"maintenance-approval": ShieldCheck,
	"maintenance-audit": Activity,
	"maintenance-mail": Mail,
	"system-transaction-numbering": ReceiptText,
};

export function hasSidebarItemIcon(item: MainNavigationItem) {
	if (item.iconName === null) return false;
	return Boolean(
		(item.iconName && SidebarAllowedIcons[item.iconName]) ||
			SidebarItemIcons[item.key],
	);
}

export function renderSidebarItemIcon(
	item: MainNavigationItem,
	isActive: boolean,
	isAncestorActive: boolean,
) {
	return createElement(getSidebarItemIcon(item), {
		"aria-hidden": true,
		className: joinClasses(
			"h-4 w-4 shrink-0 transition-[color,filter] group-hover:text-skyblue group-hover:drop-shadow-[0_0_8px_rgb(var(--skyblue-rgb)/0.32)]",
			isAncestorActive
				? "text-skyblue/80"
				: isActive
					? "text-skyblue drop-shadow-[0_0_8px_rgb(var(--skyblue-rgb)/0.28)]"
					: "text-darknavy/45",
		),
	});
}

function getSidebarItemIcon(item: MainNavigationItem) {
	if (item.iconName === null) {
		return item.children?.length ? SidebarAllowedIcons.folder : FileText;
	}
	const configuredIcon = item.iconName ? SidebarAllowedIcons[item.iconName] : undefined;
	if (configuredIcon) return configuredIcon;
	const exactIcon = SidebarItemIcons[item.key];

	if (exactIcon) {
		return exactIcon;
	}

	if (item.key.includes("invoice") || item.key.includes("receipt")) {
		return ReceiptText;
	}

	if (item.key.includes("voucher")) {
		return FileCheck2;
	}

	if (item.key.includes("bank")) {
		return Landmark;
	}

	switch (item.accessKey) {
		case "dashboard":
			return LayoutDashboard;
		case "cashReceipt":
			return ReceiptText;
		case "cashDisbursement":
			return WalletCards;
		case "accountsPayable":
			return CreditCard;
		case "generalJournal":
			return BookOpen;
		case "sales":
			return BadgeDollarSign;
		case "inventory":
			return Boxes;
		case "purchasing":
			return ShoppingCart;
		case "canvass":
			return ClipboardList;
		case "fixedAsset":
			return Building2;
		case "maintenance.mail":
			return Mail;
		case "maintenance.users":
			return UserCog;
		case "maintenance.approval":
			return ShieldCheck;
		case "maintenance.audit":
			return Activity;
		case "maintenance.warehouse":
			return Warehouse;
		case "maintenance.item":
			return Package;
		case "maintenance.chartOfAccounts":
			return Scale;
		case "maintenance.party":
			return Users;
		case "maintenance.discount":
			return BadgePercent;
		case "maintenance.term":
			return CalendarClock;
		case "maintenance.transactionType":
			return Receipt;
		case "maintenance.responsibilityCenter":
			return Target;
		default:
			return FileText;
	}
}
