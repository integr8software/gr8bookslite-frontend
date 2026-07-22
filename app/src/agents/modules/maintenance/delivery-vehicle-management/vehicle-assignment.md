# Vehicle Assignment

Vehicle Assignment is a submodule of [Vehicle Operations](./vehicle-operations.md). It reserves an eligible delivery vehicle, driver, and crew for a planned delivery trip.

## Purpose

- Match a vehicle and driver to approved delivery work.
- Reserve resources for a defined dispatch period.
- Prevent overlapping vehicle and driver assignments.
- Confirm branch, warehouse, route, capacity, document, and qualification eligibility.
- Provide the approved assignment used by Load Planning and Delivery Trips and Dispatch.

## Record Ownership

- Primary record: `assignmentId`
- Vehicle relationship: `vehicleId` from [Delivery Vehicles](./delivery-vehicles.md)
- Driver relationship: `driverId` from Employee or Driver Management
- Optional plan and trip relationships: `loadPlanId` and `tripId`
- Availability is read from [Vehicle Availability](./vehicle-availability.md).

## Assignment Fields

- Assignment Number
- Assignment Date
- `vehicleId`
- `driverId`
- Helper or Crew IDs
- Assigned Company
- Assigned Branch
- Source Warehouse
- Planned Route
- Planned Departure
- Planned Return
- Related Delivery Orders
- `loadPlanId`
- `tripId`
- Required Vehicle Type
- Planned Weight and Volume
- Special Cargo Requirements
- Assignment Status
- Reservation Start and End
- Assigned By
- Approval Information
- Remarks

## Status Flow

```text
Draft -> For Approval -> Approved -> Reserved -> Dispatched -> Completed
  |           |            |
  +-------> Cancelled <-----+
```

## Validation

- Vehicle is active and eligible in Vehicle Availability.
- Driver is active, available, properly licensed, and qualified for the vehicle type.
- Vehicle and driver have no overlapping reservation or trip.
- Branch and warehouse assignments are valid.
- Planned vehicle capacity and cargo capabilities satisfy the preliminary delivery requirements.
- Required vehicle and driver documents remain valid through the planned trip period.
- Critical maintenance is not due before the expected trip return.

## Key Rules

- Approval reserves the vehicle and driver for the assignment period.
- One assignment may group multiple compatible delivery orders into one trip.
- Changing the vehicle or driver after approval triggers eligibility revalidation.
- Cancellation releases the reservation when no dispatched trip exists.
- A dispatched assignment cannot be cancelled directly; the related trip uses interruption or abort handling.
- Assignment records retain vehicle, driver, time, approval, and change history.
- Load Planning may recommend a vehicle, but Vehicle Assignment owns the approved vehicle and driver reservation.
- Delivery Trips and Dispatch consumes the approved assignment and creates or links the final `tripId`.

## Suggested Frontend Placement

- Route: `/maintenance/vehicle-operations/assignments`
- Feature source: `app/src/ui/modules/maintenance/vehicle-operations/assignments`

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Vehicle Availability](./vehicle-availability.md)
- [Load Planning](./load-planning.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)

