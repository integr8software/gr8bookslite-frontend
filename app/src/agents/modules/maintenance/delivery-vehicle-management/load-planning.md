# Load Planning

Load Planning is a subfeature of [Vehicle Operations](./vehicle-operations.md). It allocates approved delivery-order items to a proposed vehicle and trip before physical loading begins.

It is not a separate sidebar module. Users open it from a vehicle assignment, delivery trip, or delivery-planning workflow.

## Purpose

- Select approved delivery orders that are ready for dispatch.
- Allocate all or part of each delivery-order line to a vehicle trip.
- Check weight, volume, dimensions, pallet, carton, temperature, and cargo restrictions.
- Arrange customer stops and loading sequence.
- Prevent over-allocation and vehicle over-capacity.
- Produce an approved plan for the Vehicle Load Manifest.

## Record Ownership

- Owning area: Vehicle Operations
- Primary record: `loadPlanId`
- Required vehicle relationship: `vehicleId` from [Delivery Vehicles](./delivery-vehicles.md)
- Optional planned trip relationship: `tripId`
- Source item relationship: `deliveryOrderItemId`
- Item details come from Item Management and the Delivery Order; Load Planning does not create item master records.

## Header Fields

- Load Plan Number
- Planning Date
- Source Warehouse
- Planned Vehicle
- Planned Driver
- Planned Route
- Planned Departure
- Planned Return
- Planning Status
- Total Stops
- Total Planned Weight
- Total Planned Volume
- Total Planned Pallets
- Total Planned Cartons
- Weight Utilization Percentage
- Volume Utilization Percentage
- Planner
- Remarks

## Load Plan Line Fields

- `loadPlanLineId`
- `loadPlanId`
- `deliveryOrderId`
- `deliveryOrderItemId`
- `itemId`
- Item Code and Description snapshot
- Ordered Quantity
- Previously Allocated Quantity
- Remaining Quantity
- Planned Quantity
- Unit of Measurement
- Unit Weight
- Total Weight
- Unit Volume
- Total Volume
- Pallet Count
- Carton Count
- Cargo Length, Width, and Height
- Temperature Requirement
- Hazardous-Goods Requirement
- Customer and Delivery Address
- Delivery Stop Sequence
- Loading Sequence
- Special Handling Instructions
- Allocation Status

## Data Consumed

### From Delivery Orders

- Approved and releasable delivery orders
- Customer and delivery address
- Requested delivery date and time window
- Ordered, cancelled, previously allocated, and remaining quantities
- Item and unit of measurement
- Warehouse and inventory source
- Special delivery instructions

### From Item Management

- Item weight and weight unit
- Item volume and volume unit
- Package dimensions
- Units per carton or pallet
- Temperature and refrigeration requirements
- Hazardous-goods classification
- Stackability and handling restrictions

### From Delivery Vehicles

- `vehicleId`
- Vehicle Code, Plate Number, and Vehicle Type
- Availability and document compliance
- Maximum load weight and cargo volume
- Maximum pallet and carton capacity
- Cargo dimensions
- Refrigeration and temperature range
- Hazardous-goods permission

## Capacity Validation

```text
Planned Weight = sum(Planned Quantity x Unit Weight)
Planned Volume = sum(Planned Quantity x Unit Volume)

Weight Utilization % = Planned Weight / Vehicle Maximum Load Weight x 100
Volume Utilization % = Planned Volume / Vehicle Maximum Cargo Volume x 100
```

The system must also validate pallet count, carton count, cargo dimensions, temperature compatibility, hazardous-goods permission, and any item-mixing restrictions.

## Status Flow

```text
Draft -> For Review -> Approved -> Released for Loading
  |          |            |
  +------> Cancelled <-----+
```

An approved plan may return to Draft only through an authorized revision that preserves the previous version.

## Key Rules

- Only approved and unfulfilled delivery-order quantities may be allocated.
- The same delivery-order quantity cannot be allocated to overlapping active plans.
- Planned Quantity must be greater than zero and cannot exceed Remaining Quantity.
- The planned vehicle must be eligible for the intended dispatch period.
- Capacity and cargo-compatibility errors block approval unless an explicit authorized exception exists.
- Changing the vehicle recalculates all capacity and compatibility checks.
- Delivery stop sequence and loading sequence may differ; items for the first stop are normally loaded last when rear access requires it.
- Releasing a plan creates or updates one [Vehicle Load Manifest](./vehicle-load-manifest.md).
- Plan revisions after loading begins require reconciliation against quantities already loaded.
- Historical plan versions remain auditable.

## Output

Load Planning provides the following to the Vehicle Load Manifest:

- `loadPlanId`
- Selected `vehicleId`
- Planned `tripId`, driver, route, warehouse, and stops
- Approved delivery-order item allocations
- Planned quantities, weight, volume, pallet, and carton totals
- Loading sequence and special handling instructions

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Vehicle Load Manifest](./vehicle-load-manifest.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)
- [Delivery Confirmation](./delivery-confirmation.md)

