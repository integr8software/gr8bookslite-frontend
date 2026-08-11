export function formatApproverSetupDate(value: string) {
	if (!value) {
		return "-";
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

export function formatApproverListLabel(userNames: (string | undefined)[]) {
	const validNames = userNames.filter(Boolean);

	if (validNames.length === 0) {
		return "Unassigned approvers";
	}

	if (validNames.length <= 2) {
		return validNames.join(", ");
	}

	return `${validNames[0]} + ${validNames.length - 1} more`;
}

export function getApproverSetupInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}
