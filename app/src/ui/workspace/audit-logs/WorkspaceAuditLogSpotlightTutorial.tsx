"use client";

import { WorkspaceAuditLogsHref } from "@/app/src/constants/workspace/audit-logs/WorkspaceAuditLogConstants";
import {
  WorkspaceAuditLogSpotlightTutorialOpenEvent,
  WorkspaceAuditLogSpotlightTutorialSteps,
  WorkspaceAuditLogSpotlightTutorialStorageKey,
} from "@/app/src/data/workspace/audit-logs/WorkspaceAuditLogSpotlightTutorialData";
import { useSpotlightTutorial } from "@/app/src/hooks/shared/tour/useSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/tour/SpotlightTour";

export function WorkspaceAuditLogSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } = useSpotlightTutorial({
    href: WorkspaceAuditLogsHref,
    openEvent: WorkspaceAuditLogSpotlightTutorialOpenEvent,
    storageKey: WorkspaceAuditLogSpotlightTutorialStorageKey,
  });

  return (
    <SpotlightTour
      ariaLabel="Workspace audit logs tutorial"
      badge={<SpotlightTourBadge>Audit logs guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={WorkspaceAuditLogSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
