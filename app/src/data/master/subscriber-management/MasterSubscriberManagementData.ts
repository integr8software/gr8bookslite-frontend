import {
	Building2,
	CheckCircle2,
	CirclePause,
	CircleX,
	type LucideIcon,
} from "lucide-react";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import type {
	MasterSubscriberManagementActivityRecord,
	MasterSubscriberManagementBranchFormValues,
	MasterSubscriberManagementBranchRecord,
	MasterSubscriberManagementCompanyRecord,
	MasterSubscriberManagementFormValues,
	MasterSubscriberManagementInvoiceRecord,
	MasterSubscriberManagementListRecord,
	MasterSubscriberManagementStatus,
	MasterSubscriberManagementStorageBranchRecord,
	MasterSubscriberManagementStorageBreakdownRecord,
	MasterSubscriberManagementSummaryMetric,
	MasterSubscriberManagementUserRecord,
} from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";

const MasterSubscriberManagementCompanyStorageTotalGb = 2;
const MasterSubscriberManagementCompanyStorageUsedGb = 0.9;
const MasterSubscriberManagementCompanyStorageAvailableGb =
	MasterSubscriberManagementCompanyStorageTotalGb -
	MasterSubscriberManagementCompanyStorageUsedGb;

export const MasterSubscriberManagementSubscribers: MasterSubscriberManagementListRecord[] =
	[
		createSubscriber({
			branches: 18,
			companies: 5,
			contactNumber: "+1 555-123-4567",
			dateRegistered: "2024-05-12",
			email: "abc@corporation.com",
			iconTone: "blue",
			id: "sub-abc-corporation",
			initials: "AC",
			lastLoginDate: "May 14, 2024",
			lastLoginTime: "02:15 PM",
			name: "ABC Corporation",
			registeredAt: "May 12, 2024 10:30 AM",
			status: "Active",
			subscriberId: "SUB-000125",
			updatedAt: "May 30, 2024 11:45 AM",
			updatedBy: "Jane Smith",
			users: 125,
		}),
		createSubscriber({
			branches: 8,
			companies: 3,
			contactNumber: "+1 555-987-6543",
			dateRegistered: "2024-05-10",
			email: "admin@xyzsolutions.com",
			iconTone: "orange",
			id: "sub-xyz-solutions",
			initials: "XS",
			lastLoginDate: "May 14, 2024",
			lastLoginTime: "09:20 AM",
			name: "XYZ Solutions Inc.",
			registeredAt: "May 10, 2024 09:05 AM",
			status: "Active",
			subscriberId: "SUB-000126",
			users: 64,
		}),
		createSubscriber({
			branches: 12,
			companies: 4,
			contactNumber: "+1 555-456-7890",
			dateRegistered: "2024-05-08",
			email: "contact@globaltech.com",
			iconTone: "cyan",
			id: "sub-globaltech-industries",
			initials: "GI",
			lastLoginDate: "May 13, 2024",
			lastLoginTime: "11:42 AM",
			name: "GlobalTech Industries",
			registeredAt: "May 8, 2024 02:20 PM",
			status: "Active",
			subscriberId: "SUB-000127",
			users: 89,
		}),
		createSubscriber({
			branches: 6,
			companies: 2,
			contactNumber: "+1 555-321-7654",
			dateRegistered: "2024-05-05",
			email: "info@nextgen.com",
			iconTone: "orange",
			id: "sub-nextgen-systems",
			initials: "NS",
			lastLoginDate: "May 12, 2024",
			lastLoginTime: "04:33 PM",
			name: "NextGen Systems",
			registeredAt: "May 5, 2024 12:45 PM",
			status: "Active",
			subscriberId: "SUB-000128",
			users: 42,
		}),
		createSubscriber({
			branches: 4,
			companies: 2,
			contactNumber: "+1 555-654-0987",
			dateRegistered: "2024-05-03",
			email: "hello@brightfuture.com",
			iconTone: "blue",
			id: "sub-brightfuture",
			initials: "BL",
			lastLoginDate: "May 6, 2024",
			lastLoginTime: "10:10 AM",
			name: "BrightFuture Ltd.",
			registeredAt: "May 3, 2024 08:30 AM",
			status: "Suspended",
			subscriberId: "SUB-000129",
			users: 28,
		}),
		createSubscriber({
			branches: 9,
			companies: 3,
			contactNumber: "+1 555-789-0123",
			dateRegistered: "2024-04-30",
			email: "support@innovatech.com",
			iconTone: "rose",
			id: "sub-innovatech-enterprises",
			initials: "IE",
			lastLoginDate: "May 11, 2024",
			lastLoginTime: "03:18 PM",
			name: "Innovatech Enterprises",
			registeredAt: "Apr 30, 2024 03:50 PM",
			status: "Active",
			subscriberId: "SUB-000130",
			users: 57,
		}),
		createSubscriber({
			branches: 2,
			companies: 1,
			contactNumber: "+1 555-147-2580",
			dateRegistered: "2024-04-28",
			email: "admin@alpha.com",
			iconTone: "slate",
			id: "sub-alpha-business-group",
			initials: "AB",
			lastLoginDate: "Apr 30, 2024",
			lastLoginTime: "09:00 AM",
			name: "Alpha Business Group",
			registeredAt: "Apr 28, 2024 01:10 PM",
			status: "Inactive",
			subscriberId: "SUB-000131",
			users: 11,
		}),
		createSubscriber({
			branches: 7,
			companies: 2,
			contactNumber: "+1 555-369-8520",
			dateRegistered: "2024-04-25",
			email: "info@primedigital.com",
			iconTone: "purple",
			id: "sub-prime-digital-services",
			initials: "PD",
			lastLoginDate: "May 10, 2024",
			lastLoginTime: "01:25 PM",
			name: "Prime Digital Services",
			registeredAt: "Apr 25, 2024 11:15 AM",
			status: "Active",
			subscriberId: "SUB-000132",
			users: 33,
		}),
		createSubscriber({
			branches: 11,
			companies: 3,
			contactNumber: "+1 555-222-4110",
			dateRegistered: "2024-04-23",
			email: "ops@northstar.com",
			iconTone: "cyan",
			id: "sub-northstar-holdings",
			initials: "NH",
			lastLoginDate: "May 9, 2024",
			lastLoginTime: "12:22 PM",
			name: "Northstar Holdings",
			registeredAt: "Apr 23, 2024 05:00 PM",
			status: "Active",
			subscriberId: "SUB-000133",
			users: 74,
		}),
		createSubscriber({
			branches: 5,
			companies: 2,
			contactNumber: "+1 555-875-2300",
			dateRegistered: "2024-04-21",
			email: "admin@urbanline.com",
			iconTone: "orange",
			id: "sub-urbanline-retail",
			initials: "UR",
			lastLoginDate: "May 8, 2024",
			lastLoginTime: "02:45 PM",
			name: "UrbanLine Retail",
			registeredAt: "Apr 21, 2024 10:35 AM",
			status: "Active",
			subscriberId: "SUB-000134",
			users: 39,
		}),
		createSubscriber({
			branches: 10,
			companies: 4,
			contactNumber: "+1 555-219-9981",
			dateRegistered: "2024-04-19",
			email: "team@quantumworks.com",
			iconTone: "purple",
			id: "sub-quantumworks",
			initials: "QW",
			lastLoginDate: "May 7, 2024",
			lastLoginTime: "08:51 AM",
			name: "QuantumWorks",
			registeredAt: "Apr 19, 2024 04:30 PM",
			status: "Active",
			subscriberId: "SUB-000135",
			users: 68,
		}),
		createSubscriber({
			branches: 14,
			companies: 4,
			contactNumber: "+1 555-811-4401",
			dateRegistered: "2024-04-17",
			email: "billing@evergreen.com",
			iconTone: "blue",
			id: "sub-evergreen-market",
			initials: "EM",
			lastLoginDate: "May 6, 2024",
			lastLoginTime: "09:48 AM",
			name: "Evergreen Market",
			registeredAt: "Apr 17, 2024 09:25 AM",
			status: "Active",
			subscriberId: "SUB-000136",
			users: 92,
		}),
		createSubscriber({
			branches: 3,
			companies: 1,
			contactNumber: "+1 555-421-1182",
			dateRegistered: "2024-04-15",
			email: "care@silverpeak.com",
			iconTone: "slate",
			id: "sub-silverpeak-services",
			initials: "SS",
			lastLoginDate: "May 5, 2024",
			lastLoginTime: "04:10 PM",
			name: "SilverPeak Services",
			registeredAt: "Apr 15, 2024 01:18 PM",
			status: "Active",
			subscriberId: "SUB-000137",
			users: 19,
		}),
		createSubscriber({
			branches: 16,
			companies: 5,
			contactNumber: "+1 555-720-1120",
			dateRegistered: "2024-04-13",
			email: "admin@helixpartners.com",
			iconTone: "rose",
			id: "sub-helix-partners",
			initials: "HP",
			lastLoginDate: "May 4, 2024",
			lastLoginTime: "01:02 PM",
			name: "Helix Partners",
			registeredAt: "Apr 13, 2024 02:55 PM",
			status: "Active",
			subscriberId: "SUB-000138",
			users: 101,
		}),
		createSubscriber({
			branches: 6,
			companies: 2,
			contactNumber: "+1 555-602-0088",
			dateRegistered: "2024-04-11",
			email: "info@lumenfleet.com",
			iconTone: "cyan",
			id: "sub-lumenfleet",
			initials: "LF",
			lastLoginDate: "May 3, 2024",
			lastLoginTime: "11:30 AM",
			name: "LumenFleet",
			registeredAt: "Apr 11, 2024 07:42 AM",
			status: "Suspended",
			subscriberId: "SUB-000139",
			users: 44,
		}),
		createSubscriber({
			branches: 9,
			companies: 3,
			contactNumber: "+1 555-122-6002",
			dateRegistered: "2024-04-09",
			email: "hello@stridepoint.com",
			iconTone: "orange",
			id: "sub-stridepoint",
			initials: "SP",
			lastLoginDate: "May 2, 2024",
			lastLoginTime: "10:46 AM",
			name: "StridePoint",
			registeredAt: "Apr 9, 2024 10:12 AM",
			status: "Active",
			subscriberId: "SUB-000140",
			users: 58,
		}),
		createSubscriber({
			branches: 12,
			companies: 3,
			contactNumber: "+1 555-675-3010",
			dateRegistered: "2024-04-07",
			email: "owner@cobaltgrid.com",
			iconTone: "blue",
			id: "sub-cobaltgrid",
			initials: "CG",
			lastLoginDate: "May 1, 2024",
			lastLoginTime: "05:20 PM",
			name: "CobaltGrid",
			registeredAt: "Apr 7, 2024 03:45 PM",
			status: "Active",
			subscriberId: "SUB-000141",
			users: 73,
		}),
		createSubscriber({
			branches: 4,
			companies: 1,
			contactNumber: "+1 555-460-9022",
			dateRegistered: "2024-04-05",
			email: "admin@maplecore.com",
			iconTone: "purple",
			id: "sub-maplecore",
			initials: "MC",
			lastLoginDate: "Apr 30, 2024",
			lastLoginTime: "02:05 PM",
			name: "MapleCore",
			registeredAt: "Apr 5, 2024 08:15 AM",
			status: "Active",
			subscriberId: "SUB-000142",
			users: 27,
		}),
		createSubscriber({
			branches: 15,
			companies: 5,
			contactNumber: "+1 555-319-4400",
			dateRegistered: "2024-04-03",
			email: "contact@vectorlane.com",
			iconTone: "cyan",
			id: "sub-vectorlane",
			initials: "VL",
			lastLoginDate: "Apr 29, 2024",
			lastLoginTime: "03:40 PM",
			name: "VectorLane",
			registeredAt: "Apr 3, 2024 11:05 AM",
			status: "Active",
			subscriberId: "SUB-000143",
			users: 96,
		}),
		createSubscriber({
			branches: 8,
			companies: 2,
			contactNumber: "+1 555-281-7710",
			dateRegistered: "2024-04-01",
			email: "ops@meridianlabs.com",
			iconTone: "orange",
			id: "sub-meridian-labs",
			initials: "ML",
			lastLoginDate: "Apr 28, 2024",
			lastLoginTime: "09:15 AM",
			name: "Meridian Labs",
			registeredAt: "Apr 1, 2024 04:00 PM",
			status: "Active",
			subscriberId: "SUB-000144",
			users: 49,
		}),
		createSubscriber({
			branches: 6,
			companies: 3,
			contactNumber: "+1 555-900-0145",
			dateRegistered: "2024-03-29",
			email: "admin@testsubscriber.com",
			iconTone: "rose",
			id: "sub-harborstone",
			initials: "TS",
			lastLoginDate: "Apr 27, 2024",
			lastLoginTime: "12:12 PM",
			name: "Test Subscriber",
			registeredAt: "Mar 29, 2024 12:40 PM",
			status: "Active",
			subscriberId: "SUB-000145",
			users: 25,
		}),
		createSubscriber({
			branches: 7,
			companies: 2,
			contactNumber: "+1 555-772-8891",
			dateRegistered: "2024-03-27",
			email: "hello@nexora.com",
			iconTone: "blue",
			id: "sub-nexora",
			initials: "NX",
			lastLoginDate: "Apr 26, 2024",
			lastLoginTime: "01:35 PM",
			name: "Nexora",
			registeredAt: "Mar 27, 2024 06:30 PM",
			status: "Active",
			subscriberId: "SUB-000146",
			users: 41,
		}),
		createSubscriber({
			branches: 11,
			companies: 3,
			contactNumber: "+1 555-193-7400",
			dateRegistered: "2024-03-24",
			email: "team@openforge.com",
			iconTone: "purple",
			id: "sub-openforge",
			initials: "OF",
			lastLoginDate: "Apr 25, 2024",
			lastLoginTime: "04:44 PM",
			name: "OpenForge",
			registeredAt: "Mar 24, 2024 09:08 AM",
			status: "Active",
			subscriberId: "SUB-000147",
			users: 61,
		}),
		createSubscriber({
			branches: 5,
			companies: 1,
			contactNumber: "+1 555-830-2711",
			dateRegistered: "2024-03-20",
			email: "ops@radiantworks.com",
			iconTone: "cyan",
			id: "sub-radiantworks",
			initials: "RW",
			lastLoginDate: "Apr 24, 2024",
			lastLoginTime: "10:00 AM",
			name: "RadiantWorks",
			registeredAt: "Mar 20, 2024 02:30 PM",
			status: "Active",
			subscriberId: "SUB-000148",
			users: 38,
		}),
	];

