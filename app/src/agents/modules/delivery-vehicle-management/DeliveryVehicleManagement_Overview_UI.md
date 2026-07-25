# Delivery Vehicle Management Functional Specification

## Document Purpose

This document is the product and UI implementation reference for Delivery Vehicle Management. It defines the module's purpose, terminology, child modules, workflows, business rules, conceptual records, integrations, and relationship with Warehouse Management.

This is a planning document only. UI or backend implementation must begin only after this document has been reviewed and approved.

## Definition

Delivery Vehicle Management controls the company fleet and the operational process that turns a prepared load into an assigned, dispatched, tracked, completed, and auditable delivery trip.

The module answers these questions:

1. **Vehicle setup:** What types of vehicles and individual vehicles are available?
2. **Capacity and readiness:** Can a vehicle safely carry a proposed load?
3. **Assignment:** Which vehicle and delivery team will handle the work?
4. **Dispatch and tracking:** Where is the trip in its operational lifecycle?
5. **Fleet care:** What inspections, fuel events, incidents, maintenance, and repairs affect the vehicle?

Delivery Vehicle Management is the transport authority. It is not the stock ledger and does not own warehouse stock balances.

## Goals

- Maintain reusable vehicle types and registered delivery vehicles.
- Determine operational vehicle availability from assignments, trips, maintenance, and manual blocks.
- Plan loads against weight, volume, pallet, and handling constraints.
- Assign compatible vehicles, drivers, helpers, and trips without scheduling conflicts.
- Dispatch and track delivery and transfer trips.
- Record inspections, odometer readings, fuel, incidents, maintenance, and repairs.
- Connect trips to warehouse-staged loads and delivery documents.
- Provide utilization, safety, cost, and maintenance visibility.

## Out of Scope

- Warehouse stock balances and inventory posting.
- Picking, putaway, and storage locations.
- Sales order approval, invoicing, customer credit, and collection.
- Payroll and complete employee scheduling.
- Full route optimization or mandatory real-time GPS in the first version.
- General fixed-asset accounting and depreciation, although a vehicle may link to an asset record.

## Core Terminology

| Term | Definition |
| --- | --- |
| Vehicle type | A reusable vehicle classification and default capacity profile. |
| Delivery vehicle | A specific registered fleet unit identified by plate number and/or fleet number. |
| Availability | Whether a vehicle may be planned or assigned for a time window. |
| Capacity | Safe load limit expressed by weight, volume, pallet count, dimensions, or special handling. |
| Load plan | A proposed grouping of delivery or transfer demand checked against capacity and compatibility. |
| Assignment | Reservation of a vehicle and delivery team for a plan, date, and time window. |
| Delivery trip | The operational journey containing an origin, stops, load documents, team, and status. |
| Dispatch | Formal release of a ready vehicle and load from the origin. |
| Tracking event | A timestamped trip milestone or location update, manual or GPS-sourced. |
| Inspection | A pre-trip, post-trip, periodic, or safety check with findings. |
| Incident | An accident, damage, violation, breakdown, theft, delay, or other reportable event. |
| Maintenance work order | Planned or corrective service activity that may make a vehicle unavailable. |

## Module Structure

```text
Delivery Vehicle Management
|-- Vehicle Types
|-- Delivery Vehicles
|-- Vehicle Operations
|   |-- Vehicle Availability
|   |-- Load Planning
|   |-- Vehicle Assignment
|   |-- Delivery Trips & Dispatch
|   |-- Trip Tracking
|   |-- Vehicle Inspections
|   `-- Fuel & Incidents
`-- Maintenance & Repairs
```

## Current Implementation State

At the time this specification was written:

- All ten routes and frontend module identities are registered.
- Module codes, route constants, sidebar entries, and page component folders exist.
- Each screen currently renders only a page heading.
- No delivery-vehicle types, data layer, validation, hooks, API integration, forms, tables, or backend persistence are currently implemented.

The first UI implementation should therefore treat this document as the baseline rather than assuming the existing title-only pages contain business behavior.

