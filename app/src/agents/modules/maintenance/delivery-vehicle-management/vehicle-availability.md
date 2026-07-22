# Vehicle Availability

Vehicle Availability is a submodule of [Vehicle Operations](./vehicle-operations.md). It provides the current operational status and assignment eligibility of every delivery vehicle.

## Purpose

- Show which vehicles can be assigned to delivery work.
- Explain why a vehicle is unavailable or blocked.
- Prevent conflicting reservations and assignments.
- Combine vehicle status, documents, inspections, maintenance, and active-trip information in one view.

## Record Ownership

- Vehicle identity comes from [Delivery Vehicles](./delivery-vehicles.md) through `vehicleId`.
- Vehicle Availability owns status events and availability decisions, not the vehicle master record.
- Current status may be summarized on Delivery Vehicles for fast display.

## Availability Fields

- `vehicleId`
- Vehicle Code
- Plate Number
- Vehicle Type
- Assigned Branch and Warehouse
- Current Driver
- Operational Status
- Eligibility Result
- Unavailability Reason
- Current Reservation or `assignmentId`
- Current `tripId`
- Active `workOrderId`
- Last Inspection Result
- Required Document Compliance
- Current Odometer
- Last Known Location and Timestamp
- Available From
- Last Status Change
- Status Changed By

## Operational Statuses

- Available
- Reserved
- In Use
- Under Inspection
- Under Maintenance
- Out of Service
- Retired

## Eligibility Checks

A vehicle is eligible for assignment only when:

- Its master record is active.
- Its operational status is Available.
- It has no overlapping reservation or trip.
- Required registration, insurance, permits, and inspection documents are valid.
- No critical maintenance is overdue.
- No active repair or out-of-service restriction exists.
- Required safety inspection has passed.
- Its branch and warehouse are accessible to the user.

Cargo-specific eligibility is checked during [Load Planning](./load-planning.md) using vehicle capacity, refrigeration, temperature, dimensions, and hazardous-goods capability.

## Status Sources

| Source Module | Event | Availability Result |
| --- | --- | --- |
| Vehicle Assignment | Approved reservation | Reserved |
| Delivery Trips and Dispatch | Vehicle dispatched | In Use |
| Delivery Trips and Dispatch | Trip completed | Await post-trip result |
| Vehicle Inspections | Inspection started | Under Inspection |
| Vehicle Inspections | Passed required inspection | Available or Reserved |
| Vehicle Inspections | Failed safety check | Under Maintenance or Out of Service |
| Maintenance and Repairs | Work begins | Under Maintenance |
| Maintenance and Repairs | Vehicle declared unsafe | Out of Service |
| Maintenance and Repairs | Return-to-service approved | Available after required inspection |
| Delivery Vehicles | Vehicle retired | Retired |

## Key Rules

- Status changes must record source, reason, timestamp, and user or system actor.
- A vehicle cannot be Available while it has an active trip or blocking work order.
- Reserved includes an effective start and end time to prevent overlapping assignments.
- Out of Service overrides Reserved, Available, and In Use assignment eligibility.
- Retired vehicles cannot return to service without an authorized reactivation process.
- Manual overrides require permission, a reason, and an audit record.
- Availability is calculated from authoritative source records; users must not edit derived blocking reasons directly.

## Suggested Frontend Placement

- Route: `/maintenance/vehicle-operations/availability`
- Feature source: `app/src/ui/modules/maintenance/vehicle-operations/availability`

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Vehicle Assignment](./vehicle-assignment.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)
- [Vehicle Inspections](./vehicle-inspections.md)
- [Maintenance and Repairs](./maintenance-and-repairs.md)