export const MasterSubscriberManagementCompanies: MasterSubscriberManagementCompanyRecord[] =
	[
		{
			addressLines: [
				"123 Retail Avenue, Suite 400,",
				"Midtown District, New York, NY 10001,",
				"United States",
			],
			amount: "$499.00 / month",
			billingCycle: "Monthly",
			branchCount: 5,
			code: "CMP-00001",
			contactEmail: "info@abcretail.com",
			contactNumber: "+63 917 123 4567",
			dateAdded: "May 12, 2024",
			id: "cmp-abc-retail",
			industry: "Retail",
			name: "ABC Retail Inc.",
			nextRenewalDate: "May 12, 2025",
			nextRenewalHelper: "in 348 days",
			paymentStatus: "Paid",
			planDescription:
				"Combined accounting and inventory coverage for companies that need full operational workflows.",
			planName: "Accounting + Inventory",
			planStartDate: "May 12, 2024",
			reportEndDate: "2024-12-31",
			reportStartDate: "2024-01-01",
			status: "Active",
			storageAvailableGb: MasterSubscriberManagementCompanyStorageAvailableGb,
			storageTotalGb: MasterSubscriberManagementCompanyStorageTotalGb,
			storageUsedGb: MasterSubscriberManagementCompanyStorageUsedGb,
			subscriberId: "sub-abc-corporation",
			taxpayerType: "non-individual",
			tin: "123-456-789-000",
			userCount: 35,
			website: "www.abcretail.com",
		},
		createCompany("cmp-xyz-solutions", "XYZ Solutions Inc.", 3, 22),
		createCompany("cmp-globaltech", "GlobalTech Industries", 4, 28),
		createCompany("cmp-nextgen", "NextGen Systems", 2, 15),
		createCompany("cmp-innovatech", "Innovatech Enterprises", 4, 25),
		createCompany(
			"cmp-test-subscriber-one",
			"Test Company One",
			1,
			5,
			"sub-harborstone",
		),
		createCompany(
			"cmp-test-subscriber-two",
			"Test Company Two",
			2,
			8,
			"sub-harborstone",
		),
		createCompany(
			"cmp-test-subscriber-three",
			"Test Company Three",
			3,
			12,
			"sub-harborstone",
		),
	];

