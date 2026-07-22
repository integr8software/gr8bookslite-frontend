# Vehicle Operations

Vehicle Operations manages the daily availability, assignment, dispatch, tracking, inspection, and operating activity of delivery vehicles. It provides one operational workspace instead of separate modules for every vehicle activity.

## Purpose

- Show which vehicles are available and eligible for delivery work.
- Assign vehicles, drivers, crew, routes, warehouses, and delivery orders to trips.
- Dispatch vehicles and track their progress until return and trip completion.
- Record pre-trip and post-trip inspections.
- Capture fuel, mileage, breakdown, accident, and incident information.
- Measure capacity utilization and daily vehicle performance.

## Main Views

Detailed item-delivery subfeature specifications:

- [Vehicle Availability](./vehicle-availability.md)
- [Load Planning](./load-planning.md)
- [Vehicle Assignment](./vehicle-assignment.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)
- [Trip Tracking](./trip-tracking.md)
- [Vehicle Inspections](./vehicle-inspections.md)
- [Fuel and Incidents](./fuel-and-incidents.md)

Supporting workflow documents:

- [Vehicle Load Manifest](./vehicle-load-manifest.md), part of Load Planning
- [Delivery Confirmation](./delivery-confirmation.md), part of Delivery Trips and Dispatch

### Availability Board

Shows the latest operational state of every delivery vehicle.

Recommended information:

- Vehicle Code
- Plate Number
- Vehicle Type
- Assigned Branch and Warehouse
- Current Driver
- Current Status
- Current Trip
- Last Known Location
- Last Status Update
- Next Scheduled Maintenance
- Document Compliance
- Assignment Eligibility

Operational statuses:

- Available
- Reserved
- In Use
- Under Inspection
- Under Maintenance
- Out of Service
- Retired

### Assignments and Dispatch

Creates and manages a vehicle assignment for a delivery trip.

Recommended fields:

- Trip Number
- Vehicle
- Driver
- Helper or Crew
- Source Warehouse
- Route
- Delivery Orders
- Customer Stops
- Planned Departure
- Planned Return
- Actual Departure
- Actual Return
- Planned Load Weight and Volume
- Actual Load Weight and Volume
- Capacity Utilization
- Dispatch Status
- Remarks

Load planning, physical loading, dispatch, and delivery completion use separate records so planned, loaded, and delivered quantities remain auditable. See the linked subfeature specifications above.

### Trip Tracking

Displays the progress and latest known position of an in-use vehicle.

Recommended information:

- Vehicle and Trip
- Driver
- Trip Status
- Current or Last Known Location
- Location Source
- Location Timestamp
- Planned Route
- Completed and Remaining Stops
- Stop Arrival and Departure
- Route Deviation
- Idle Time
- Estimated Return
- Tracking Alerts

Tracking may use a GPS or telematics provider, a driver application, or authorized manual updates. The source and timestamp must always be visible.

### Vehicle Inspections

Records pre-trip and post-trip checks.

Recommended inspection items:

- Tires and wheels
- Brakes
- Lights and signals
- Engine oil and coolant
- Battery
- Mirrors, horn, and wipers
- Cargo locks and doors
- Refrigeration unit
- Fire extinguisher and safety equipment
- Vehicle cleanliness
- Odometer
- Reported defects
- Photos and attachments
- Inspector and inspection timestamp

### Fuel and Mileage

Records operating readings and fuel usage.

Recommended fields:

- Vehicle
- Trip
- Transaction Date and Time
- Fuel Type
- Fuel Station or Supplier
- Fuel Card
- Liters Filled
- Fuel Cost
- Odometer Reading
- Distance Traveled
- Fuel Efficiency
- Receipt or Attachment
- Recorded By

### Accidents and Incidents

Records operational events that occur during or outside a trip.

Recommended fields:

- Incident Number
- Incident Type
- Vehicle and Driver
- Related Trip
- Date, Time, and Location
- Description
- Damage and Injured Parties
- Police Report
- Insurance Claim Reference
- Estimated Cost
- Vehicle Downtime
- Photos and Attachments
- Incident Status

## Status Flow

```text
Available
  |-- reserve for an approved trip --> Reserved
  |-- begin inspection -------------> Under Inspection

Reserved
  |-- dispatch ----------------------> In Use
  `-- cancel reservation ------------> Available

Under Inspection
  |-- pass --------------------------> Available or Reserved
  `-- fail --------------------------> Under Maintenance or Out of Service

In Use
  |-- complete trip and pass checks -> Available
  |-- report serviceable defect -----> Under Maintenance
  `-- report unsafe condition -------> Out of Service
