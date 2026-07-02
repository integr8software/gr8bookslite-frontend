# AI Assistant Voice Implementation Plan

This note captures the implementation direction after reviewing
`app/src/agents/ai-chatbot/AiChatbotVoiceAgent.md` and the existing
`shared/ai-assistant` code.

## Assessment

The voice-agent markdown is a strong product and engineering specification. It
describes a full authenticated assistant platform that should be shared across
modules, with module-specific behavior supplied by each module assistant.

The frontend already has an assistant implementation under
`app/src/*/shared/ai-assistant`:

- `ui/shared/ai-assistant/AiAssistantChat.tsx`
- `hooks/shared/ai-assistant/useAiAssistantChat.ts`
- `hooks/shared/ai-assistant/useAiAssistantSpeech.ts`
- `services/shared/ai-assistant/AiAssistantApi.ts`
- `services/shared/ai-assistant/AiAssistantSpeechSupport.ts`
- `types/shared/ai-assistant/AiAssistantTypes.ts`
- `constants/shared/ai-assistant/AiAssistantConstants.ts`
- `data/shared/ai-assistant/AiAssistantData.ts`

Because this foundation already exists, the recommended direction is to evolve
the current Neo AI assistant instead of creating a second chatbot stack.

## What Already Exists

The current assistant already supports much of the voice layer:

- draggable launcher and compact chat panel
- typed messages
- backend chat endpoint integration
- native speech recognition feature detection
- recorded-audio transcription fallback
- microphone permission handling
- automatic voice mode
- duplicate transcript protection
- silence detection for recorded audio
- text-to-speech support behind a feature flag

## Primary Gaps

The main missing pieces are command governance and authenticated context:

- post-login greeting once per fresh authenticated browser session
- strict hiding or disabling on auth-only screens
- automatic stop of listening on logout
- workspace versus selected-company awareness
- selected company and selected branch context in assistant requests
- module access checks before suggesting or executing actions
- action permission checks before add, edit, export, activate, inactivate, or cancel
- backend permission verification before execution
- preview-before-save flow for all add and edit commands
- risky-action confirmation flow
- English-only response enforcement across all command results

## Recommended Architecture

Use a shared assistant shell with module-specific assistant definitions.

The shared shell owns the universal assistant experience:

- launcher and panel UI
- voice input and voice output
- post-login greeting
- app context collection
- command routing
- permission guardrails
- preview and confirmation UX
- English-only response enforcement

Each module owns its domain behavior:

- module command examples
- module vocabulary and synonyms
- module permission requirements
- module preview builders
- module action handlers
- module-specific warnings and validation rules

This keeps Neo AI consistent across the app while preventing one large assistant
file from becoming responsible for every module's business rules.

### Data And Constants

Use the existing shared assistant data and constants files for:

- greeting copy
- session greeting storage key
- command categories
- preview statuses
- voice mode labels
- assistant storage versions

### Services

Extend the service layer with context-aware command helpers:

- `AiAssistantApi.ts` should send current path, message, history, and app context.
- Add command execution helpers only after backend contracts are clear.
- Keep speech provider details inside `AiAssistantSpeechSupport.ts`.
- Backend permission checks should remain the source of truth.

### Hooks

Add or extend hooks for:

- post-login greeting lifecycle
- assistant app-context resolution
- logout cleanup
- command preview state
- pending confirmation state
- automatic mode shutdown when auth or route context changes

### UI

Keep the current assistant UI, but add:

- unread greeting state when the panel is closed
- clearer automatic mode state text
- preview cards for add and edit commands
- explicit confirm and cancel controls for pending actions
- permission-denied messages in English

## First Module Implementation Pattern

The safest implementation pattern is to start with one governed module workflow,
then repeat the same structure for other modules.

A module assistant should document its own UI and code paths, for example:

- `app/(modules)/<module-route>/page.tsx`
- `app/src/ui/modules/<module-path>/<Module>ListPage.tsx`
- `app/src/ui/modules/<module-path>/<Module>Drawer.tsx`
- `app/src/ui/modules/<module-path>/<Module>Fields.tsx`

Start with these assistant capabilities:

1. Open the module.
2. Explain what the module does.
3. Search or filter records when the user is already on the module page.
4. Prepare a new record from a user command.
5. Preview the new record and ask for explicit confirmation.
6. Save only after confirmation and permission verification.

Do not save add or edit commands immediately.

Each specific module assistant should live under the agent module tree, for
example:

```txt
app/src/agents/ai-assistant/modules/<module-group>/<module-name>/<Module>Assistant.md
```

## Module Preview Requirements

For an add or edit command, the assistant preview should show:

- company context when available
- branch context when required
- module name
- action: add or edit
- important fields that will be saved
- missing required fields
- module-specific warnings

Valid confirmations should be explicit:

- `Yes, save it.`
- `Confirm.`
- `Proceed with the update.`

Ambiguous responses should not save:

- `Looks okay.`
- `Maybe.`
- `Continue later.`

## Recommended Order Of Work

1. Add post-login greeting behavior to the existing assistant.
2. Pass app context into assistant chat requests.
3. Add logout and route cleanup for active voice listening.
4. Add command response types for previews and confirmations.
5. Implement one module's navigation and explanation commands.
6. Implement one module's add preview without saving.
7. Wire explicit confirmation to save through the same validated form or backend path.
8. Expand the same pattern to edit, activate, inactivate, import, and export only after permissions are reliable.

## Non-Goals For The First Slice

- Do not build a parallel `ai-chatbot` UI.
- Do not bypass existing module validation.
- Do not save records directly from raw transcription.
- Do not implement unrestricted cross-module actions.
- Do not infer company or branch when context is unclear.
- Do not rely on browser-name detection for speech support.