export const MasterSubscriberManagementBranches: MasterSubscriberManagementBranchRecord[] =
	[
		{
			addedOn: "May 20, 2024",
			address: "123 Main Street, Suite 100, New York, NY 10001, USA",
			contactNumber: "+63 917 123 4501",
			email: "head.office@abcretail.com",
			id: "br-abc-retail-head-office",
			isMain: true,
			linkedMainBranchId: "",
			name: "ABC Retail Inc.",
			status: "Active",
			tin: "123-456-789-000",
			tone: "blue",
			type: "Head Office",
			users: 10,
		},
		{
			addedOn: "May 21, 2024",
			address: "456 Market Avenue, Floor 2, New York, NY 10016, USA",
			contactNumber: "+63 917 123 4502",
			email: "downtown@abcretail.com",
			id: "br-abc-downtown",
			isMain: false,
			linkedMainBranchId: "br-abc-retail-head-office",
			name: "ABC Downtown",
			status: "Active",
			tin: "123-456-789-001",
			tone: "cyan",
			type: "Satellite",
			users: 8,
		},
		{
			addedOn: "May 22, 2024",
			address: "789 5th Avenue, Suite 300, New York, NY 10022, USA",
			contactNumber: "+63 917 123 4503",
			email: "midtown@abcretail.com",
			id: "br-abc-midtown",
			isMain: false,
			linkedMainBranchId: "br-abc-retail-head-office",
			name: "ABC Midtown",
			status: "Active",
			tin: "123-456-789-002",
			tone: "cyan",
			type: "Satellite",
			users: 6,
		},
		{
			addedOn: "May 23, 2024",
			address: "321 Atlantic Avenue, Brooklyn, NY 11201, USA",
			contactNumber: "+63 917 123 4504",
			email: "brooklyn@abcretail.com",
			id: "br-abc-brooklyn",
			isMain: false,
			linkedMainBranchId: "br-abc-retail-head-office",
			name: "ABC Brooklyn",
			status: "Inactive",
			tin: "123-456-789-003",
			tone: "rose",
			type: "Satellite",
			users: 7,
		},
		{
			addedOn: "May 24, 2024",
			address: "654 Queens Blvd, Suite 200, Queens, NY 11377, USA",
			contactNumber: "+63 917 123 4505",
			email: "queens@abcretail.com",
			id: "br-abc-queens",
			isMain: false,
			linkedMainBranchId: "br-abc-retail-head-office",
			name: "ABC Queens",
			status: "Active",
			tin: "123-456-789-004",
			tone: "purple",
			type: "Satellite",
			users: 4,
		},
	];

