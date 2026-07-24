# Delivery Vehicle Management Agent Index

The canonical UI specifications are the uniquely named `DeliveryVehicleManagement_*_UI_Spec.md` files in this directory. The consolidated cross-module specification is `DeliveryVehicleManagement_Overview_UI.md`.

## Implementation Order

1. Vehicle Types and Delivery Vehicles master data.
2. Vehicle Availability derived from master status, assignments, trips, inspections, incidents, and maintenance.
3. Load Planning from warehouse-ready demand and capacity rules.
4. Vehicle Assignment with conflict and compatibility checks.
5. Delivery Trips & Dispatch with loading and pre-trip inspection gates.
6. Event-based Trip Tracking.
7. Vehicle Inspections, Fuel & Incidents, and Maintenance & Repairs.

## UI Source Rules

- Keep route files thin and render UI from `app/src/ui/modules/delivery-vehicle-management/...`.
- Keep hooks, API/query orchestration, constants, data/defaults, types, and validation in their corresponding `app/src` feature folders.
- Use shared module headers, statistics, tables, drawers/forms, dialogs, and data-entry components.
- Keep vehicle status separate from operational availability.
- Reference warehouse-staged loads; do not duplicate or post warehouse stock from a vehicle dispatch screen.
- Preserve audit history for assignment, dispatch, event, inspection, incident, maintenance, and override actions.

## Completion Gate

Do not begin UI implementation until the overview document's decisions are approved, especially the inventory posting event, driver source, partial-load policy, compliance blocking rules, and GPS scope.
