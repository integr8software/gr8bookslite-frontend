import { useQuery } from "@tanstack/react-query";
import {
	getMasterModuleSystemSidebar,
	getMasterModuleSystemModules,
	getMasterModuleSystems,
} from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import { MasterModuleSystemQueryKeys } from "@/app/src/services/master/module-systems/MasterModuleSystemQueryKeys";

export function useMasterModuleSystemsQuery() {
	return useQuery({
		queryKey: MasterModuleSystemQueryKeys.lists(),
		queryFn: getMasterModuleSystems,
	});
}

export function useMasterModuleSystemModulesQuery() {
	return useQuery({
		queryKey: MasterModuleSystemQueryKeys.modules(),
		queryFn: getMasterModuleSystemModules,
	});
}

export function useMasterModuleSystemSidebarQuery(systemId: number | null) {
	return useQuery({
		enabled: systemId !== null,
		queryKey: systemId
			? MasterModuleSystemQueryKeys.sidebar(systemId)
			: MasterModuleSystemQueryKeys.all,
		queryFn: () => getMasterModuleSystemSidebar(systemId!),
	});
}