## Child Module Requirements

### 1. Vehicle Types (`DVT`)

**Use:** Maintain reusable vehicle classifications and default specifications used for planning.

Recommended fields:

- Type code
- Type name
- Description
- Body type
- Maximum payload weight and unit
- Maximum cargo volume and unit
- Pallet capacity
- Internal cargo length, width, and height
- Refrigerated or temperature-controlled flag
- Temperature range, when applicable
- Hazardous-material eligibility
- Default fuel type
- Status

Suggested examples:

- Motorcycle
- Tricycle
- Van
- Refrigerated Van
- Light Truck
- Medium Truck
- Heavy Truck

Rules:

- Code and name are unique within a company.
- Capacity values must be positive.
- Inactive types remain on historical vehicle records but cannot be assigned to new vehicles.
- Vehicle-specific specifications may override type defaults and must be clearly identified as overrides.

### 2. Delivery Vehicles (`DVE`)

**Use:** Maintain each physical delivery vehicle.

Recommended fields:

- Fleet number
- Plate number
- Vehicle type
- Make, model, and year
- Color
- Engine number
- Chassis/VIN
- Ownership type
- Owner or carrier, when third-party
- Home branch
- Base warehouse or parking location
- Registration expiry
- Insurance expiry
- Current odometer
- Fuel type
- Vehicle-specific weight, volume, pallet, or dimension overrides
- Asset reference, when applicable
- Status
- Notes and attachments

Suggested master statuses:

- Active
- Inactive
- Retired

Rules:

- Fleet number and plate number are unique within a company.
- A vehicle's master status is different from operational availability.
- Expired registration or insurance blocks dispatch unless an authorized legal/compliance override is explicitly supported.
- Retired vehicles remain visible in history and cannot be assigned.
- The current odometer cannot be lower than the latest accepted odometer reading.
- A preferred or usual driver may be stored as a convenience, but the actual driver belongs to an assignment or trip.

### 3. Vehicle Availability (`DVA`)

**Use:** Show and manage whether vehicles can be assigned for a date/time window.

Availability states:

- Available
- Reserved
- Assigned
- Loading
- On Trip
- Under Inspection
- Under Maintenance
- Out of Service
- Inactive

Sources of availability:

- Vehicle master status
- Existing assignments
- Active trips
- Failed safety inspections
- Maintenance work orders
- Manual block or reservation
- Registration/insurance compliance

Recommended display:

- Calendar or timeline
- List/table by date
- Vehicle, type, base warehouse, state, reason, available-from time

Precedence from highest restriction to lowest:

`Inactive/Retired -> Out of Service -> Under Maintenance -> Failed Inspection -> On Trip -> Loading -> Assigned/Reserved -> Available`

Rules:

- Availability is calculated from authoritative records plus audited manual blocks.
- A user cannot manually mark a vehicle available while a higher-priority restriction is active.
- The same vehicle cannot have overlapping active assignments or trips.
- Filters should include date/time window, type, branch, base warehouse, and capacity.

### 4. Load Planning (`DVLP`)

**Use:** Group delivery or warehouse-transfer demand into a feasible vehicle load.

Inputs may include:

- Ready or expected warehouse pick/dispatch records
- Delivery receipts or approved outbound delivery documents
- Sales delivery demand
- Warehouse transfer loads
- Customer, address, requested window, and route zone
- Item weight, volume, dimensions, pallet count, and handling requirements

Recommended header fields:

- Load plan number
- Plan date
- Origin warehouse
- Proposed delivery date/time
- Route or service area
- Required vehicle type
- Status
- Planner and remarks

Recommended load-line fields:

- Source document and number
- Customer or destination warehouse
- Delivery address
- Requested window
- Package or item summary
- Weight
- Volume
- Pallets
- Special handling
- Warehouse readiness

Suggested statuses:

- Draft
- Planned
- Ready for Assignment
- Assigned
- Cancelled

Rules:

