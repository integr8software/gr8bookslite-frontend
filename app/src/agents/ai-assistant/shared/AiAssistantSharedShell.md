# AI Assistant Shared Shell

The shared shell is the one assistant experience that appears across the
authenticated app. Module assistants plug into this shell instead of creating
their own separate chat panels.

## Responsibilities

The shared shell owns:

- assistant launcher and panel
- chat message lifecycle
- voice input lifecycle
- automatic voice mode
- voice output lifecycle
- post-login greeting
- authenticated route visibility
- logout cleanup
- command routing
- app context collection
- generic permission guardrails
- preview and confirmation UI
- English-only user-facing responses

## Existing Code

The current shared assistant implementation is already under:

- `app/src/ui/shared/ai-assistant/AiAssistantChat.tsx`
- `app/src/ui/shared/ai-assistant/AiAssistantVoiceControl.tsx`
- `app/src/hooks/shared/ai-assistant/useAiAssistantChat.ts`
- `app/src/hooks/shared/ai-assistant/useAiAssistantSpeech.ts`
- `app/src/hooks/shared/ai-assistant/useAiAssistantVoiceControls.ts`
- `app/src/services/shared/ai-assistant/AiAssistantApi.ts`
- `app/src/services/shared/ai-assistant/AiAssistantSpeechSupport.ts`
- `app/src/constants/shared/ai-assistant/AiAssistantConstants.ts`
- `app/src/data/shared/ai-assistant/AiAssistantData.ts`
- `app/src/types/shared/ai-assistant/AiAssistantTypes.ts`

## Module Assistant Contract

A module assistant should provide:

- module id
- module route
- supported intents
- command examples
- required context
- required permissions
- preview builder for add and edit actions
- action handler or backend command mapping
- user-facing success and denial responses

The shared shell should not know the details of every field in every module.
It should route the command to the matching module assistant, enforce common
rules, and render the result.

Specific module UI files, field names, validation warnings, and save behavior
belong in that module's assistant document. Shared shell documents should refer
to `<module>` placeholders instead of naming a concrete module.

## Command Flow

1. Capture typed or spoken input.
2. Normalize the input into an English intent.
3. Resolve app context from the current route, company, branch, and permissions.
4. Match the command to a module assistant.
5. Ask the module assistant to classify the command.
6. Verify generic context requirements.
7. Verify module and action permissions.
8. Build a preview for add or edit commands.
9. Wait for explicit confirmation when required.
10. Execute only after backend permission checks pass.
11. Return an English response.
12. Speak the response when voice output is enabled.

## Shared Safety Rules

- Do not show the assistant on login, signup, OTP, or onboarding transition screens.
- Greet once per fresh authenticated browser session.
- Stop listening on logout.
- Stop listening when automatic mode is disabled.
- Do not save add or edit commands without preview and explicit confirmation.
- Do not infer a company when more than one company is available.
- Do not infer a branch when the active or target branch is unclear.
- Do not bypass backend permission checks.
- Do not speak sensitive values by default.

## Suggested Shared Files

When implementation begins, the shared shell can grow toward this shape:

```txt
app/src/services/shared/ai-assistant/
  AiAssistantApi.ts
  AiAssistantCommandRouter.ts
  AiAssistantContext.ts
  AiAssistantPermissions.ts
  AiAssistantSpeechSupport.ts

app/src/hooks/shared/ai-assistant/
  useAiAssistantChat.ts
  useAiAssistantGreeting.ts
  useAiAssistantSpeech.ts
  useAiAssistantCommandPreview.ts

app/src/types/shared/ai-assistant/
  AiAssistantTypes.ts
  AiAssistantCommandTypes.ts
```
