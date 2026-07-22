# Delivery Trips and Dispatch

Delivery Trips and Dispatch is a subfeature of [Vehicle Operations](./vehicle-operations.md). It converts an approved load and vehicle assignment into an active delivery trip, controls departure and return, and records route and stop progress.

It is not a separate sidebar module. It is accessed through Vehicle Operations.

## Purpose

- Create a trip from an approved load plan and verified manifest.
- Assign an eligible vehicle, driver, crew, route, and customer stops.
- Validate vehicle, driver, document, inspection, and load readiness.
- Record dispatch, trip progress, stop activity, return, and closure.
- Provide the trip relationship used by tracking, delivery confirmation, incidents, fuel, and maintenance referrals.

## Record Ownership

- Owning area: Vehicle Operations
- Primary record: `tripId`
- Vehicle relationship: `vehicleId` from [Delivery Vehicles](./delivery-vehicles.md)
- Load relationships: `loadPlanId` and `loadManifestId`
- Driver relationship: `driverId`

## Trip Header Fields

- Trip Number
- Trip Date
- `vehicleId`
- `driverId`
- Helper or Crew
- Source Warehouse
- Route
- `loadPlanId`
- `loadManifestId`
- Planned Departure and Return
- Actual Departure and Return
- Starting and Ending Odometer
- Starting and Ending Engine Hours
- Total Stops
- Completed Stops
- Planned and Actual Distance
- Trip Status
- Dispatch Notes
- Return Notes

## Stop Fields

- `tripStopId`
- `tripId`
- Stop Sequence
- Customer
- Delivery Address
- Related Delivery Orders
- Planned Arrival and Departure
- Actual Arrival and Departure
- Stop Status
- Delivery Time Window
- Contact Person
- Location Coordinates
- Arrival and Departure Evidence
- Delivery Confirmation Status
- Exception Reason

## Dispatch Checklist

- Vehicle is Available or Reserved for this trip.
- Vehicle documents are valid.
- Driver is active, available, qualified, and properly licensed.
- Required pre-trip inspection passed.
- Critical maintenance is not overdue.
- No active repair or out-of-service restriction exists.
- Vehicle matches the load plan and manifest.
- Manifest is verified and sealed when required.
- Loaded items satisfy vehicle capacity and cargo restrictions.
- Required route, stops, documents, and crew are complete.

## Status Flow

```text
Draft -> Planned -> Ready for Dispatch -> Dispatched -> In Progress
  |         |               |                            |
  +----> Cancelled <---------+                            v
                                                Returning -> Completed
                                                      |
                                                      v
                                                   Closed
```

Failed, Interrupted, or Aborted may be used for trips that cannot follow the normal completion flow.

## Key Rules

- A trip cannot be dispatched without one eligible vehicle and driver.
- A vehicle or driver cannot have overlapping active trips.
- The verified manifest vehicle must match the trip vehicle.
- Dispatch changes the vehicle status to In Use.
- Dispatch locks the planned vehicle, driver, manifest, and initial readings; authorized substitutions require an auditable change process.
- Tracking events must reference `tripId` and `vehicleId`.
- A stop cannot be completed until required [Delivery Confirmation](./delivery-confirmation.md) records and exceptions are captured.
- Ending odometer cannot be lower than starting odometer without an authorized correction.
- Trip completion requires return time, final readings, load reconciliation, and all required stops resolved.
- Returned, rejected, damaged, and undelivered items must follow warehouse return or exception handling.
- Required post-trip inspection must be completed before the vehicle returns to Available.
- A breakdown or safety issue may create an incident and a linked Maintenance and Repairs work order.
- Closed trips remain immutable except through an audited correction process.

## Data Exchanged

### Received

- Vehicle identity, eligibility, capacity, status, and readings from Delivery Vehicles.
- Approved allocations from Load Planning.
- Final loaded quantities and seal verification from Vehicle Load Manifest.
- Driver eligibility from Employee or Driver Management.

### Produced

- Trip and stop status
- Actual departure, arrival, return, distance, and usage readings
- Tracking context
- Delivery-confirmation context
- Vehicle In Use and post-trip status updates
- Incident, breakdown, and maintenance source references

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Load Planning](./load-planning.md)
- [Vehicle Load Manifest](./vehicle-load-manifest.md)
- [Delivery Confirmation](./delivery-confirmation.md)
- [Maintenance and Repairs](./maintenance-and-repairs.md)