- A plan may contain one or many compatible demand documents.
- Weight, volume, pallet, dimension, refrigeration, hazardous, and handling constraints are checked.
- Capacity usage should show both absolute totals and percentage.
- A warning threshold may be configured, but hard legal or manufacturer limits cannot be overridden.
- Planning a load reserves transport capacity; it does not move or issue warehouse stock.
- A load should not be assigned until required warehouse records are sufficiently ready, unless the system deliberately supports advance assignment.

### 5. Vehicle Assignment (`DVAS`)

**Use:** Assign a compatible vehicle and delivery team to a load plan or trip.

Recommended fields:

- Assignment number
- Load plan
- Origin warehouse
- Schedule start/end
- Vehicle
- Driver
- Helpers or crew
- Dispatcher
- Status
- Notes

Suggested statuses:

- Draft
- Reserved
- Confirmed
- Released
- Cancelled

Rules:

- Vehicle and driver schedules cannot overlap active assignments or trips.
- The vehicle must meet load capacity and handling requirements.
- The vehicle must be legally compliant and operationally available.
- A driver must be an active eligible user/employee/party with the required license information when driver compliance is in scope.
- Cancelling an assignment releases its vehicle and team unless another active record still reserves them.
- Reassignment retains an audit trail of the previous vehicle and team.

### 6. Delivery Trips & Dispatch (`DVD`)

**Use:** Create and control the trip that carries one or more planned loads.

Recommended header fields:

- Trip number
- Trip date
- Origin warehouse
- Load plan(s)
- Vehicle
- Driver and crew
- Route
- Planned departure and return
- Actual departure and return
- Starting and ending odometer
- Status
- Dispatch notes

Recommended stop fields:

- Stop sequence
- Customer or destination warehouse
- Address and coordinates when available
- Contact person and number
- Delivery documents
- Requested window
- Arrival/departure times
- Stop result
- Failure reason or proof reference

Suggested statuses:

- Draft
- Planned
- Assigned
- Loading
- Ready for Dispatch
- Dispatched
- In Transit
- Partially Completed
- Completed
- Returned
- Cancelled

Dispatch checklist:

- Vehicle is available and compliant.
- Assignment is confirmed.
- Pre-trip inspection passed.
- Required documents are present.
- Warehouse confirms load readiness/loading.
- Load remains within capacity.
- Driver and crew are confirmed.
- Starting odometer and dispatch time are recorded.

Rules:

- Dispatch changes vehicle/trip state, not inventory quantity.
- Warehouse release or the source document's posting event owns the stock issue.
- A trip may include multiple stops and documents.
- Completing a trip requires every stop to have a final result or an approved exception.
- Cancelling after loading or warehouse release requires a return, reassign, or reversal workflow; it must not silently restore inventory.

### 7. Trip Tracking (`DVTK`)

**Use:** Show a trip's current state and chronological movement/event history.

Minimum first-version events:

- Dispatched
- Departed origin
- Arrived at stop
- Delivery started
- Delivery completed
- Delivery failed
- Departed stop
- Delay reported
- Breakdown/incident reported
- Returned to origin
- Trip completed

Recommended event fields:

- Trip and stop
- Event type
- Date/time
- Location text
- Latitude/longitude when available
- Odometer
- Source: manual, mobile, GPS, or system
- Entered by
- Notes and attachment/proof reference

Rules:

- The first version may use manual/event tracking and remain GPS-ready.
- Events are append-only; corrections create an audit entry.
- Trip status may be derived or advanced from accepted events.
- Users must see stale tracking data and the time of the latest update.

### 8. Vehicle Inspections (`DVIN`)

**Use:** Record vehicle safety and condition checks.

Inspection types:

- Pre-trip
- Post-trip
- Periodic
- Maintenance release
- Incident follow-up

Checklist groups may include:

- Tires and wheels
- Brakes
- Lights and signals
- Fluids and leaks
- Mirrors and visibility
- Horn and warning devices
- Battery
- Cargo body, door, lock, and refrigeration
- Safety equipment
- Registration and required documents
- Cleanliness and sanitation

Recommended result:

