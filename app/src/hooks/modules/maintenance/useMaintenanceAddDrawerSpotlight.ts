"use client";

import { useEffect } from "react";
import {
  MaintenanceAddDrawerSpotlightTutorialCloseEvent,
  MaintenanceAddDrawerSpotlightTutorialOpenEvent,
} from "@/app/src/data/modules/maintenance/MaintenanceSpotlightTutorialData";

export function useMaintenanceAddDrawerSpotlight(
  onOpen: () => void,
  onClose: () => void,
) {
  useEffect(() => {
    window.addEventListener(
      MaintenanceAddDrawerSpotlightTutorialOpenEvent,
      onOpen,
    );
    window.addEventListener(
      MaintenanceAddDrawerSpotlightTutorialCloseEvent,
      onClose,
    );

    return () => {
      window.removeEventListener(
        MaintenanceAddDrawerSpotlightTutorialOpenEvent,
        onOpen,
      );
      window.removeEventListener(
        MaintenanceAddDrawerSpotlightTutorialCloseEvent,
        onClose,
      );
    };
  }, [onClose, onOpen]);
}