export const MasterSubscriberManagementUsers: MasterSubscriberManagementUserRecord[] =
	[
		{
			addedOn: "May 12, 2024",
			avatarTone: "orange",
			branchAccess: ["Head Office", "ABC Downtown", "+2 more"],
			email: "michael.johnson@abcretail.com",
			id: "usr-michael-johnson",
			initials: "MJ",
			lastActiveDate: "May 20, 2024",
			lastActiveTime: "10:24 AM",
			name: "Michael Johnson",
			phone: "+1 (212) 555-0123",
			status: "Active",
		},
		{
			addedOn: "May 12, 2024",
			avatarTone: "rose",
			branchAccess: ["ABC Downtown", "ABC Midtown"],
			email: "sarah.williams@abcretail.com",
			id: "usr-sarah-williams",
			initials: "SW",
			lastActiveDate: "May 21, 2024",
			lastActiveTime: "09:15 AM",
			name: "Sarah Williams",
			phone: "+1 (212) 555-0187",
			status: "Active",
		},
		{
			addedOn: "May 12, 2024",
			avatarTone: "orange",
			branchAccess: ["ABC Midtown", "Head Office", "ABC Brooklyn"],
			email: "david.brown@abcretail.com",
			id: "usr-david-brown",
			initials: "DB",
			lastActiveDate: "May 22, 2024",
			lastActiveTime: "02:35 PM",
			name: "David Brown",
			phone: "+1 (212) 555-0149",
			status: "Active",
		},
		{
			addedOn: "May 13, 2024",
			avatarTone: "rose",
			branchAccess: ["ABC Brooklyn"],
			email: "olivia.davis@abcretail.com",
			id: "usr-olivia-davis",
			initials: "OD",
			lastActiveDate: "May 10, 2024",
			lastActiveTime: "11:20 AM",
			name: "Olivia Davis",
			phone: "+1 (212) 555-0194",
			status: "Inactive",
		},
		{
			addedOn: "May 24, 2024",
			avatarTone: "purple",
			branchAccess: ["ABC Queens", "Head Office"],
			email: "james.wilson@abcretail.com",
			id: "usr-james-wilson",
			initials: "JW",
			lastActiveDate: "-",
			lastActiveTime: "",
			name: "James Wilson",
			phone: "+1 (212) 555-0177",
			status: "Invited",
		},
	];