- Passed
- Passed with Observation
- Failed

Rules:

- A failed safety-critical item blocks dispatch.
- Each issue has severity, notes, attachments, and corrective action.
- Failed items may create or link to a maintenance work order.
- Maintenance release requires all blocking findings to be resolved or formally overridden by an authorized role.

### 9. Fuel & Incidents (`DVFI`)

This route should use separate **Fuel** and **Incidents** tabs or clearly separated workspaces because the records have different purposes.

#### Fuel

**Use:** Record fuel purchases/issuances and monitor consumption.

Recommended fields:

- Fuel transaction number
- Vehicle
- Trip, when applicable
- Date/time and location/station
- Odometer
- Fuel type
- Quantity
- Unit price and total
- Full-tank flag
- Receipt/reference
- Entered by

Rules:

- Odometer cannot go backward.
- Quantity and total must be positive.
- Consumption metrics should distinguish complete fill cycles from partial fills.
- Unusual consumption is flagged, not automatically treated as fraud.

#### Incidents

**Use:** Record accidents, damage, violations, breakdowns, theft, cargo events, and major delivery delays.

Recommended fields:

- Incident number
- Vehicle and trip
- Incident type and severity
- Date/time and location
- Driver and people involved
- Description
- Vehicle/cargo/third-party damage
- Police, insurance, or authority reference
- Attachments
- Corrective actions
- Status

Suggested statuses:

- Reported
- Under Review
- Action Required
- Resolved
- Closed

Rules:

- Serious incidents may immediately set the vehicle to Out of Service.
- Incident resolution may link to inspections, maintenance, insurance, and trip exceptions.
- Closing an incident does not automatically make a vehicle available.

### 10. Maintenance & Repairs (`DVMR`)

**Use:** Plan preventive service and manage corrective repair work.

Recommended fields:

- Work order number
- Vehicle
- Maintenance type
- Trigger: date, odometer, inspection, incident, or breakdown
- Priority
- Description and diagnosis
- Service provider
- Scheduled start/end
- Actual start/end
- Odometer
- Parts and labor lines
- Estimated and actual cost
- Warranty/reference
- Status
- Release approval

Suggested maintenance types:

- Preventive
- Corrective
- Emergency
- Inspection Repair
- Tire
- Registration/Compliance

Suggested statuses:

- Draft
- Scheduled
- In Progress
- Waiting for Parts
- Completed
- Released
- Cancelled

Rules:

- Scheduled or in-progress work can block the affected assignment window.
- In-progress and safety-related work makes the vehicle unavailable.
- Completed work does not make a vehicle dispatchable until required release/inspection checks pass.
- Preventive schedules may be based on date, odometer, or whichever threshold occurs first.
- Costs remain linked to the vehicle and may later integrate with purchasing, payables, and fixed assets.

## End-to-End Operating Workflow

```text
Approved delivery or transfer demand
    -> Warehouse allocation and picking
    -> Dispatch staging / readiness
    -> Load plan
    -> Vehicle and team assignment
    -> Pre-trip inspection
    -> Loading confirmation
    -> Dispatch
    -> Trip tracking and stop results
    -> Return / trip completion
    -> Post-trip inspection
    -> Fuel, incident, and maintenance follow-up
```

## Status and Availability Relationship

These concepts must remain separate:

| Concept | Example | Authority |
| --- | --- | --- |
| Vehicle master status | Active, Inactive, Retired | Delivery Vehicles |
| Operational availability | Available, Assigned, On Trip, Under Maintenance | Vehicle Availability, derived from operational records |
| Load plan status | Draft, Ready for Assignment, Assigned | Load Planning |
| Assignment status | Reserved, Confirmed, Released | Vehicle Assignment |
| Trip status | Loading, Dispatched, In Transit, Completed | Delivery Trips & Dispatch |
| Inspection result | Passed, Observation, Failed | Vehicle Inspections |
| Maintenance status | Scheduled, In Progress, Released | Maintenance & Repairs |

