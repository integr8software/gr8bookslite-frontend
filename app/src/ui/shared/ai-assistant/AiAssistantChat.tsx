"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Image from "next/image";
import {
  Loader2,
  SendHorizontal,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  AiAssistantInputPlaceholder,
  AiAssistantLauncherDragClickThresholdPx,
  AiAssistantLauncherDragId,
  AiAssistantLauncherMarginPx,
  AiAssistantLauncherPositionStorageKey,
  AiAssistantLauncherSizePx,
  AiAssistantLogoSrc,
  AiAssistantName,
  AiAssistantSubtitle,
  AiAssistantVoiceRepliesEnabled,
} from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import { useAiAssistantChat } from "@/app/src/hooks/shared/ai-assistant/useAiAssistantChat";
import { useAiAssistantSpeech } from "@/app/src/hooks/shared/ai-assistant/useAiAssistantSpeech";
import { AiAssistantVoiceControl } from "@/app/src/ui/shared/ai-assistant/AiAssistantVoiceControl";

export function AiAssistantChat() {
  const {
    closeChat,
    input,
    inputRef,
    isOpen,
    isSending,
    messages,
    messagesContainerRef,
    openChat,
    saveMessagesScroll,
    setInput,
    submitMessage,
    submitMessageText,
  } = useAiAssistantChat();
  const speech = useAiAssistantSpeech({
    isSending,
    messages,
    setInput,
    submitCommand: submitMessageText,
  });
  const launcher = useCornerLauncher(isOpen ? closeChat : openChat);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: AiAssistantLauncherDragClickThresholdPx,
      },
    }),
  );

  if (!isOpen) {
    return (
      <DndContext
        sensors={sensors}
        onDragStart={launcher.handleDragStart}
        onDragEnd={launcher.handleDragEnd}
        onDragCancel={launcher.handleDragCancel}
      >
        <AiAssistantLauncherButton launcher={launcher} />
      </DndContext>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={launcher.handleDragStart}
      onDragEnd={launcher.handleDragEnd}
      onDragCancel={launcher.handleDragCancel}
    >
      <section
        aria-label="AI assistant"
        className={GetAiAssistantPanelClassName(launcher.launcherCorner)}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
          <header className="flex min-h-14 items-center justify-between border-b border-[color-mix(in_srgb,var(--skyblue)_24%,transparent)] px-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[color-mix(in_srgb,var(--skyblue)_38%,transparent)] bg-[color-mix(in_srgb,var(--skyblue)_12%,var(--background))]">
                <Image
                  src={AiAssistantLogoSrc}
                  alt=""
                  width={30}
                  height={30}
                  aria-hidden="true"
                  className="h-7.5 w-7.5 object-contain"
                />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {AiAssistantName}
                </h2>
                <p className="truncate text-xs text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
                  {AiAssistantSubtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {AiAssistantVoiceRepliesEnabled ? (
                <button
                  type="button"
                  onClick={speech.toggleVoiceReply}
                  disabled={!speech.isSpeechSynthesisSupported}
                  aria-label={
                    speech.isVoiceReplyEnabled
                      ? "Turn off voice replies"
                      : "Turn on voice replies"
                  }
                  title={
                    speech.isSpeechSynthesisSupported
                      ? "Voice replies"
                      : "Voice replies are not supported in this browser"
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[color-mix(in_srgb,var(--foreground)_58%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--skyblue)_12%,transparent)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {speech.isVoiceReplyEnabled ? (
                    <Volume2
                      className="h-4.5 w-4.5 text-skyblue"
                      aria-hidden="true"
                    />
                  ) : (
                    <VolumeX className="h-4.5 w-4.5" aria-hidden="true" />
                  )}
                </button>
              ) : null}
              <button
                type="button"
                onClick={closeChat}
                aria-label={`Close ${AiAssistantName}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[color-mix(in_srgb,var(--foreground)_58%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--skyblue)_12%,transparent)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            ref={messagesContainerRef}
            onScroll={(event) => saveMessagesScroll(event.currentTarget)}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <p
                  className={
                    message.role === "user"
                      ? "theme-accent-contrast-text max-w-[85%] whitespace-pre-wrap rounded-lg bg-skyblue px-3 py-2 text-sm leading-5"
                      : "max-w-[85%] whitespace-pre-wrap rounded-lg border border-[color-mix(in_srgb,var(--skyblue)_24%,transparent)] bg-[color-mix(in_srgb,var(--skyblue)_10%,var(--background))] px-3 py-2 text-sm leading-5 text-[var(--foreground)]"
                  }
                >
                  {message.content}
                </p>
              </div>
            ))}
            {isSending ? (
              <div className="flex justify-start">
                <p className="inline-flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--skyblue)_24%,transparent)] bg-[color-mix(in_srgb,var(--skyblue)_10%,var(--background))] px-3 py-2 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                  <Loader2
                    className="h-4 w-4 animate-spin text-skyblue"
                    aria-hidden="true"
                  />
                  Thinking
                </p>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={submitMessage}
            className="border-t border-[color-mix(in_srgb,var(--skyblue)_24%,transparent)] p-3"
          >
            {speech.isAutomaticModeEnabled ||
            speech.isListening ||
            speech.isTranscribing ||
            speech.speechError ? (
              <div className="mb-2">
                <p
                  className={
                    speech.speechError
                      ? "text-xs text-red-600"
                      : "text-xs text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]"
                  }
                >
                  {speech.speechError ??
                    (speech.isAutomaticModeEnabled
                      ? speech.isTranscribing
                        ? "Automatic mode is transcribing..."
                        : speech.isListening
                          ? "Automatic mode is listening..."
                          : "Automatic mode is waiting..."
                      : speech.isTranscribing
                        ? "Transcribing..."
                        : speech.speechInputProvider === "native"
                          ? "Listening..."
                          : "Recording...")}
                </p>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={AiAssistantInputPlaceholder}
                className="app-theme-field min-h-10 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
              />
              <AiAssistantVoiceControl isSending={isSending} speech={speech} />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                aria-label="Send message"
                className="theme-accent-contrast-text inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue transition hover:bg-skyblue/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <SendHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </section>
      <AiAssistantLauncherButton
        ariaLabel={`Close ${AiAssistantName}`}
        isOpen
        launcher={launcher}
      />
    </DndContext>
  );
}

function GetAiAssistantPanelClassName(corner: LauncherCorner) {
  const baseClassName =
    "neo-ai-panel fixed z-60 flex h-[min(28rem,calc(100dvh-7rem))] w-[min(25rem,calc(100vw-2rem))] flex-col rounded-lg bg-[var(--background)] text-[var(--foreground)] shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:h-[min(32rem,calc(100dvh-4rem))] sm:w-[min(25rem,calc(100vw-8.5rem))]";

  switch (corner) {
    case "top-left":
      return `${baseClassName} neo-ai-panel-top-left left-4 top-20 sm:left-22 sm:top-4`;
    case "top-right":
      return `${baseClassName} neo-ai-panel-top-right right-4 top-20 sm:right-16 sm:top-4`;
    case "bottom-left":
      return `${baseClassName} neo-ai-panel-bottom-left bottom-20 left-4 sm:bottom-4 sm:left-22`;
    case "bottom-right":
    default:
      return `${baseClassName} neo-ai-panel-bottom-right bottom-20 right-4 sm:bottom-4 sm:right-16`;
  }
}

function AiAssistantLauncherButton({
  ariaLabel = `Open ${AiAssistantName}`,
  isOpen = false,
  launcher,
}: {
  ariaLabel?: string;
  isOpen?: boolean;
  launcher: DraggableLauncherControls;
}) {
  const { handleClick, isDragging, launcherPositionStyle } = launcher;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: AiAssistantLauncherDragId,
  });
  const transformStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={handleClick}
      onDragStart={(event) => event.preventDefault()}
      aria-label={ariaLabel}
      data-dragging={isDragging ? "true" : "false"}
      data-state={isOpen ? "open" : "closed"}
      className="neo-ai-launcher fixed z-60 inline-flex h-13 w-13 cursor-grab touch-none select-none items-center justify-center overflow-hidden rounded-full border-2 border-skyblue bg-[var(--background)] shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition-colors active:cursor-grabbing hover:border-skyblue/70 hover:bg-[color-mix(in_srgb,var(--skyblue)_22%,var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50"
      style={{ ...launcherPositionStyle, ...transformStyle }}
      {...attributes}
      {...listeners}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full">
        <Image
          src={AiAssistantLogoSrc}
          alt=""
          width={36}
          height={36}
          aria-hidden="true"
          draggable={false}
          className="h-9 w-9 rounded-full object-contain"
        />
      </span>
    </button>
  );
}

type LauncherPosition = {
  x: number;
  y: number;
};

type LauncherCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type DraggableLauncherControls = ReturnType<typeof useCornerLauncher>;

function useCornerLauncher(onClick: () => void) {
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [launcherCorner, setLauncherCorner] = useState<LauncherCorner>(() =>
    typeof window === "undefined" ? "bottom-right" : GetInitialLauncherCorner(),
  );

  useEffect(() => {
    window.localStorage.setItem(
      AiAssistantLauncherPositionStorageKey,
      launcherCorner,
    );
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
      Math.abs(delta.x) > AiAssistantLauncherDragClickThresholdPx ||
      Math.abs(delta.y) > AiAssistantLauncherDragClickThresholdPx;

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

  const launcherPositionStyle = GetLauncherPositionStyle(launcherCorner);

  return {
    handleClick,
    handleDragCancel,
    handleDragEnd,
    handleDragStart,
    isDragging,
    launcherCorner,
    launcherPositionStyle,
  };
}

function GetLauncherPositionStyle(corner: LauncherCorner): CSSProperties {
  switch (corner) {
    case "top-left":
      return {
        left: AiAssistantLauncherMarginPx,
        top: AiAssistantLauncherMarginPx,
      };
    case "top-right":
      return {
        right: AiAssistantLauncherMarginPx,
        top: AiAssistantLauncherMarginPx,
      };
    case "bottom-left":
      return {
        bottom: AiAssistantLauncherMarginPx,
        left: AiAssistantLauncherMarginPx,
      };
    case "bottom-right":
      return {
        bottom: AiAssistantLauncherMarginPx,
        right: AiAssistantLauncherMarginPx,
      };
  }
}

function GetInitialLauncherCorner(): LauncherCorner {
  return LoadStoredLauncherCorner() ?? "bottom-right";
}

function LoadStoredLauncherCorner(): LauncherCorner | null {
  const storedCorner = window.localStorage.getItem(
    AiAssistantLauncherPositionStorageKey,
  );

  return IsLauncherCorner(storedCorner) ? storedCorner : null;
}

function IsLauncherCorner(corner: string | null): corner is LauncherCorner {
  return (
    corner === "top-left" ||
    corner === "top-right" ||
    corner === "bottom-left" ||
    corner === "bottom-right"
  );
}

function GetCornerPosition(corner: LauncherCorner): LauncherPosition {
  const left = AiAssistantLauncherMarginPx;
  const right =
    window.innerWidth - AiAssistantLauncherSizePx - AiAssistantLauncherMarginPx;
  const top = AiAssistantLauncherMarginPx;
  const bottom =
    window.innerHeight - AiAssistantLauncherSizePx - AiAssistantLauncherMarginPx;

  switch (corner) {
    case "top-left":
      return { x: left, y: top };
    case "top-right":
      return { x: right, y: top };
    case "bottom-left":
      return { x: left, y: bottom };
    case "bottom-right":
      return { x: right, y: bottom };
  }
}

function ClampLauncherPosition(position: LauncherPosition): LauncherPosition {
  const maxX = Math.max(
    AiAssistantLauncherMarginPx,
    window.innerWidth - AiAssistantLauncherSizePx - AiAssistantLauncherMarginPx,
  );
  const maxY = Math.max(
    AiAssistantLauncherMarginPx,
    window.innerHeight - AiAssistantLauncherSizePx - AiAssistantLauncherMarginPx,
  );

  return {
    x: Math.min(Math.max(position.x, AiAssistantLauncherMarginPx), maxX),
    y: Math.min(Math.max(position.y, AiAssistantLauncherMarginPx), maxY),
  };
}

function GetLauncherCorner(position: LauncherPosition): LauncherCorner {
  const isLeft =
    position.x + AiAssistantLauncherSizePx / 2 < window.innerWidth / 2;
  const isTop =
    position.y + AiAssistantLauncherSizePx / 2 < window.innerHeight / 2;

  if (isTop && isLeft) {
    return "top-left";
  }

  if (isTop) {
    return "top-right";
  }

  return isLeft ? "bottom-left" : "bottom-right";
}