```

Retired is a terminal operational status. Reactivation requires an authorized administrative process.

## Key Rules

- Only active vehicles with an Available status may be assigned to a new trip.
- Required registration, insurance, permits, and inspections must be valid before dispatch.
- A vehicle cannot have overlapping active reservations or trips.
- A driver cannot have overlapping active assignments.
- The assigned vehicle must satisfy the delivery's weight, volume, dimensions, temperature, and cargo restrictions.
- Dispatch changes the vehicle status to In Use.
- Trip completion must record actual return time and ending odometer.
- Required post-trip inspection results must be completed before the vehicle returns to Available.
- A safety-critical defect immediately blocks further assignments.
- Failed inspections may create a request in Maintenance and Repairs.
- Location records must store source, timestamp, latitude, longitude, and related trip when available.
- Manual tracking updates must identify the user who entered them.
- Fuel odometer readings cannot be lower than the vehicle's previously accepted reading unless an authorized correction is recorded.
- Accident and incident records must not be deleted after submission; corrections must remain auditable.

## Reports and Alerts

- Current Vehicle Availability
- Vehicles Currently In Use
- Upcoming and Overdue Returns
- Vehicle and Driver Assignment History
- Capacity Utilization
- Trip Completion and Delay
- Fuel Consumption and Efficiency
- Route Deviation and Idle Time
- Failed Inspection and Open Defect
- Accident and Incident Summary

## Integration Points

- **Delivery Management:** delivery orders, stops, routes, and delivery status.
- **Warehouse Management:** source warehouse, loading, and dispatch confirmation.
- **Employee or Driver Management:** driver eligibility, license, and availability.
- **Item Management:** load weight, volume, dimensions, and handling requirements.
- **Maintenance and Repairs:** failed inspections, breakdowns, repair requests, and return-to-service approval.
- **Accounting and Purchasing:** fuel expenses, claims, and external operational costs.
- **GPS or Telematics Provider:** vehicle location, route, odometer, and engine-hour readings.

## Shared Data Contract

Vehicle Operations consumes the vehicle master from [Delivery Vehicles](./delivery-vehicles.md) and exchanges defect and availability information with [Maintenance and Repairs](./maintenance-and-repairs.md).

### Vehicle Fields Consumed

| Source Field from Delivery Vehicles | Operational Usage |
| --- | --- |
| `vehicleId` | Required relationship on every assignment, trip, inspection, fuel, tracking, and incident record |
| Vehicle Code, Plate Number, and Vehicle Name | Vehicle picker, trip header, tracking, and reports |
| Vehicle Type and Body Type | Vehicle filtering and delivery suitability |
| Capacity and cargo dimensions | Load validation and utilization percentage |
| Refrigerated, temperature, and hazardous-goods settings | Cargo handling validation |
| Assigned Branch and Warehouse | Access scope and default dispatch location |
| Operational Status | Reservation and dispatch eligibility |
| Current Odometer and Engine Hours | Trip starting readings and usage calculations |
| Document expiry fields | Pre-dispatch compliance checks |

### Operational Records Produced

| Record | Primary Relationships | Used By |
| --- | --- | --- |
| Vehicle Assignment and Trip | `tripId`, `vehicleId`, `driverId` | Delivery Vehicles summary; Maintenance and Repairs reference |
| Inspection | `inspectionId`, `vehicleId`, optional `tripId` | Maintenance request and return-to-service decision |
| Tracking Event | `trackingEventId`, `vehicleId`, `tripId` | Trip monitoring and latest vehicle location |
| Fuel and Mileage Entry | `fuelEntryId`, `vehicleId`, optional `tripId` | Odometer summary, cost, and efficiency reporting |
| Accident or Incident | `incidentId`, `vehicleId`, optional `tripId` | Repair request, claim, downtime, and audit |

### Data Sent to Maintenance and Repairs

- Failed inspection: `vehicleId`, `inspectionId`, failed items, severity, odometer, notes, photos, and reported date.
- Breakdown: `vehicleId`, `incidentId`, optional `tripId`, location, symptoms, severity, odometer, and attachments.
- Accident damage requiring repair: `vehicleId`, `incidentId`, damage description, claim reference, photos, and vehicle availability decision.
- Maintenance and Repairs uses these references to create a work order without duplicating the source activity.

### Data Received from Maintenance and Repairs

- Active `workOrderId`
- Maintenance or repair status
- Expected completion date
- Return-to-service decision
- Completion inspection requirement
- Updated last-service and next-service summaries

Vehicle Operations uses this information to block or restore assignment eligibility.

## Suggested Frontend Placement

- Route: `/maintenance/vehicle-operations`
- Feature source: `app/src/ui/modules/maintenance/vehicle-operations`

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Vehicle Types](./vehicle-types.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Maintenance and Repairs](./maintenance-and-repairs.md)
- [Vehicle Availability](./vehicle-availability.md)
- [Load Planning](./load-planning.md)
- [Vehicle Assignment](./vehicle-assignment.md)
- [Vehicle Load Manifest](./vehicle-load-manifest.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)
- [Trip Tracking](./trip-tracking.md)
- [Vehicle Inspections](./vehicle-inspections.md)
- [Fuel and Incidents](./fuel-and-incidents.md)
- [Delivery Confirmation](./delivery-confirmation.md)