A user should not directly edit a derived availability state when its cause is an assignment, trip, failed inspection, or maintenance record. The UI should link to the blocking record.

## Conceptual Data Relationships

```text
Vehicle Type 1 ---- * Delivery Vehicle
Delivery Vehicle 1 ---- * Availability Block
Delivery Vehicle 1 ---- * Assignment
Delivery Vehicle 1 ---- * Trip
Delivery Vehicle 1 ---- * Inspection
Delivery Vehicle 1 ---- * Fuel Record
Delivery Vehicle 1 ---- * Incident
Delivery Vehicle 1 ---- * Maintenance Work Order

Load Plan 1 ---- * Load Line
Load Plan * ---- * Warehouse Pick/Dispatch or Delivery Document
Load Plan 1 ---- 0..1 Assignment
Trip 1 ---- * Trip Stop
Trip 1 ---- * Tracking Event
Trip 1 ---- * Delivery/Transfer Document
Assignment * ---- 1 Driver/User/Party
Assignment * ---- * Helper/User/Party
```

Every transactional record should include company scope, document number, status, creator/updater, timestamps, and status history.

## Connection to Warehouse Management

### What Warehouse Management provides

- Origin or destination warehouse.
- Picked/staged load readiness.
- Item/package quantities.
- Weight, volume, dimensions, pallet count, and handling requirements.
- Warehouse transfer reference.
- Loading/release confirmation.

### What Delivery Vehicle Management returns

- Load plan and assigned vehicle.
- Driver and crew.
- Planned pickup/dispatch window.
- Trip number and dispatch status.
- Stop and delivery results.
- Return, failure, delay, breakdown, or incident information.

### Boundary rules

- Warehouse Management owns item quantity, location, reservation, picking, staging, release, receipt, and stock movement.
- Delivery Vehicle Management owns capacity planning, vehicle/team reservation, dispatch, tracking, trip result, inspection, fuel, incident, and maintenance.
- A load plan references warehouse records; it does not copy or independently maintain stock balances.
- Vehicle loading must use the latest warehouse readiness and load totals.
- Dispatch must be blocked when the warehouse has not released the required load, unless the trip is explicitly allowed to leave partially loaded.
- The inventory issue is posted once by the configured warehouse/source-document event. Dispatch never repeats it.
- When a trip fails after release, the user chooses an auditable disposition: redelivery, reassignment, return to warehouse, damage/shortage handling, or transaction reversal.

## Connections to Other Modules

| Module | Connection |
| --- | --- |
| Sales | Provides customer delivery demand, address, promised window, document value, and priority. |
| Inventory | Provides pick lists, goods issues, delivery receipts, and item/package details. |
| Warehouse Management | Provides origin, staging, readiness, warehouse transfers, and loading/release confirmation. |
| Item Management | Provides item weight, volume, dimensions, UOM, handling, and temperature attributes. |
| Party Management | Provides customers, addresses, contacts, external carriers, service providers, and potentially drivers. |
| User/Employee Management | Provides eligible drivers, helpers, dispatchers, licenses, and user permissions. |
| Purchasing/Accounts Payable | May receive fuel, parts, outsourced repair, toll, and carrier cost documents. |
| Fixed Assets | May link a company-owned vehicle to its asset and depreciation record. |
| System Administration | Provides approvals, numbering, audit trail, roles, and signatories. |

## UI Principles

- Use the shared module header, statistics, filters, table, drawer/form, confirmation, and data-entry patterns.
- Show a vehicle's master status and current availability separately.
- Display the blocking reason and link to the assignment, trip, inspection, or work order.
- Show weight, volume, pallet, and other capacity usage visually and numerically.
- Use a list plus timeline/calendar for availability and trip tracking where appropriate.
- Keep the load plan, assignment, trip, inspection, fuel, incident, and maintenance records separate but cross-linked.
- Support loading, empty, error, permission-denied, and stale-tracking states.
- Show dates and times in the user's timezone while retaining an unambiguous backend timestamp.
- Make mobile/tablet use practical for inspection checklists and trip event entry.

