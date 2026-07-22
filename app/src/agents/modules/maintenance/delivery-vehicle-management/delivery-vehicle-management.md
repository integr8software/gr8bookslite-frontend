# Delivery Vehicle Management

Delivery Vehicle Management is the parent module for the complete lifecycle of vehicles used in delivery operations. It covers vehicle master data, capacity, availability, dispatch, trip tracking, inspections, maintenance, repairs, operating costs, compliance documents, and incidents without creating an excessive number of sidebar modules.

## Module Structure

```text
Delivery Vehicle Management
|-- Vehicle Types
|-- Delivery Vehicles
|-- Vehicle Operations
|   |-- Vehicle Availability
|   |-- Load Planning
|   |-- Vehicle Assignment
|   |-- Delivery Trips and Dispatch
|   |-- Trip Tracking
|   |-- Vehicle Inspections
|   `-- Fuel and Incidents
`-- Maintenance and Repairs
```

Reports and alerts are embedded in the relevant modules and the Delivery Vehicle Management dashboard. They are not separate sidebar modules.

## Child Modules

Detailed module specifications:

- [Vehicle Types](./vehicle-types.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Maintenance and Repairs](./maintenance-and-repairs.md)

Vehicle Operations subfeature specifications:

- [Vehicle Availability](./vehicle-availability.md)
- [Load Planning](./load-planning.md)
- [Vehicle Assignment](./vehicle-assignment.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)
- [Trip Tracking](./trip-tracking.md)
- [Vehicle Inspections](./vehicle-inspections.md)
- [Fuel and Incidents](./fuel-and-incidents.md)

Supporting workflow specifications, not separate modules:

- [Vehicle Load Manifest](./vehicle-load-manifest.md), part of Load Planning
- [Delivery Confirmation](./delivery-confirmation.md), part of Delivery Trips and Dispatch

### Vehicle Types

Defines reusable vehicle classifications such as Truck, Van, Motorcycle, Trailer, Prime Mover, and Reefer Truck. A type may provide default capacity and specification values when a delivery vehicle is registered.

Included sections:

- General information
- Default body type
- Default capacity and dimensions
- Default specifications
- Refrigerated and hazardous-goods settings
- Active or inactive status

### Delivery Vehicles

Lists and maintains the actual vehicles registered in the system. This is the vehicle master list, not a repair or servicing page.

Included sections:

- General vehicle information
- Identification and registration numbers
- Capacity and cargo dimensions
- Vehicle specifications
- Ownership and acquisition details
- Assigned company, branch, warehouse, driver, and responsibility center
- Current availability and operational status
- Registration, insurance, emission test, permits, warranties, and attachments
- Current odometer and engine-hour summary
- Audit trail

### Vehicle Operations

Manages the daily use and movement of delivery vehicles.

Included sections or views:

- Vehicle availability board
- Available, Reserved, In Use, Under Inspection, Under Maintenance, Out of Service, and Retired statuses
- Vehicle, driver, helper, route, warehouse, and delivery-order assignments
- Dispatch and trip completion
- Planned and actual departure and return times
- Planned load, actual load, and capacity utilization
- GPS location, trip progress, route deviation, stops, idle time, and last-known location
- Pre-trip and post-trip inspections
- Fuel transactions, mileage, fuel expense, and fuel efficiency
- Breakdowns, accidents, damages, and other incidents
- Operational reports and alerts

### Maintenance and Repairs

Manages planned servicing, reported defects, repair work, vehicle components, maintenance cost, and downtime.

Included sections or views:

- Preventive-maintenance schedules
- Date-, odometer-, and engine-hour-based service intervals
- Maintenance calendar and reminders
- Inspection defects and maintenance requests
- Diagnosis and repair work performed
- Parts, labor, service provider, and cost
- Before-and-after odometer readings
- Service and repair history
- Tires, batteries, refrigeration units, GPS devices, and other major components
- Component installation, condition, rotation, service, and replacement history
- Vehicle downtime
- Maintenance reports and alerts

## Scope

- Maintain delivery vehicle types and their default characteristics.
- Register company-owned, leased, and rented delivery vehicles.
- Record vehicle identity, ownership, assignment, capacity, specifications, documents, and current readings.
- Show whether a vehicle is available, reserved, in use, under inspection, under maintenance, out of service, or retired.
- Assign eligible vehicles and drivers to delivery trips.
- Track dispatched vehicles, trip progress, stops, and last-known location.
- Record pre-trip and post-trip inspections.
- Record fuel, mileage, efficiency, and other operating information.
- Schedule date-based and usage-based preventive maintenance.
- Record defects, repairs, parts, labor, components, costs, and downtime.
- Track accidents, breakdowns, insurance claims, and supporting documents.
- Produce contextual reports and alerts without adding separate navigation modules.

## Recommended Implementation Phases

### Phase 1: Master Data

- Vehicle Types
- Delivery Vehicles

### Phase 2: Daily Operations

- Availability and status
- Assignment and dispatch
- Trip and location tracking
- Inspections
- Fuel and mileage
- Accidents and incidents

### Phase 3: Maintenance

- Preventive-maintenance scheduling
- Service and repairs
- Tires and components
- Maintenance cost and downtime

The phases describe the recommended implementation sequence. The final navigation remains limited to the four child modules.

## Shared Data Ownership

Each business record has one owning module. Other modules reference the owning record by ID and must not create duplicate vehicle, type, trip, or work-order master data.

