# Vehicle Inspections

Vehicle Inspections is a submodule of [Vehicle Operations](./vehicle-operations.md). It records pre-trip, post-trip, periodic, safety, and return-to-service inspections.

## Purpose

- Verify that vehicles are safe and ready before dispatch.
- Record vehicle condition after a trip.
- Identify defects and determine whether they block vehicle use.
- Create traceable maintenance requests from failed inspection items.
- Support return-to-service approval after maintenance or repair.

## Record Ownership

- Primary record: `inspectionId`
- Required vehicle relationship: `vehicleId`
- Optional relationships: `assignmentId`, `tripId`, and `workOrderId`
- Vehicle identity comes from [Delivery Vehicles](./delivery-vehicles.md).
- Failed defects may create work in [Maintenance and Repairs](./maintenance-and-repairs.md).

## Inspection Types

- Pre-Trip
- Post-Trip
- Periodic
- Safety
- Return-to-Service
- Ad Hoc

## Inspection Header Fields

- Inspection Number
- Inspection Type
- `vehicleId`
- `assignmentId`
- `tripId`
- `workOrderId`
- Inspection Date and Time
- Odometer and Engine Hours
- Inspection Location
- Inspector
- Overall Result
- Vehicle Status After Inspection
- Remarks
- Attachments

## Checklist Item Fields

- Checklist Item
- Category
- Expected Condition
- Result: Pass, Fail, Not Applicable, or Not Inspected
- Severity: Advisory, Minor, Major, or Critical
- Defect Description
- Corrective Action Required
- Photo or Attachment
- Maintenance Request Required
- Related `workOrderId`

Typical categories include tires, brakes, lights, signals, engine oil, coolant, battery, mirrors, horn, wipers, cargo doors and locks, refrigeration unit, safety equipment, leaks, and cleanliness.

## Status Flow

```text
Draft -> In Progress -> Submitted -> Passed
                     |-> Passed with Advisory
                     `-> Failed
```

## Key Rules

- Required pre-trip inspection must pass before dispatch.
- A critical failure immediately blocks assignment and sets the vehicle to Out of Service or Under Maintenance.
- Major defects require repair or authorized disposition before the vehicle becomes Available.
- Advisory findings remain visible for monitoring and may create scheduled maintenance.
- Failed items sent to Maintenance and Repairs retain `inspectionId`, `vehicleId`, severity, notes, readings, and attachments.
- Return-to-service inspections reference the completed `workOrderId`.
- Submitted inspections cannot be deleted; corrections remain auditable.
- Inspection templates may vary by Vehicle Type.
- The inspector, timestamps, results, and status changes are mandatory audit information.

## Suggested Frontend Placement

- Route: `/maintenance/vehicle-operations/inspections`
- Feature source: `app/src/ui/modules/maintenance/vehicle-operations/inspections`

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Vehicle Availability](./vehicle-availability.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)
- [Maintenance and Repairs](./maintenance-and-repairs.md)