## Security, Audit, and Validation

- Scope all records by active company.
- Enforce module and action permissions on the backend.
- Restrict dispatch, overrides, incident closure, maintenance release, and vehicle reactivation to authorized roles.
- Validate vehicle, document, warehouse, user/party, and company ownership on every write.
- Record who created, assigned, dispatched, inspected, reported, completed, cancelled, overrode, and released each record.
- Require reasons for overrides, cancellations, failed deliveries, manual availability blocks, and odometer corrections.
- Preserve event and status history; do not rewrite completed trip history.
- Prevent duplicate dispatch and conflicting assignments through transactional checks.

## Suggested Statistics

| Screen | Useful metrics |
| --- | --- |
| Vehicle Types | Total, active, inactive |
| Delivery Vehicles | Active fleet, available now, on trip, under maintenance, compliance expiring |
| Availability | Available, reserved/assigned, on trip, blocked |
| Load Planning | Draft, ready, overloaded/blocked, assigned |
| Assignments | Reserved, confirmed, conflicts, released |
| Trips | Today, ready, in transit, delayed, completed |
| Inspections | Due, passed, failed, unresolved findings |
| Fuel | Total quantity/cost, average consumption, exceptions |
| Incidents | Open, serious, action required, resolved |
| Maintenance | Due soon, scheduled, in progress, overdue, cost |

## Proposed First UI Version

The first version should establish useful workflows without pretending GPS, route optimization, or automated telematics already exist.

1. Vehicle Types CRUD.
2. Delivery Vehicles CRUD with document-expiry and capacity fields.
3. Availability table/calendar derived from vehicle, assignment, trip, inspection, and maintenance state.
4. Load Planning form with warehouse-ready demand selection and capacity calculation.
5. Vehicle Assignment with conflict and compatibility checks.
6. Trips & Dispatch with checklist, stops, and status actions.
7. Event-based Trip Tracking timeline.
8. Inspection checklist with findings.
9. Fuel and Incident tabs.
10. Maintenance work orders and availability blocking.

## UI Acceptance Criteria

- Every route provides a purposeful screen rather than a heading-only placeholder.
- Vehicle master status and operational availability are always distinguishable.
- A user cannot assign an unavailable, incompatible, expired, or overlapping vehicle.
- Load plans show the source documents, warehouse readiness, capacity totals, and constraint failures.
- Dispatch requires an assignment, passed inspection, loading/readiness confirmation, and required details.
- Each trip provides stops and an event timeline.
- Failed inspections and serious incidents create visible availability restrictions.
- Maintenance schedules and work orders affect availability predictably.
- Related warehouse, load, assignment, trip, inspection, incident, and maintenance records are cross-linked.
- Dispatch does not duplicate warehouse inventory posting.
- Responsive states, permissions, errors, confirmations, and audit details are included.

## Decisions to Confirm Before UI Implementation

1. Are vehicles company-owned only, or must the first version support rented and third-party carrier vehicles? Recommended: support ownership type now.
2. Are drivers maintained as employees, parties, users, or a dedicated driver master? Recommended: reference an active employee/party linked to a user when login is needed; avoid a duplicate person master.
3. Is real-time GPS required now? Recommended: begin with event-based tracking and keep coordinates/source fields GPS-ready.
4. Can one trip carry multiple load plans and multiple customers? Recommended: yes.
5. Can one load plan be split across vehicles? Recommended: support it eventually; keep the first UI to one assignment per plan unless oversized/split-load delivery is immediately required.
6. Is partial dispatch allowed when only part of a warehouse load is ready? Recommended: only through an explicit split/remainder workflow.
7. Which event posts the inventory issue? Recommended: the warehouse/source-document posting event, never Delivery Trip Dispatch.
8. Are route optimization and distance calculation required in the first version? Recommended: no; support ordered stops and manual route/zone first.
9. Do license, registration, insurance, and preventive-maintenance expiry rules block dispatch or only warn? Recommended: legal/safety expiry blocks; upcoming expiry warns.