export const MasterSubscriberManagementInvoices: MasterSubscriberManagementInvoiceRecord[] =
	[
		createInvoice("INV-2024-00045", "May 12, 2024", "May 12, 2024 - Jun 12, 2024"),
		createInvoice("INV-2024-00044", "Apr 12, 2024", "Apr 12, 2024 - May 12, 2024"),
		createInvoice("INV-2024-00043", "Mar 12, 2024", "Mar 12, 2024 - Apr 12, 2024"),
		createInvoice("INV-2024-00042", "Feb 12, 2024", "Feb 12, 2024 - Mar 12, 2024"),
		createInvoice("INV-2024-00041", "Jan 12, 2024", "Jan 12, 2024 - Feb 12, 2024"),
		createInvoice("INV-2023-00040", "Dec 12, 2023", "Dec 12, 2023 - Jan 12, 2024"),
	];

export const MasterSubscriberManagementActivities: MasterSubscriberManagementActivityRecord[] =
	[
		{
			date: "May 20, 2024 10:30 AM",
			id: "activity-branch",
			label: 'Branch "ABC Downtown" was added',
			tone: "emerald",
		},
		{
			date: "May 18, 2024 02:15 PM",
			id: "activity-users",
			label: "5 new users were added to this company",
			tone: "purple",
		},
		{
			date: "May 12, 2024 09:00 AM",
			id: "activity-plan",
			label: "Plan changed to Accounting + Inventory",
			tone: "orange",
		},
		{
			date: "May 12, 2024 08:45 AM",
			id: "activity-company",
			label: "Company created",
			tone: "emerald",
		},
	];

