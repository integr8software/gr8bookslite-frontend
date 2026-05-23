import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	BadgeDollarSign,
	BadgePercent,
	BarChart3,
	BookOpen,
	Boxes,
	Building2,
	CalendarClock,
	ClipboardList,
	Coins,
	CreditCard,
	FileBarChart,
	FileCheck2,
	FileText,
	Gauge,
	GitBranch,
	Landmark,
	LayoutDashboard,
	ListTree,
	Mail,
	Package,
	Receipt,
	ReceiptText,
	Settings,
	ShieldCheck,
	ShoppingCart,
	Tags,
	UserCog,
	UserCircle,
	Users,
	WalletCards,
	Warehouse,
} from "lucide-react";
import type {
	MainIconName,
	MainNavigationItem,
} from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import { joinClasses } from "./utils";

export const MainIcons: Record<MainIconName, LucideIcon> = {
	approval: ShieldCheck,
	asset: Building2,
	branch: GitBranch,
	billing: CreditCard,
	cashIn: ReceiptText,
	cashOut: WalletCards,
	dashboard: LayoutDashboard,
	inventory: Boxes,
	journal: BookOpen,
	maintenance: Settings,
	payable: CreditCard,
	profile: UserCircle,
	purchasing: ShoppingCart,
	reports: BarChart3,
	sales: BadgeDollarSign,
	security: ShieldCheck,
	settings: Settings,
};

const SidebarItemIcons: Record<string, LucideIcon> = {
	"workspace-overview": Gauge,
	"workspace-dashboard": Gauge,
	"workspace-activity-feed": Activity,
	"workspace-companies": Building2,
	"workspace-branches": GitBranch,
	"workspace-users-roles": UserCog,
	"workspace-permissions": ShieldCheck,
	"workspace-audit": Activity,
	"workspace-plans-packages": Package,
	"workspace-subscriptions": WalletCards,
	"workspace-invoices": FileText,
	"workspace-coupons-promotions": BadgePercent,
	"workspace-modules-features": ListTree,
	"workspace-domains-ports": GitBranch,
	"workspace-integrations": Settings,
	"workspace-system-settings": Settings,
	"workspace-system-logs": FileText,
	"workspace-security-center": ShieldCheck,
	"workspace-backups": Warehouse,
	"workspace-announcements": Mail,
	"workspace-support-tickets": FileText,
	"workspace-maintenance": Settings,
	"workspace-company-settings": Building2,
	"workspace-payment-methods": CreditCard,
	"workspace-module-financial-management": Landmark,
	"workspace-module-sales-management": BadgeDollarSign,
	"workspace-module-purchasing": ShoppingCart,
	"workspace-module-inventory": Boxes,
	"workspace-module-projects": ClipboardList,
	"workspace-module-human-resources": Users,
	"workspace-module-reports-analytics": FileBarChart,
	"maintenance-financial": Landmark,
	"maintenance-item-management": Package,
	"maintenance-warehouse-management": Warehouse,
	"maintenance-charts-of-accounts": ListTree,
	"maintenance-currency": Coins,
	"maintenance-discount": BadgePercent,
	"maintenance-term": CalendarClock,
	"maintenance-transaction-type": Receipt,
	"maintenance-inventory-warehouse": Warehouse,
	"maintenance-warehouse": Warehouse,
	"maintenance-item": Package,
	"maintenance-item-category": Tags,
	"maintenance-item-sub-category": Tags,
	"maintenance-item-type": Package,
	"maintenance-item-sub-type": Package,
	"maintenance-items": Package,
	"maintenance-item-subcategory": Tags,
	"maintenance-item-subtype": Package,
	"maintenance-party-management": Users,
	"maintenance-party": Users,
	"cash-disbursement-voucher": FileCheck2,
	"cash-disbursement-request-payment": FileText,
	"purchasing-canvass-form": ClipboardList,
	"reports-maintenance": Settings,
	"reports-financial": FileBarChart,
	"reports-books-of-accounts": BookOpen,
	"reports-general-ledger": BookOpen,
	"reports-journal-ledger": BookOpen,
	"reports-trial-balance": FileBarChart,
	"reports-balance-sheet": FileBarChart,
	"reports-income-statement": FileBarChart,
	"reports-cash-flow": FileBarChart,
	"reports-accounts-receivable": CreditCard,
	"reports-ar-aging": CalendarClock,
	"reports-ar-statement": FileText,
	"reports-inventory": Boxes,
	"reports-inventory-audit": Activity,
	"reports-inventory-item-query": Package,
	"reports-inventory-stock-movement": Warehouse,
	"reports-inventory-valuation": FileBarChart,
	"reports-bir": FileText,
	"reports-bir-vat-relief": FileText,
	"reports-bir-alpha-list": FileText,
	"maintenance-user-management": UserCog,
	"maintenance-users": UserCog,
	"maintenance-user-role": Users,
	"branch-management": GitBranch,
	"maintenance-approval": ShieldCheck,
	"maintenance-audit": Activity,
	"maintenance-mail": Mail,
	"system-transaction-numbering": ReceiptText,
};

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

	if (item.key.includes("report")) {
		return FileBarChart;
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
		case "maintenance.party":
			return Users;
		case "maintenance.discount":
			return BadgePercent;
		case "reports.accounting":
		case "reports.inventory":
			return FileBarChart;
		default:
			return FileText;
	}
}
