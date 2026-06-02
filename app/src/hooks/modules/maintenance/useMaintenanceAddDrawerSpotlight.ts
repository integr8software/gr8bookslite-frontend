"use client";

import { useEffect } from "react";
import { MaintenanceAddDrawerSpotlightTutorialOpenEvent } from "@/app/src/data/modules/maintenance/MaintenanceSpotlightTutorialData";

export function useMaintenanceAddDrawerSpotlight(onOpen: () => void) {
  useEffect(() => {
    window.addEventListener(
      MaintenanceAddDrawerSpotlightTutorialOpenEvent,
      onOpen,
    );

    return () => {
      window.removeEventListener(
        MaintenanceAddDrawerSpotlightTutorialOpenEvent,
        onOpen,
      );
    };
  }, [onOpen]);
}