export const MasterSubscriberManagementStorageBreakdown: MasterSubscriberManagementStorageBreakdownRecord[] =
	[
		{
			category: "Documents",
			colorClassName: "bg-skyblue",
			iconClassName: "text-skyblue",
			percentage: 41.3,
			used: "0.37 GB",
		},
		{
			category: "Images",
			colorClassName: "bg-emerald-500",
			iconClassName: "text-emerald-500",
			percentage: 27.6,
			used: "0.25 GB",
		},
		{
			category: "Reports",
			colorClassName: "bg-purple-500",
			iconClassName: "text-purple-500",
			percentage: 15.1,
			used: "0.14 GB",
		},
		{
			category: "Backups",
			colorClassName: "bg-orange-500",
			iconClassName: "text-orange-500",
			percentage: 10.2,
			used: "0.09 GB",
		},
		{
			category: "Other",
			colorClassName: "bg-slate-400",
			iconClassName: "text-slate-400",
			percentage: 5.8,
			used: "0.05 GB",
		},
	];

export const MasterSubscriberManagementStorageBranches: MasterSubscriberManagementStorageBranchRecord[] =
	[
		{
			address: "123 Main St., New York, NY",
			branch: "Head Office",
			files: "8,245",
			id: "storage-head-office",
			lastActivity: "May 20, 2024 10:24 AM",
			percentage: 40.4,
			tone: "blue",
			used: "0.36 GB",
		},
		{
			address: "456 Market Ave., New York, NY",
			branch: "ABC Downtown",
			files: "5,674",
			id: "storage-downtown",
			lastActivity: "May 21, 2024 09:15 AM",
			percentage: 28.2,
			tone: "emerald",
			used: "0.25 GB",
		},
		{
			address: "789 5th Ave., New York, NY",
			branch: "ABC Midtown",
			files: "3,189",
			id: "storage-midtown",
			lastActivity: "May 22, 2024 02:35 PM",
			percentage: 16.9,
			tone: "purple",
			used: "0.15 GB",
		},
		{
			address: "321 Atlantic Ave., Brooklyn, NY",
			branch: "ABC Brooklyn",
			files: "1,924",
			id: "storage-brooklyn",
			lastActivity: "May 10, 2024 11:20 AM",
			percentage: 10,
			tone: "orange",
			used: "0.09 GB",
		},
		{
			address: "654 Queens Blvd., Queens, NY",
			branch: "ABC Queens",
			files: "892",
			id: "storage-queens",
			lastActivity: "May 24, 2024 08:45 AM",
			percentage: 4.5,
			tone: "slate",
			used: "0.04 GB",
		},
	];

