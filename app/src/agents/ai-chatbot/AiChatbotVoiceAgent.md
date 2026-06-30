# AI Chatbot With Voice Instructions

These instructions apply to the AI chatbot with voice support and should be read together with the root `AGENTS.md`.

## Goal

Build an AI chatbot that becomes available after the user has completely logged in. The chatbot greets the user, accepts text or voice input, understands any available input language, and always replies in English only.

The chatbot must support an automatic voice mode where it continuously detects the user's voice, converts speech into text, and submits the detected speech as a command.

The chatbot is a system assistant, not an unrestricted operator. It must help the user only within the user's current access, selected context, company, branch, module permissions, and allowed actions.

## Core Behavior

- Show or activate the chatbot only after the user has fully completed login and the app session is ready.
- Greet the user after login completion.
- Speak the greeting when voice output is enabled.
- Accept typed messages.
- Accept spoken messages through speech recognition.
- Accept any available language as input when browser or provider speech recognition supports that language.
- Translate, normalize, or interpret non-English input before generating the response.
- Always reply in English.
- Always speak in English when voice output is enabled.
- Never mirror the user's input language in the final chatbot response unless the user asks about the language itself.
- Respect whether the user is currently in the workspace or inside a selected company.
- Respect the user's company, branch, module access, and action permissions before showing, suggesting, or executing system commands.
- Never save add or edit commands immediately; show a preview and wait for explicit user confirmation.

## Post-Login Greeting

Trigger the greeting only after all of these conditions are true:

- the user is authenticated
- required user/session data has loaded
- route protection has finished redirect checks
- the user is inside the main application area, not still on login, signup, OTP, or onboarding transition screens

Recommended greeting:

```txt
Hello, welcome back. How can I help you today?
```

Greeting rules:

- Do not repeat the greeting on every route change.
- Greet once per fresh authenticated browser session.
- If the user logs out and logs in again, the greeting may run again.
- If the chatbot panel is initially collapsed, show a subtle unread greeting state or open the panel depending on the product UX decision.

## Language Rules

### Input

The chatbot can receive any available language through:

- text input
- voice transcription
- automatic voice mode

Input handling should:

- detect the language when possible
- preserve the user's intended command
- support mixed-language input when possible
- fail gracefully if speech recognition cannot detect the spoken language

### Output

The chatbot must:

- answer in English only
- use English for spoken output
- use English for confirmations, errors, and command results
- use clear, concise business-app language

Examples:

```txt
User: "Mag-open ng sales report"
Bot: "Opening the sales report."
```

```txt
User: "Crear una factura nueva"
Bot: "Starting a new invoice."
```

## Voice Features

### Voice Input

Voice input should use a speech recognition provider or browser API that supports:

- start listening
- stop listening
- interim transcription when available
- final transcription
- language auto-detection when available
- clear error states for blocked microphone permissions

Prefer browser capability detection over browser-name detection. Do not rely on
checking whether the browser is Chrome or Edge before enabling speech input.
Instead, detect whether the browser exposes native speech recognition:

```ts
const SpeechRecognitionConstructor =
	window.SpeechRecognition ?? window.webkitSpeechRecognition;

const isNativeSpeechRecognitionSupported = Boolean(
	SpeechRecognitionConstructor,
);
```

Chrome and Edge commonly expose native speech recognition through
`webkitSpeechRecognition`, but this should be treated as an optional fast path,
not the only speech-to-text path. Other Chromium-based browsers may expose the
same API, and embedded browser contexts may behave differently from normal
Chrome or Edge tabs.

Recommended speech-to-text order:

1. Use native browser speech recognition when the API is available and the user
   grants microphone permission.
2. Fall back to recorded audio plus the backend transcription provider when
   native speech recognition is unavailable, unreliable, or produces an error.
3. Show a clear unsupported state only when neither native speech recognition
   nor backend audio transcription can run.

Voice input states:

- idle
- requesting microphone permission
- listening
- transcribing
- ready to send
- sending
- error

### Voice Output

Voice output should use text-to-speech for:

- the post-login greeting
- chatbot replies
- command confirmations
- important error messages

Voice output rules:

- speak English only
- allow the user to stop speech playback
- do not speak sensitive data unless the app explicitly allows it
- do not overlap multiple bot speeches; cancel or queue based on the chosen UX

## Automatic Voice Mode

Automatic mode is a hands-free mode where the chatbot detects speech and turns it into a command.

When automatic mode is enabled:

- the chatbot listens for the user's voice after microphone permission is granted
- recognized speech is converted into text
- final transcriptions are submitted automatically as commands
- the bot replies in English
- voice output speaks the English response when enabled

Automatic mode should include:

- a visible enabled or disabled state
- a microphone permission prompt flow
- a listening indicator
- a way to pause or disable automatic listening
- protection against duplicate command submission
- silence timeout handling
- retry behavior after temporary recognition failures

Automatic mode should not:

