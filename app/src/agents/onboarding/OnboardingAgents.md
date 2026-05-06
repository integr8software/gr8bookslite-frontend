# Onboarding Area Instructions

These instructions apply to the onboarding module and should be read together with the root `AGENTS.md`.

## Scope

The onboarding module is separate from auth. It is the flow users enter after a successful sign in and before the final dashboard experience.

Current onboarding route:

```txt
app/(onboarding)/onboarding/page.tsx
```

## Structure

```txt
app/src/data/onboarding/
app/src/services/onboarding/
app/src/hooks/onboarding/
app/src/ui/onboarding/
app/src/agents/onboarding/
```

## Rules

- Use PascalCase for shared onboarding files
- Keep onboarding logic out of auth folders
- Use the same modular split as auth: `data -> services -> hooks -> ui`
