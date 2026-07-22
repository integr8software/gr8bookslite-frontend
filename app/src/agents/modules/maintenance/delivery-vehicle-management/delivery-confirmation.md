# Delivery Confirmation

Delivery Confirmation is a subfeature of [Vehicle Operations](./vehicle-operations.md). It records the outcome of loaded items at each delivery stop and provides proof of delivery, return, rejection, damage, shortage, and failure information.

It is not a separate sidebar module. It is opened from a trip stop or delivery order assigned to a trip.

## Purpose

- Confirm what the customer actually received.
- Reconcile delivered and undelivered quantities with the Vehicle Load Manifest.
- Capture proof of delivery and customer acknowledgement.
- Record returns, rejections, damage, shortages, and failed delivery reasons.
- Provide completion results to Delivery Management, Inventory, Accounting, and Vehicle Operations.

## Record Ownership

- Owning area: Vehicle Operations
- Primary record: `deliveryConfirmationId`
- Required trip relationship: `tripId`
- Required stop relationship: `tripStopId`
- Source load relationship: `loadManifestId` and `loadManifestLineId`
- Source order relationship: `deliveryOrderId` and `deliveryOrderItemId`
- Vehicle relationship: `vehicleId`

## Header Fields

- Confirmation Number
- `tripId`
- `tripStopId`
- `vehicleId`
- Customer
- Delivery Address
- Arrival and Completion Time
- Confirmation Status
- Recipient Name
- Recipient Role
- Signature
- Photo or Attachment
- Location Coordinates
- Confirmation Source
- Driver or Confirming User
- General Remarks

## Confirmation Line Fields

- `deliveryConfirmationLineId`
- `loadManifestLineId`
- `deliveryOrderItemId`
- `itemId`
- Item Code and Description snapshot
- Loaded Quantity for This Stop
- Delivered Quantity
- Returned Quantity
- Rejected Quantity
- Damaged Quantity
- Missing or Short Quantity
- Unit of Measurement
- Lot, Batch, Serial, or Expiry Details when required
- Item Condition
- Exception Reason
- Customer Remarks
- Evidence Attachments

## Quantity Reconciliation

For each manifest line assigned to the stop:

```text
Loaded Quantity for Stop
= Delivered Quantity
 + Returned Quantity
 + Rejected Quantity
 + Damaged Quantity
 + Missing or Short Quantity
```

No final confirmation may leave an unexplained quantity.

## Status Flow

```text
Pending -> Arrived -> Confirming -> Completed
   |          |           |
   +------> Failed <-------+
                  \
                   -> Partially Completed
```

Partially Completed and Failed records require exception reasons and resolution handling.

## Key Rules

- Confirmation quantities cannot exceed the quantities loaded and assigned to the stop.
- Delivered Quantity updates the fulfillment result of the source delivery-order line.
- Returned, rejected, and damaged items require a disposition and warehouse-return process when physically brought back.
- Missing or Short quantities require an incident or investigation reference according to company policy.
- Serialized items require the delivered or returned serial numbers.
- Proof of delivery requirements may vary by customer, delivery type, or payment terms.
- Required recipient, signature, timestamp, location, or photo evidence must be present before completion.
- The confirmation source and recording user or device must be auditable.
- Completed confirmations cannot be edited directly; corrections use an authorized adjustment record.
- A trip stop is complete only after all its delivery orders and manifest quantities are resolved.
- A trip is complete only after all stops and remaining vehicle quantities are reconciled.

## Integration Results

### Delivery Management

- Delivered and remaining order quantities
- Delivery completion or partial-delivery status
- Failed-delivery and rejection reasons
- Proof-of-delivery reference

### Inventory Management

- Warehouse issue confirmation
- Customer returns
- Rejected or damaged goods disposition
- In-transit and vehicle-stock reconciliation

### Accounting

- Delivery evidence for billing or revenue recognition
- Cash-on-delivery or collection reference when supported
- Charges, returns, credits, shortages, or claims requiring financial processing

### Vehicle Operations

- Stop completion
- Remaining vehicle load
- Trip completion eligibility
- Incident or exception references

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Load Planning](./load-planning.md)
- [Vehicle Load Manifest](./vehicle-load-manifest.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)

