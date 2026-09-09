"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchResponsibilityCenters } from "@/app/src/services/modules/financial-maintenance/responsibility-center/ResponsibilityCenterApi";
import { ResponsibilityCenterQueryKeys } from "@/app/src/services/modules/financial-maintenance/responsibility-center/ResponsibilityCenterQueryKeys";
import { fetchTermOptions } from "@/app/src/services/modules/financial-maintenance/terms-maintenance/TermsMaintenanceApi";
import { TermsMaintenanceQueryKeys } from "@/app/src/services/modules/financial-maintenance/terms-maintenance/TermsMaintenanceQueryKeys";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function useBillingMaintenanceOptions({
  responsibilityCenterFallbackOptions,
  termFallbackOptions,
}: {
  responsibilityCenterFallbackOptions: AppAdvancedDropdownOption[];
  termFallbackOptions: AppAdvancedDropdownOption[];
}) {
  const termsQuery = useQuery({
    queryFn: fetchTermOptions,
    queryKey: TermsMaintenanceQueryKeys.options(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const responsibilityCenterQuery = useQuery({
    queryFn: fetchResponsibilityCenters,
    queryKey: ResponsibilityCenterQueryKeys.centers(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const termOptions = useMemo(
    () =>
      termsQuery.data
        ? termsQuery.data.terms
            .filter((term) => term.status === "Active")
            .map((term) => ({
              description: [term.period, term.datemode].filter(Boolean).join(" "),
              name: term.name,
              value: term.name,
            }))
        : termFallbackOptions,
    [termFallbackOptions, termsQuery.data],
  );
  const responsibilityCenterOptions = useMemo(
    () =>
      responsibilityCenterQuery.data
        ? responsibilityCenterQuery.data.centers
            .filter((center) => center.status === "Active")
            .map((center) => ({
              label: center.code,
              name: center.name,
              selectedDetails: center.code,
              value: center.code,
            }))
        : responsibilityCenterFallbackOptions,
    [responsibilityCenterFallbackOptions, responsibilityCenterQuery.data],
  );

  return {
    responsibilityCenterOptions,
    termOptions,
  };
}
