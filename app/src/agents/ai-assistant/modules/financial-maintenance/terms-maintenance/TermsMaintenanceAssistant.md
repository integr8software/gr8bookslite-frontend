# Terms Maintenance Assistant

This module assistant owns Neo AI behavior for Terms Maintenance.

It should plug into the shared AI assistant shell rather than creating a
separate launcher, panel, voice handler, or greeting system.

## Module Identity

- Module: Terms Maintenance
- Route: `/financial-maintenance/terms-maintenance`
- Current page: `app/(modules)/financial-maintenance/terms-maintenance/page.tsx`
- Main UI: `app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceListPage.tsx`
- Drawer UI: `app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceDrawer.tsx`
- Fields UI: `app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceFields.tsx`

## Domain Vocabulary

The assistant should understand:

- term
- payment term
- due term
- datemode
- period
- day mode
- month mode
- year mode
- active
- inactive

## Supported Intents

Start with safe and narrow intents:

- open terms maintenance
- explain terms maintenance
- search terms
- filter active terms
- filter inactive terms
- prepare a new term
- preview a term edit

Later intents can include:

- activate term
- deactivate term
- import terms
- export terms

These later intents need stronger permission and confirmation handling.

## Permission Requirements

The assistant must respect the same permissions as the Terms Maintenance UI:

- view terms requires view access
- create term requires create access
- edit term requires edit access
- import terms requires import access
- activate or deactivate requires status-change permission when available
- export requires export permission when available

If permission details are unknown or still loading, the assistant should say:

```txt
I need to verify your access before I can do that.
```

## Add Term Preview

For a create command, collect and preview:

- name
- description
- datemode
- period
- status

Required fields:

- name
- datemode
- period
- status

Warnings:

- period `0` means the term does not add time
- missing datemode should block saving
- missing name should block saving
- negative or decimal period should block saving

The assistant must not save immediately.

## Edit Term Preview

For an edit command, the preview should show:

- selected term
- original values
- changed values
- missing or invalid fields
- warnings

If the target term is unclear, ask the user to choose a term.

## Confirmation Rules

Saving requires an explicit confirmation.

Valid confirmations:

- `Yes, save it.`
- `Confirm.`
- `Proceed with the update.`

Invalid confirmations:

- `Looks okay.`
- `Maybe.`
- `Continue later.`

If the user changes any field after preview, generate a new preview and ask for
confirmation again.

## Example Commands

```txt
User: Open terms maintenance.
Assistant: Opening Terms Maintenance.
```

```txt
User: Create a term called Net 30 for 30 days.
Assistant: I prepared a Terms Maintenance preview. Please review it before saving.
```

```txt
User: Gumawa ng term na Net 15 for 15 days.
Assistant: I prepared a Terms Maintenance preview. Please review it before saving.
```

```txt
User: Show inactive terms.
Assistant: Showing inactive terms.
```

## Suggested Module Files

When implementation begins, use a module folder instead of placing all behavior
inside the shared assistant:

```txt
app/src/assistants/modules/financial-maintenance/terms-maintenance/
  TermsMaintenanceAssistantCommands.ts
  TermsMaintenanceAssistantPreview.ts
  TermsMaintenanceAssistantPermissions.ts
  TermsMaintenanceAssistantTypes.ts
```

The exact folder can change, but the ownership should stay module-specific.

