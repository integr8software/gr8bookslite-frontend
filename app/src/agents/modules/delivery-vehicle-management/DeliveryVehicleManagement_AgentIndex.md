# Delivery Vehicle Management Agent Index

The canonical UI specifications are the uniquely named `DeliveryVehicleManagement_*_UI_Spec.md` files in this directory. The consolidated cross-module specification is `DeliveryVehicleManagement_Overview_UI.md`.

## Implementation Order

1. Delivery Vehicles for vehicles, vehicle types, capacity, ownership, registration, and status.
2. Vehicle Scheduling & Assignment for availability, reservations, driver assignments, history, and conflicts.
3. Delivery Planning & Dispatch for load planning, trip scheduling, vehicle/driver assignment, sequence, and dispatch.
4. Trip Monitoring for live trips, timeline, fuel logs, expenses, delays, incidents, and proof of delivery.
5. Vehicle Repair and Maintenance for inspections, defects, maintenance requests, repair work orders, service history, and schedules.

## UI Source Rules

- Keep route files thin and render UI from `app/src/ui/modules/delivery-vehicle-management/...`.
- Keep hooks, API/query orchestration, constants, data/defaults, types, and validation in their corresponding `app/src` feature folders.
- Use shared module headers, statistics, tables, drawers/forms, dialogs, and data-entry components.
- Keep vehicle status separate from operational availability.
- Reference warehouse-staged loads; do not duplicate or post warehouse stock from a vehicle dispatch screen.
- Preserve audit history for assignment, dispatch, trip event, incident, inspection, maintenance, and override actions.

## Completion Gate

Do not begin UI implementation until the overview document's decisions are approved, especially the inventory posting event, driver source, partial-load policy, compliance blocking rules, and GPS scope.
