export const MasterModuleSystemsHref = "/master/module-systems";

export const MasterModuleSystemAddHref = `${MasterModuleSystemsHref}/add`;

export function getMasterModuleSystemViewHref(recordId: string | number) {
	return `${MasterModuleSystemsHref}/view/${recordId}`;
}

export function getMasterModuleSystemEditHref(recordId: string | number) {
	return `${MasterModuleSystemsHref}/edit/${recordId}`;
}

export function getMasterModuleSystemSidebarHref(recordId: string | number) {
	return `${MasterModuleSystemsHref}/sidebar/${recordId}`;
}
