export const MasterModuleSystemQueryKeys = {
	all: ["master-module-systems"] as const,
	lists: () => [...MasterModuleSystemQueryKeys.all, "list"] as const,
	modules: () => [...MasterModuleSystemQueryKeys.all, "modules"] as const,
	sidebar: (systemId: number) =>
		[...MasterModuleSystemQueryKeys.all, "sidebar", systemId] as const,
};