export const InitialMasterSubscriberManagementFormValues: MasterSubscriberManagementFormValues =
	{
		contactNumber: "",
		email: "",
		name: "",
		status: "Active",
	};

export const InitialMasterSubscriberManagementBranchFormValues: MasterSubscriberManagementBranchFormValues =
	{
		address: "",
		contactNumber: "",
		email: "",
		isMain: true,
		linkedMainBranchId: "",
		name: "",
		status: "Active",
		tin: "",
		type: "Head Office",
	};

export function createMasterSubscriberManagementSummaryMetrics(): MasterSubscriberManagementSummaryMetric[] {
	const counts = MasterSubscriberManagementSubscribers.reduce(
		(summary, subscriber) => {
			summary.total += 1;
			if (subscriber.status === "Active") {
				summary.active += 1;
			}
			if (subscriber.status === "Suspended") {
				summary.suspended += 1;
			}
			if (subscriber.status === "Inactive") {
				summary.inactive += 1;
			}
			return summary;
		},
		{ active: 0, inactive: 0, suspended: 0, total: 0 },
	);

	return [
		{
			helper: "All subscribers in the system",
			icon: Building2,
			label: "Total Subscribers",
			tone: "blue",
			value: counts.total,
		},
		{
			helper: "Active and in good standing",
			icon: CheckCircle2,
			label: "Active Subscribers",
			tone: "emerald",
			value: counts.active,
		},
		{
			helper: "Temporarily suspended",
			icon: CirclePause,
			label: "Suspended Subscribers",
			tone: "amber",
			value: counts.suspended,
		},
		{
			helper: "Inactive subscribers",
			icon: CircleX,
			label: "Inactive Subscribers",
			tone: "rose",
			value: counts.inactive,
		},
	];
}

export function createMasterSubscriberManagementFormValues(
	record: MasterSubscriberManagementListRecord,
): MasterSubscriberManagementFormValues {
	return {
		contactNumber: record.contactNumber,
		email: record.email,
		name: record.name,
		status: record.status,
	};
}

export function createMasterSubscriberManagementBranchFormValues(
	company: MasterSubscriberManagementCompanyRecord,
	branches: MasterSubscriberManagementBranchRecord[],
	branch?: MasterSubscriberManagementBranchRecord,
): MasterSubscriberManagementBranchFormValues {
	if (branch) {
		return {
			address: branch.address,
			contactNumber: branch.contactNumber,
			email: branch.email,
			isMain: branch.isMain,
			linkedMainBranchId: branch.linkedMainBranchId,
			name: branch.name,
			status: branch.status,
			tin: FormatTinNumber(branch.tin),
			type: branch.type,
		};
	}

	const firstMainBranch = branches.find((currentBranch) => currentBranch.isMain);

	return {
		...InitialMasterSubscriberManagementBranchFormValues,
		linkedMainBranchId: firstMainBranch?.id ?? "",
		tin: FormatTinNumber(company.tin),
	};
}

export function getMasterSubscriberManagementSubscriber(recordId?: string) {
	return (
		MasterSubscriberManagementSubscribers.find(
			(subscriber) => subscriber.id === recordId,
		) ?? MasterSubscriberManagementSubscribers[0]
	);
}

export function getMasterSubscriberManagementCompaniesForSubscriber(
	recordId?: string,
) {
	const subscriber = getMasterSubscriberManagementSubscriber(recordId);
	const companies = MasterSubscriberManagementCompanies.filter(
		(company) => company.subscriberId === subscriber.id,
	);

	return companies.length > 0
		? companies
		: [createFallbackCompany(subscriber)];
}

export function getMasterSubscriberManagementCompany(
	recordId?: string,
	companyId?: string,
) {
	const companies = getMasterSubscriberManagementCompaniesForSubscriber(recordId);

	return (
		companies.find((company) => company.id === companyId) ??
		companies[0]
	);
}

