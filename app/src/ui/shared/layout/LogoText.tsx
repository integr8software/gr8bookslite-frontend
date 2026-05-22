type LogoTextProps = {
	className?: string;
	brandSuffixClassName?: string;
};

function joinClasses(...classes: Array<string | undefined>) {
	return classes.filter(Boolean).join(" ");
}

export function LogoText({
	className,
	brandSuffixClassName,
}: LogoTextProps) {
	return (
		<span
			className={joinClasses(
				"inline-flex items-baseline tracking-tight",
				className,
			)}
		>
			<span className="brand-logo-text">Gr8Books</span>
			<span
				className={joinClasses(
					"brand-accent-text ml-1 font-medium italic",
					brandSuffixClassName,
				)}
			>
				Neo
			</span>
		</span>
	);
}
