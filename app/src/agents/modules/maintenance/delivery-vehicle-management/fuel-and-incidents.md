# Fuel and Incidents

Fuel and Incidents is a submodule of [Vehicle Operations](./vehicle-operations.md). It records vehicle fuel and mileage activity together with breakdowns, accidents, damage, and other operational incidents.

The two functions share one submodule to keep the navigation compact, but they use separate record types and workflows.

## Purpose

- Record fuel purchases, consumption, mileage, and efficiency.
- Identify unusual fuel usage or reading variances.
- Record breakdowns, accidents, damage, theft, cargo incidents, and safety events.
- Link operational incidents to trips, vehicles, drivers, claims, and repair work.
- Provide vehicle operating-cost and incident reporting.

## Fuel Records

### Fields

- `fuelEntryId`
- `vehicleId`
- Optional `tripId`
- Transaction Date and Time
- Fuel Type
- Fuel Station or Supplier
- Fuel Card
- Liters Filled
- Unit Price
- Total Fuel Cost
- Odometer Reading
- Distance Since Previous Reading
- Calculated Fuel Efficiency
- Full Tank Indicator
- Receipt Number and Attachment
- Recorded By
- Verification Status
- Variance or Exception Reason

### Fuel Rules

- Vehicle fuel type must be compatible with the recorded fuel.
- Liters, unit price, total cost, and odometer cannot be negative.
- Odometer normally cannot be lower than the last accepted reading.
- Duplicate receipt, fuel-card, vehicle, amount, and timestamp combinations should be flagged.
- Fuel efficiency is calculated only when readings are sufficiently reliable.
- Authorized corrections retain the original record and reason.
- Accepted readings may update the Delivery Vehicles odometer summary.

## Incident Records

### Incident Types

- Breakdown
- Accident
- Vehicle Damage
- Cargo Damage
- Theft or Loss
- Roadside Violation
- Safety Event
- Tracking or Route Exception
- Other

### Fields

- `incidentId`
- Incident Number
- Incident Type
- `vehicleId`
- Optional `tripId` and `tripStopId`
- Driver
- Date and Time
- Location
- Description
- Severity
- Vehicle Condition
- Cargo Impact
- Injured Parties
- Third Parties
- Police Report
- Insurance Claim Reference
- Estimated Cost
- Vehicle Downtime
- Photos and Attachments
- Immediate Action
- Investigation Result
- Related `workOrderId`
- Incident Status
- Reported By

### Incident Status Flow

```text
Draft -> Reported -> Under Investigation -> Resolved -> Closed
                  |-> Repair Required
                  `-> Claim In Progress
```

### Incident Rules

- Critical safety events immediately notify authorized users and may set the vehicle to Out of Service.
- Breakdowns and vehicle damage may create a work order in Maintenance and Repairs.
- Repair referrals retain `incidentId`, `vehicleId`, optional `tripId`, readings, damage, severity, and attachments.
- Accidents requiring a police report or insurance claim cannot close until required references are recorded or formally waived.
- Incident cost may include repair, towing, medical, cargo, penalty, and claim amounts without duplicating Accounting entries.
- Submitted incidents cannot be deleted; corrections remain auditable.
- Trip completion requires unresolved cargo and vehicle incidents to have an assigned disposition.

## Reports and Alerts

- Fuel Cost by Vehicle
- Fuel Efficiency by Vehicle and Type
- Unusual Fuel Consumption
- Missing or Repeated Odometer Reading
- Incident Count and Severity
- Accident and Breakdown History
- Vehicle and Cargo Damage Cost
- Open Claims
- Vehicle Downtime from Incidents

## Suggested Frontend Placement

- Route: `/maintenance/vehicle-operations/fuel-incidents`
- Feature source: `app/src/ui/modules/maintenance/vehicle-operations/fuel-incidents`

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Vehicle Availability](./vehicle-availability.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)
- [Trip Tracking](./trip-tracking.md)
- [Vehicle Inspections](./vehicle-inspections.md)
- [Maintenance and Repairs](./maintenance-and-repairs.md)

