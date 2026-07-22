# Vehicle Load Manifest

Vehicle Load Manifest is a subfeature of [Vehicle Operations](./vehicle-operations.md). It records the actual delivery-order items and quantities physically loaded into a vehicle for a specific trip.

It is not a separate sidebar module. It is opened from an approved [Load Planning](./load-planning.md) record or a delivery trip.

## Purpose

- Convert planned item allocations into confirmed loaded quantities.
- Record shortages, substitutions, rejected loading, or other variances.
- Confirm that the final physical load remains within vehicle capacity and cargo rules.
- Provide the authoritative loaded-item list for dispatch and delivery confirmation.
- Produce a printable or electronic vehicle load manifest.

## Record Ownership

- Owning area: Vehicle Operations
- Primary record: `loadManifestId`
- Source relationship: `loadPlanId`
- Required vehicle relationship: `vehicleId`
- Required trip relationship before dispatch: `tripId`
- Source item relationship: `deliveryOrderItemId`

## Header Fields

- Manifest Number
- `loadPlanId`
- `tripId`
- `vehicleId`
- Vehicle Code and Plate Number snapshot
- Driver and Crew
- Source Warehouse
- Loading Bay or Location
- Loading Started At
- Loading Completed At
- Manifest Status
- Total Planned Weight and Volume
- Total Loaded Weight and Volume
- Total Loaded Pallets and Cartons
- Final Capacity Utilization
- Loaded By
- Verified By
- Seal Number
- Remarks

## Manifest Line Fields

- `loadManifestLineId`
- `loadManifestId`
- `loadPlanLineId`
- `deliveryOrderId`
- `deliveryOrderItemId`
- `itemId`
- Item Code and Description snapshot
- Lot, Batch, or Serial Number when required
- Expiry Date when required
- Planned Quantity
- Loaded Quantity
- Loading Variance
- Unit of Measurement
- Loaded Weight and Volume
- Pallet or Carton Identifier
- Loading Sequence
- Delivery Stop Sequence
- Temperature at Loading when required
- Loading Condition
- Variance Reason
- Scanned or Confirmed By
- Loaded At

## Status Flow

```text
Draft -> Loading -> For Verification -> Sealed -> Dispatched
  |         |              |
  +----> Cancelled <--------+
```

A dispatched manifest is locked. Corrections use controlled variance or return records rather than editing the original loaded quantities.

## Key Rules

- A manifest must originate from an approved and released load plan unless emergency-loading authority is explicitly supported.
- Loaded Quantity cannot be negative and normally cannot exceed Planned Quantity.
- Loading above the planned quantity requires remaining delivery-order quantity and authorized plan revision.
- Lot, batch, serial, and expiry details are required according to item tracking rules.
- Inventory availability is checked before a line is confirmed as loaded.
- Confirmed loading creates the appropriate warehouse issue, reservation, or staging movement according to Inventory policy.
- Final loaded totals must pass the selected vehicle's capacity and cargo-compatibility rules.
- Required cold-chain items record temperature at loading.
- All required lines, variances, verification, and vehicle checks must be completed before sealing.
- The manifest vehicle must match the dispatched trip vehicle.
- Changing the vehicle after loading requires capacity revalidation, physical transfer confirmation, and a new or revised manifest.
- Dispatch locks the manifest and its snapshots for audit.

## Data Produced for Dispatch

- `loadManifestId`
- `tripId` and `vehicleId`
- Final loaded delivery orders and item quantities
- Total loaded weight, volume, pallets, and cartons
- Capacity-utilization results
- Stop and loading sequences
- Seal and verification details
- Loading variances and exception approvals

## Data Produced for Delivery Confirmation

Each loaded line provides the maximum accountable quantity that may later be classified as:

- Delivered
- Partially Delivered
- Returned
- Rejected
- Damaged
- Missing or Short

The sum of all final disposition quantities must reconcile with Loaded Quantity.

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Load Planning](./load-planning.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)
- [Delivery Confirmation](./delivery-confirmation.md)