| Data | Owning Module | Primary Reference | Used By |
| --- | --- | --- | --- |
| Vehicle type and default specifications | [Vehicle Types](./vehicle-types.md) | `vehicleTypeId` | Delivery Vehicles |
| Vehicle identity, capacity, ownership, documents, and current summary | [Delivery Vehicles](./delivery-vehicles.md) | `vehicleId` | Vehicle Operations; Maintenance and Repairs |
| Assignment, trip, inspection, fuel, tracking, and incident records | [Vehicle Operations](./vehicle-operations.md) | `vehicleOperationId`, `tripId`, or the related activity ID | Delivery Vehicles; Maintenance and Repairs |
| Planned allocation of delivery-order items to a trip and vehicle | [Load Planning](./load-planning.md) | `loadPlanId` | Vehicle Load Manifest; Delivery Trips and Dispatch |
| Final quantities physically loaded into a vehicle | [Vehicle Load Manifest](./vehicle-load-manifest.md) | `loadManifestId` | Delivery Trips and Dispatch; Delivery Confirmation |
| Dispatched trip, route, stops, and movement status | [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md) | `tripId` | Vehicle Operations; Delivery Confirmation; Maintenance and Repairs |
| Delivered, returned, rejected, damaged, or failed quantities | [Delivery Confirmation](./delivery-confirmation.md) | `deliveryConfirmationId` | Delivery Management; Inventory; Accounting |
| Maintenance schedule, work order, repair, part, labor, and component history | [Maintenance and Repairs](./maintenance-and-repairs.md) | `maintenanceScheduleId` or `workOrderId` | Delivery Vehicles; Vehicle Operations |

## Module Data Flow

```text
Vehicle Types
  | provides type, capacity, and specification defaults
  v
Delivery Vehicles
  | provides vehicle identity, capacity, status, documents, and current readings
  +------------------------------+
  v                              v
Vehicle Operations         Maintenance and Repairs
  | assignments, trips,          | schedules, work orders,
  | inspections, fuel,           | repairs, parts, components,
  | tracking, incidents          | cost, downtime
  +---------------+--------------+
                  |
                  | exchanges defects, status, odometer,
                  | downtime, and return-to-service results
                  v
            Vehicle current summary
```

### Cross-Module Rules

- Every Vehicle Operations and Maintenance and Repairs record references one vehicle through `vehicleId` from Delivery Vehicles.
- Vehicle name, plate number, type, ownership, capacity, and document details are read from Delivery Vehicles and are not copied as separate master data.
- Historical transactions may store an immutable display snapshot when required for audit, but the `vehicleId` remains the authoritative relationship.
- Vehicle Operations may update current operational status, current assignment, last-known location, and accepted odometer summary through controlled vehicle services.
- Maintenance and Repairs may update maintenance status, next-service summary, downtime, and last-service readings through controlled vehicle services.
- A maintenance work order created from an inspection or breakdown keeps both `vehicleId` and the originating `inspectionId`, `incidentId`, or `tripId`.
- A completed repair does not make a vehicle Available by itself; required completion inspection and return-to-service approval must pass first.

## Integration Points

- **Delivery Management:** supplies delivery orders, customer stops, routes, loads, and trip status.
- **Warehouse Management:** identifies the source and assigned warehouse.
- **Branch Management:** identifies the branch responsible for the vehicle.
- **Employee or Driver Management:** supplies driver, license, availability, and qualification information.
- **Item Management:** supplies item weight, volume, dimensions, handling, and temperature requirements for capacity checks.
- **Asset Management:** links company-owned vehicles to fixed-asset records, depreciation, and disposal.
- **Company and Responsibility Center:** establishes organizational ownership and accountability.
- **Inventory Management:** issues spare parts, tires, lubricants, and maintenance supplies.
- **Purchase Management:** handles repair services, replacement parts, fuel, and service-provider purchasing.
- **Accounting:** records fuel, maintenance, repair, insurance, depreciation, and other vehicle-related expenses.
- **GPS or Telematics Provider:** supplies location, movement, route, odometer, and engine-hour data when integrated.

## Product Rules

- Vehicle Types is configuration data; Delivery Vehicles contains the actual registered units.
- A vehicle must reference one valid vehicle type.
- Plate number, chassis number, VIN, and engine number identify a physical vehicle and must not be stored in Vehicle Types.
- Vehicle Type defaults may prefill a vehicle record, but authorized users may override them for the actual unit.
- Capacity belongs to the individual vehicle because vehicles of the same type may have different legal or physical limits.
- Only vehicles with an Available status and valid required documents may be assigned to a new delivery trip.
- A reserved vehicle cannot be assigned to another overlapping trip.
- A dispatched vehicle becomes In Use and returns to Available only after the trip is completed and required post-trip checks pass.
- A failed safety inspection, overdue critical maintenance, expired required document, or active repair may block vehicle assignment.
- An inspection defect may create a maintenance request and change the vehicle to Under Maintenance or Out of Service.
- Preventive-maintenance schedules and repair history must be stored separately from the Delivery Vehicles master record.
- Inactive or retired vehicles remain available for historical reference but cannot be selected for new assignments.
- Vehicle Tracking must retain its source and timestamp so users can distinguish live, delayed, and manually entered locations.
- Reports belong inside their related module; cross-module summaries may appear on the parent dashboard.
- Alerts use the shared notification experience and do not require a separate module.

## Suggested Navigation

- Parent label: `Delivery Vehicle Management`
- Child label: `Vehicle Types`
- Child label: `Delivery Vehicles`
- Child label: `Vehicle Operations`
- Child label: `Maintenance and Repairs`
