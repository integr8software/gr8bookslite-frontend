import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ReportCompanyHeaderProps = {
	address?: string;
	className?: string;
	companyName?: string;
	isCompact?: boolean;
	logoAlt?: string;
	logoFallback?: string;
	logoSrc?: string;
	paddingClassName?: string;
	telephoneNo?: string;
	vatRegTin?: string;
};

const DefaultCompanyAddress =
	"ABC, 123, Sample, Malamig, City Of Mandaluyong, NCR, Second District";

export function ReportCompanyHeader({
	address = DefaultCompanyAddress,
	className,
	companyName = "Your Company Name Here",
	isCompact = false,
	logoAlt = "Company logo",
	logoFallback = "gr8books\nneo",
	logoSrc = "/img/icons/gr8booksneo-logo-wide.png",
	paddingClassName = "p-6",
	telephoneNo = "0967-237-4514",
	vatRegTin = "000-000-000-000",
}: ReportCompanyHeaderProps) {
	return (
		<div
			className={joinClasses(
				"grid grid-cols-[8.5rem_1fr_8.5rem] items-start",
				paddingClassName,
				className,
			)}
		>
			<div className="pt-1">
				{logoSrc ? (
					<img
						src={logoSrc}
						alt={logoAlt}
						className="h-16 w-24 object-contain"
					/>
				) : (
					<div className="grid h-16 w-24 place-items-center whitespace-pre-line text-left text-[22px] font-bold leading-5 text-[#0b56b3]">
						{logoFallback}
					</div>
				)}
			</div>
			<div className="text-center">
				<p className="text-sm font-bold leading-tight">{companyName}</p>
				<p className="mt-1 text-[10px] font-semibold leading-tight">
					VAT REG TIN : {vatRegTin}
				</p>
				<p className="mt-1 text-[10px] font-semibold uppercase leading-tight">
					{address}
				</p>
				<p
					className={joinClasses(
						"text-[10px] font-semibold leading-tight",
						isCompact ? "mt-1" : "mt-3",
					)}
				>
					Telephone No: {telephoneNo}
				</p>
			</div>
			<div />
		</div>
	);
}
