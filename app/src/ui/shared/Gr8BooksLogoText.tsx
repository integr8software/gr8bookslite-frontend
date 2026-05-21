type Gr8BooksLogoTextProps = {
	className?: string;
	neoClassName?: string;
};

function JoinClasses(...classes: Array<string | undefined>) {
	return classes.filter(Boolean).join(" ");
}

export function Gr8BooksLogoText({
	className,
	neoClassName,
}: Gr8BooksLogoTextProps) {
	return (
		<span
			className={JoinClasses(
				"inline-flex items-baseline tracking-tight",
				className,
			)}
		>
			<span className="gr8books-logo-text">Gr8Books</span>
			<span
				className={JoinClasses(
					"neo-gradient-text ml-1 font-medium italic",
					neoClassName,
				)}
			>
				Neo
			</span>
		</span>
	);
}