- submit empty transcriptions
- submit low-confidence transcriptions without confirmation if the command is risky
- continue listening after logout
- continue listening after the user disables the mode
- run on login, signup, OTP, or onboarding screens

## Command Handling

Treat voice and text input as the same command pipeline after transcription.

Suggested command pipeline:

1. Capture text from typed input or voice transcription.
2. Detect input language if the provider exposes it.
3. Normalize the command into English intent.
4. Classify the command as either chat, navigation, data lookup, or workflow action.
5. Resolve the user's current context as workspace-level or company-level.
6. Resolve the selected company when the command requires company data.
7. Check branch access, module access, and action permissions before performing any app action.
8. For add or edit commands, prepare a preview instead of saving immediately.
9. Ask for confirmation before saving add or edit commands.
10. Ask for confirmation before destructive, financial, or irreversible actions.
11. Execute the command when allowed and confirmed.
12. Return an English response.
13. Speak the English response when voice output is enabled.

## Context Rules

The chatbot must understand the difference between workspace context and company context.

### Workspace Context

Workspace context is the account-level area where the user may see multiple companies, invitations, company switching, and workspace-level setup.

In workspace context, the chatbot may help with:

- explaining available companies
- helping the user choose or switch company
- navigating to workspace-level pages
- answering general system questions
- showing only workspace-level actions the user is allowed to access

In workspace context, the chatbot must not execute company-specific commands without a selected company.

Example blocked command:

```txt
User: "Make me a disbursement with these details."
Bot: "Please select a company first before I can help create a disbursement."
```

If the user belongs to multiple companies, the chatbot must not guess the company. It should ask the user to select a company or navigate them to company selection.

### Company Context

Company context means the user is inside a specific selected company and company-scoped modules are available based on permissions.

In company context, the chatbot may help with company-specific workflows only when the user has permission for:

- the module
- the requested action
- the current company
- the current branch or target branch

Company-specific examples include:

- creating a disbursement
- viewing invoices
- editing customer records
- exporting reports
- setting records inactive or active
- canceling transactions

The chatbot must include the selected company and branch context in its internal command context before running any company-scoped action.

If a command can apply to more than one branch and the user's active branch is unclear, the chatbot must ask the user to select or confirm the branch before preparing the action.

## Permission Rules

The chatbot must enforce the same permissions as the application UI and backend.

Backend permission checks are the source of truth. The chatbot must verify backend-supported permissions for company, branch, module, and action before executing commands.

Action permissions include:

- add
- view
- edit
- set inactive
- set active
- cancel
- export

Module permissions include:

- only modules available to the user
- only module actions available to the user
- only company-scoped modules for the selected company
- only branch-scoped records and actions for branches the user can access

Permission behavior:

- If the user does not have module access, the chatbot should not perform the action or expose restricted details.
- If the user does not have branch access, the chatbot must not view, add, edit, cancel, activate, inactivate, or export records for that branch.
- If the user can view but not add, the chatbot may explain or navigate to allowed views but must not create records.
- If the user can view but not edit, the chatbot may summarize visible data but must not update records.
- If the user cannot export, the chatbot must not generate or download exports for that module.
- If the user cannot cancel, the chatbot must not cancel transactions.
- If the user cannot set inactive or active, the chatbot must not change record status.
- If permissions are unknown or still loading, the chatbot must wait or say it needs to verify access first.

Recommended permission denial responses:

```txt
You do not have permission to add records in this module.
```

```txt
You can view this module, but you do not have permission to edit it.
```

```txt
Please select a company before I can help with that transaction.
```

```txt
Please select a branch before I can prepare that transaction.
```

```txt
You do not have permission to access records for that branch.
```

## Add And Edit Preview Rules

Every add and edit command must use a preview-before-save flow.

The chatbot must not save immediately when the user says things like:

```txt
Create a disbursement for 5,000 pesos.
```

```txt
Update this supplier address.
```

Required add and edit flow:

1. Understand the user's requested add or edit command.
2. Verify company context.
3. Verify branch context.
4. Verify module access.
5. Verify action permission for add or edit.
6. Collect missing required fields.
7. Show a clear English preview of the record or changes.
8. Ask the user to confirm.
9. Save only after explicit confirmation.
10. Return the saved result in English.

Preview content should include:

- company
- branch
- module or transaction type
- action type: add or edit
- important fields that will be saved
- missing or invalid fields
- warnings for risky or unusual values

Valid confirmation examples:

```txt
Yes, save it.
```

```txt
Confirm.
```

```txt
Proceed with the update.
```

Invalid confirmation examples:

```txt
Looks okay.
```

```txt
Maybe.
```

```txt
Continue later.
```

If the user changes any field after preview, the chatbot must generate a new preview and ask for confirmation again.

Risky commands that should require confirmation:

- deleting records
- posting transactions
- approving payments
- changing permissions
- exporting sensitive reports
- sending emails or notifications
- editing company, billing, or tax settings

Even after confirmation, risky commands must still pass branch, module, action, and company-context permission checks.

## Suggested Frontend Structure

