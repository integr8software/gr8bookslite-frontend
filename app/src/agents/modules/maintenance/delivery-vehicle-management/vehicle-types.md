# Vehicle Types

Vehicle Types maintains the reusable classifications applied to delivery vehicle records. Examples include Truck, Van, Motorcycle, Trailer, Prime Mover, and Reefer Truck.

## Purpose

- Standardize how delivery vehicles are classified.
- Supply default capacity and specification values during vehicle registration.
- Support filtering, reporting, and delivery-capacity planning by vehicle type.
- Avoid repeatedly entering common characteristics for vehicles of the same type.

## List Page

### Recommended Columns

- Type Code
- Vehicle Type Name
- Description
- Default Body Type
- Default Maximum Load Weight
- Default Maximum Cargo Volume
- Refrigerated
- Hazardous Goods Allowed
- Number of Registered Vehicles
- Status
- Actions

### Filters

- Search by type code, name, or description.
- Body Type
- Refrigerated
- Hazardous Goods Allowed
- Status

## Vehicle Type Fields

### General Information

- Type Code
- Vehicle Type Name
- Description
- Default Body Type
- Status

### Default Capacity

- Default Maximum Load Weight
- Default Weight Unit of Measurement
- Default Maximum Cargo Volume
- Default Volume Unit of Measurement
- Default Maximum Pallet Capacity
- Default Maximum Carton Capacity
- Default Cargo Length
- Default Cargo Width
- Default Cargo Height
- Default Gross Vehicle Weight
- Default Tare Weight
- Default Passenger or Crew Capacity

### Default Specifications

- Default Fuel Type
- Default Transmission
- Default Number of Axles
- Default Number of Wheels
- Refrigerated
- Default Minimum Temperature
- Default Maximum Temperature
- Hazardous Goods Allowed
- GPS Expected

## Key Rules

- Type Code is required and unique within the company.
- Vehicle Type Name is required and unique within the company.
- Default capacity values cannot be negative.
- Default gross vehicle weight must not be lower than default tare weight.
- Default minimum temperature cannot be greater than default maximum temperature.
- Temperature defaults apply only when Refrigerated is enabled.
- Type defaults prefill new Delivery Vehicle records and remain editable on the individual vehicle.
- Editing a type's defaults must not silently change existing vehicle records.
- A type referenced by a vehicle cannot be deleted; it may be deactivated instead.
- An inactive type remains visible on existing records but cannot be selected for a new vehicle.
- Physical identifiers such as plate number, VIN, chassis number, engine number, and registration number never belong to a Vehicle Type.

## Shared Data Contract

Vehicle Types owns the classification record consumed by [Delivery Vehicles](./delivery-vehicles.md).

### Fields Provided to Delivery Vehicles

| Vehicle Types Field | Delivery Vehicles Usage |
| --- | --- |
| `vehicleTypeId` | Required relationship stored on the vehicle record |
| `typeCode` | Displays and searches the vehicle classification |
| `typeName` | Displays the human-readable vehicle type |
| `defaultBodyType` | Prefills Body Type during vehicle registration |
| `defaultMaximumLoadWeight` and `defaultWeightUom` | Prefill vehicle weight capacity |
| `defaultMaximumCargoVolume` and `defaultVolumeUom` | Prefill vehicle volume capacity |
| Default pallet, carton, and cargo dimensions | Prefill vehicle capacity and dimensions |
| Default gross weight, tare weight, and crew capacity | Prefill vehicle physical limits |
| Default fuel, transmission, axle, and wheel values | Prefill vehicle specifications |
| Refrigerated and temperature defaults | Prefill temperature-control settings |
| Hazardous-goods and GPS defaults | Prefill special capability settings |
| `status` | Controls whether the type can be selected for a new vehicle |

### Relationship Rules

- Delivery Vehicles stores `vehicleTypeId` as the relationship to Vehicle Types.
- Selecting a type copies its current defaults into the new vehicle form for review.
- Saved vehicle values belong to Delivery Vehicles and may differ from the type defaults.
- Later changes to a Vehicle Type do not overwrite existing vehicle records.
- Vehicle Operations and Maintenance and Repairs obtain vehicle type information through the selected Delivery Vehicle, not by creating a second type relationship.

## Example Records

| Type Code | Vehicle Type Name | Typical Use |
| --- | --- | --- |
| TRUCK | Truck | General high-capacity deliveries |
| VAN | Van | Enclosed urban deliveries |
| MOTOR | Motorcycle | Small and urgent deliveries |
| TRAILER | Trailer | Towed cargo transport |
| PRIME | Prime Mover | Pulling trailers or containers |
| REEFER | Reefer Truck | Temperature-controlled deliveries |

## Suggested Frontend Placement

- Route: `/maintenance/vehicle-types`
- Feature source: `app/src/ui/modules/maintenance/vehicle-types`

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Maintenance and Repairs](./maintenance-and-repairs.md)