export function getStatusIcon(status: MasterSubscriberManagementStatus) {
	const icons: Record<MasterSubscriberManagementStatus, LucideIcon> = {
		Active: CheckCircle2,
		Inactive: CircleX,
		Suspended: CirclePause,
	};

	return icons[status];
}

function createSubscriber(
	values: Omit<
		MasterSubscriberManagementListRecord,
		"dateRegisteredLabel" | "updatedAt" | "updatedBy"
	> &
		Partial<
			Pick<
				MasterSubscriberManagementListRecord,
				"updatedAt" | "updatedBy"
			>
		>,
): MasterSubscriberManagementListRecord {
	return {
		...values,
		dateRegisteredLabel: formatSubscriberDate(values.dateRegistered),
		updatedAt: values.updatedAt ?? "May 30, 2024 11:45 AM",
		updatedBy: values.updatedBy ?? "Jane Smith",
	};
}

function createCompany(
	id: string,
	name: string,
	branchCount: number,
	userCount: number,
	subscriberId = "sub-abc-corporation",
): MasterSubscriberManagementCompanyRecord {
	const companySlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");

	return {
		addressLines: [
			"100 Commerce Street,",
			"New York, NY 10001,",
			"United States",
		],
		amount: "$499.00 / month",
		billingCycle: "Monthly",
		branchCount,
		code: id.replace("cmp-", "CMP-").toUpperCase(),
		contactEmail: `info@${companySlug}.com`,
		contactNumber: "+63 917 123 4567",
		dateAdded: "May 12, 2024",
		id,
		industry: "Services",
		name,
		nextRenewalDate: "May 12, 2025",
		nextRenewalHelper: "in 348 days",
		paymentStatus: "Paid",
		planDescription:
			"Combined accounting and inventory coverage for companies that need full operational workflows.",
		planName: "Accounting + Inventory",
		planStartDate: "May 12, 2024",
		reportEndDate: "2024-12-31",
		reportStartDate: "2024-01-01",
		status: "Active",
		storageAvailableGb: MasterSubscriberManagementCompanyStorageAvailableGb,
		storageTotalGb: MasterSubscriberManagementCompanyStorageTotalGb,
		storageUsedGb: MasterSubscriberManagementCompanyStorageUsedGb,
		subscriberId,
		taxpayerType: "non-individual",
		tin: "123-456-789-000",
		userCount,
		website: `www.${companySlug}.com`,
	};
}

function createFallbackCompany(
	subscriber: MasterSubscriberManagementListRecord,
): MasterSubscriberManagementCompanyRecord {
	return {
		addressLines: [
			"123 Main Street,",
			"New York, NY 10001,",
			"United States",
		],
		amount: "$499.00 / month",
		billingCycle: "Monthly",
		branchCount: subscriber.branches,
		code: "CMP-00001",
		contactEmail: subscriber.email,
		contactNumber: "+63 917 123 4567",
		dateAdded: subscriber.dateRegisteredLabel,
		id: `${subscriber.id}-company`,
		industry: "Business Services",
		name: subscriber.name,
		nextRenewalDate: "May 12, 2025",
		nextRenewalHelper: "in 348 days",
		paymentStatus: "Paid",
		planDescription:
			"Combined accounting and inventory coverage for companies that need full operational workflows.",
		planName: "Accounting + Inventory",
		planStartDate: subscriber.dateRegisteredLabel,
		reportEndDate: "2024-12-31",
		reportStartDate: "2024-01-01",
		status: subscriber.status === "Inactive" ? "Inactive" : "Active",
		storageAvailableGb: MasterSubscriberManagementCompanyStorageAvailableGb,
		storageTotalGb: MasterSubscriberManagementCompanyStorageTotalGb,
		storageUsedGb: MasterSubscriberManagementCompanyStorageUsedGb,
		subscriberId: subscriber.id,
		taxpayerType: "non-individual",
		tin: "123-456-789-000",
		userCount: subscriber.users,
		website: "www.example.com",
	};
}

function createInvoice(
	id: string,
	date: string,
	billingPeriod: string,
): MasterSubscriberManagementInvoiceRecord {
	return {
		amount: "$299.00",
		billingPeriod,
		date,
		description: "Business Plan - Monthly",
		id,
		status: "Paid",
	};
}

function formatSubscriberDate(date: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(new Date(`${date}T00:00:00`));
}