Follow the existing frontend split of `data -> services -> hooks -> ui`.

```txt
app/src/data/ai-chatbot/
  AiChatbotData.ts
  AiChatbotTypes.ts

app/src/services/ai-chatbot/
  AiChatbotApi.ts
  AiChatbotSpeech.ts
  AiChatbotCommands.ts

app/src/hooks/ai-chatbot/
  useAiChatbot.ts
  useAiChatbotGreeting.ts
  useAiChatbotSpeechRecognition.ts
  useAiChatbotSpeechSynthesis.ts
  useAiChatbotAutomaticMode.ts

app/src/ui/ai-chatbot/
  AiChatbotPanel.tsx
  AiChatbotButton.tsx
  AiChatbotMessageList.tsx
  AiChatbotComposer.tsx
  AiChatbotVoiceControls.tsx
  AiChatbotListeningIndicator.tsx
```

## Layer Responsibilities

### `data/ai-chatbot`

Use this layer for:

- chatbot state types
- message types
- voice mode constants
- supported command categories
- default greeting text
- speech recognition status values

### `services/ai-chatbot`

Use this layer for:

- chatbot API requests
- speech recognition wrappers
- text-to-speech wrappers
- command classification helpers
- app command execution helpers
- permission-aware command checks
- workspace and company context helpers
- branch context and branch permission helpers

### `hooks/ai-chatbot`

Use this layer for:

- chat message state
- post-login greeting state
- voice input lifecycle
- text-to-speech lifecycle
- automatic mode lifecycle
- microphone permission state
- workspace and selected-company awareness
- selected-branch awareness
- module and action permission awareness
- command submission and deduplication

### `ui/ai-chatbot`

Use this layer for:

- chatbot launcher button
- chat panel
- message list
- composer input
- microphone button
- automatic mode toggle
- listening and speaking indicators
- permission and error states

## UI Requirements

- Keep the chatbot available from the authenticated app shell.
- Match chatbot capabilities to the current workspace or company context.
- Hide or disable unavailable commands based on permissions when possible.
- Show add and edit previews before saving.
- Use a compact launcher that does not block core workflows.
- Provide clear microphone, send, stop, and automatic mode controls.
- Use icons for common controls when available.
- Make listening, transcribing, sending, and speaking states visible.
- Keep the panel responsive on mobile and desktop.
- Do not show the chatbot on auth-only screens unless a separate support-chat mode is intentionally built.

## Privacy And Safety

- Request microphone permission only when the user enables voice input or automatic mode.
- Stop listening immediately on logout.
- Stop listening when automatic mode is turned off.
- Avoid storing raw audio unless explicitly required.
- Avoid speaking sensitive values by default.
- Require confirmation for high-risk commands.
- Respect user permissions before executing commands.
- Respect branch permissions before viewing or modifying branch-scoped records.
- Never bypass backend permission checks; frontend permission checks are only a user experience layer.

## Acceptance Criteria

- After a complete login, the chatbot greets the user once.
- The greeting is displayed in English.
- The greeting is spoken in English when voice output is enabled.
- The chatbot accepts typed English input.
- The chatbot accepts typed non-English input and replies in English.
- The chatbot accepts spoken input when microphone permission is granted.
- The chatbot replies in English only.
- Automatic mode can be enabled and disabled.
- Automatic mode detects speech, transcribes it, and submits it as a command.
- Automatic mode does not submit duplicate or empty commands.
- The chatbot stops listening after logout.
- Company-specific commands are blocked while the user is only in workspace context.
- Company-specific commands run only after a company is selected.
- Branch-specific commands run only after a branch is selected or confirmed.
- Commands are limited by branch access, module access, and action permissions.
- Add commands show a preview and save only after explicit confirmation.
- Edit commands show a preview and save only after explicit confirmation.
- Permission-denied responses are in English.
- Risky commands ask for confirmation before execution.

## Implementation Notes

- Prefer browser-native speech APIs only if they satisfy the supported browser requirements.
- Use feature detection for `SpeechRecognition` or `webkitSpeechRecognition`; do not use Chrome or Edge user-agent checks as the source of truth.
- Treat native browser speech recognition as a fast path for supported browsers, especially regular Chrome and Edge tabs.
- Keep the existing recorded-audio-to-backend transcription flow as the fallback for unsupported browsers, embedded contexts, low-confidence transcripts, or native recognition errors.
- If browser-native speech recognition is not reliable enough, use a dedicated speech-to-text provider.
- Keep voice provider details behind `AiChatbotSpeech.ts` so the UI does not depend on a specific speech API.
- Keep command execution permission-aware and route-aware.
- Keep command execution context-aware: workspace commands and company commands must be separated.
- Do not let the chatbot infer a company when the user has not selected one.
- Do not let the chatbot infer a branch when the active or target branch is unclear.
- Treat backend company, branch, module, and action permission checks as required before execution.
- Treat preview confirmation as required for every add and edit command.
- Keep all user-facing chatbot responses in English.
