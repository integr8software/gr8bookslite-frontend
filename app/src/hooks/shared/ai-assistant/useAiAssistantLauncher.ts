"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  AiAssistantLauncherCorner,
  AiAssistantLauncherDragClickThresholdPx,
  AiAssistantLauncherDragId,
  AiAssistantLauncherMarginPx,
  AiAssistantLauncherSizePx,
} from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import { LoadAiAssistantLauncherCorner, SaveAiAssistantLauncherCorner } from "@/app/src/data/shared/ai-assistant/AiAssistantData";
import type { AiAssistantLauncherCorner as AiAssistantLauncherCornerType } from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

type LauncherPosition = {
  x: number;
  y: number;
};

export function useAiAssistantLauncher(onClick: () => void) {
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [launcherCorner, setLauncherCorner] = useState<AiAssistantLauncherCornerType>(
    () => LoadAiAssistantLauncherCorner() ?? AiAssistantLauncherCorner.BottomRight,
  );

  useEffect(() => {
    SaveAiAssistantLauncherCorner(launcherCorner);
  }, [launcherCorner]);

  function handleDragStart(event: DragStartEvent) {
    if (event.active.id !== AiAssistantLauncherDragId) {
      return;
    }

    setIsDragging(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.active.id !== AiAssistantLauncherDragId) {
      return;
    }

    const delta = event.delta;
    const wasDragged =
      Math.abs(delta.x) > AiAssistantLauncherDragClickThresholdPx || Math.abs(delta.y) > AiAssistantLauncherDragClickThresholdPx;

    if (wasDragged) {
      const currentPosition = GetCornerPosition(launcherCorner);
      setLauncherCorner(
        GetLauncherCorner(
          ClampLauncherPosition({
            x: currentPosition.x + delta.x,
            y: currentPosition.y + delta.y,
          }),
        ),
      );
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    setIsDragging(false);
  }

  function handleDragCancel() {
    setIsDragging(false);
  }

  function handleClick() {
    if (suppressClickRef.current) {
      return;
    }

    onClick();
  }

  return {
    handleClick,
    handleDragCancel,
    handleDragEnd,
    handleDragStart,
    isDragging,
    launcherCorner,
  };
}

function GetCornerPosition(corner: AiAssistantLauncherCornerType): LauncherPosition {
  const left = AiAssistantLauncherMarginPx;
  const right = window.innerWidth - AiAssistantLauncherSizePx - AiAssistantLauncherMarginPx;
  const top = AiAssistantLauncherMarginPx;
  const bottom = window.innerHeight - AiAssistantLauncherSizePx - AiAssistantLauncherMarginPx;

  switch (corner) {
    case AiAssistantLauncherCorner.TopLeft:
      return { x: left, y: top };
    case AiAssistantLauncherCorner.TopRight:
      return { x: right, y: top };
    case AiAssistantLauncherCorner.BottomLeft:
      return { x: left, y: bottom };
    case AiAssistantLauncherCorner.BottomRight:
      return { x: right, y: bottom };
  }
}

function ClampLauncherPosition(position: LauncherPosition): LauncherPosition {
  const maxX = Math.max(AiAssistantLauncherMarginPx, window.innerWidth - AiAssistantLauncherSizePx - AiAssistantLauncherMarginPx);
  const maxY = Math.max(AiAssistantLauncherMarginPx, window.innerHeight - AiAssistantLauncherSizePx - AiAssistantLauncherMarginPx);

  return {
    x: Math.min(Math.max(position.x, AiAssistantLauncherMarginPx), maxX),
    y: Math.min(Math.max(position.y, AiAssistantLauncherMarginPx), maxY),
  };
}

function GetLauncherCorner(position: LauncherPosition): AiAssistantLauncherCornerType {
  const isLeft = position.x + AiAssistantLauncherSizePx / 2 < window.innerWidth / 2;
  const isTop = position.y + AiAssistantLauncherSizePx / 2 < window.innerHeight / 2;

  if (isTop && isLeft) {
    return AiAssistantLauncherCorner.TopLeft;
  }

  if (isTop) {
    return AiAssistantLauncherCorner.TopRight;
  }

  return isLeft ? AiAssistantLauncherCorner.BottomLeft : AiAssistantLauncherCorner.BottomRight;
}
