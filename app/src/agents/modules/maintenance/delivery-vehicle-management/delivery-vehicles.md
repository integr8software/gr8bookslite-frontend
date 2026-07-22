# Delivery Vehicles

Delivery Vehicles is the master list and registration module for the actual vehicles used in delivery operations. It is not a repair or preventive-maintenance module.

## Purpose

- View and search all registered delivery vehicles.
- Add, view, edit, activate, deactivate, or retire a vehicle record.
- Store each vehicle's identity, capacity, specifications, ownership, assignment, and documents.
- Provide reliable vehicle data to delivery, warehouse, driver, asset, and capacity-planning processes.

## List Page

The list should use a table because users need to scan, filter, sort, and compare many vehicle records.

### Recommended Columns

- Vehicle Code
- Plate Number
- Vehicle Name
- Vehicle Type
- Body Type
- Assigned Branch
- Assigned Warehouse
- Maximum Load Weight
- Maximum Cargo Volume
- Current Odometer
- Operational Status
- Record Status
- Actions

### Filters

- Search by vehicle code, plate number, vehicle name, brand, model, VIN, chassis number, or engine number.
- Vehicle Type
- Body Type
- Ownership Type
- Assigned Company
- Assigned Branch
- Assigned Warehouse
- Operational Status
- Record Status

### Summary Metrics

- Total Vehicles
- Available
- In Use
- Under Maintenance
- Out of Service
- Retired

## Vehicle Record Sections

### General Information

- Vehicle Code
- Plate Number
- Vehicle Name
- Vehicle Type
- Body Type
- Brand
- Model
- Year Model
- Color
- Operational Status
- Record Status

### Identification

- Engine Number
- Chassis Number
- VIN
- Registration Number
- Asset Number
- RFID or GPS Device ID

### Ownership and Assignment

- Ownership Type: Company-Owned, Leased, or Rented
- Owner or Leasing Company
- Assigned Company
- Assigned Branch
- Assigned Warehouse
- Default Driver
- Department or Responsibility Center
- Acquisition Date
- Acquisition Cost
- Lease Start Date
- Lease End Date

### Capacity and Dimensions

- Maximum Load Weight
- Weight Unit of Measurement
- Maximum Cargo Volume
- Volume Unit of Measurement
- Maximum Pallet Capacity
- Maximum Carton Capacity
- Cargo Length
- Cargo Width
- Cargo Height
- Gross Vehicle Weight
- Tare Weight
- Passenger or Crew Capacity

### Specifications

- Fuel Type: Diesel, Gasoline, Electric, or Hybrid
- Transmission
- Number of Axles
- Number of Wheels
- Engine Displacement
- Refrigerated Vehicle
- Minimum Temperature
- Maximum Temperature
- Hazardous Goods Allowed
- GPS Enabled

### Current Readings

- Current Odometer
- Odometer Unit of Measurement
- Initial Odometer
- Current Engine Hours
- Last Reading Date
- Average Fuel Consumption

Current readings are summary values only. Transaction-level fuel and mileage history is outside the current scope.

### Documents

- Registration Expiry
- Insurance Expiry
- Emission Test Expiry
- Permit Expiry
- Warranty Expiry
- Document Attachments

### Audit Information

- Created By
- Created At
- Last Updated By
- Last Updated At

## Key Rules

- Vehicle Code is required and unique within the company.
- Plate Number is required and unique within the company, subject to the organization's registration rules.
- Vehicle Type is required and must reference an active Vehicle Type record.
- VIN, chassis number, and engine number must be unique when provided.
- Maximum capacity values cannot be negative.
- Gross vehicle weight must not be lower than tare weight.
- Minimum temperature cannot be greater than maximum temperature.
- Temperature fields apply only when Refrigerated Vehicle is enabled.
- Lease dates apply only to leased or rented vehicles, and the end date cannot precede the start date.
- Acquisition details primarily apply to company-owned vehicles.
- A retired, inactive, or out-of-service vehicle cannot be selected for a new delivery assignment.
- Existing delivery and historical records must keep their vehicle reference when a vehicle is deactivated or retired.
- Vehicle Type defaults may prefill the form but do not replace the values saved for the individual vehicle.

## Status Meaning

Operational Status describes whether the physical vehicle can currently be used:

- Available
- In Use
- Under Maintenance
- Out of Service
- Retired

Record Status controls whether the master record is active in the system:

- Active
- Inactive

## Shared Data Contract

Delivery Vehicles owns the authoritative vehicle master record used by [Vehicle Operations](./vehicle-operations.md) and [Maintenance and Repairs](./maintenance-and-repairs.md).

### Vehicle Relationship

- Primary reference: `vehicleId`
- Type reference: `vehicleTypeId` from [Vehicle Types](./vehicle-types.md)
- All trip, inspection, tracking, fuel, incident, maintenance, repair, and component records must store `vehicleId`.
- Other modules display vehicle master fields but must not maintain duplicate vehicle records.

### Fields Provided to Vehicle Operations

| Delivery Vehicles Field | Vehicle Operations Usage |
| --- | --- |
| `vehicleId` | Required vehicle relationship on assignments and activities |
| Vehicle Code, Plate Number, and Vehicle Name | Vehicle selection and operational display |
| Vehicle Type and Body Type | Filtering and operational suitability |
| Maximum weight, volume, pallets, cartons, and cargo dimensions | Delivery capacity validation and utilization |
| Refrigerated and temperature settings | Temperature-controlled delivery validation |
| Hazardous Goods Allowed | Restricted-cargo eligibility |
| Assigned Company, Branch, and Warehouse | Assignment scope and access control |
| Default Driver | Optional assignment default |
| Operational Status | Availability and dispatch eligibility |
| Current Odometer and Engine Hours | Starting readings and usage calculations |
| Registration, insurance, emission, and permit expirations | Dispatch compliance validation |

### Fields Provided to Maintenance and Repairs

| Delivery Vehicles Field | Maintenance and Repairs Usage |
| --- | --- |
| `vehicleId` | Required relationship on schedules, work orders, and components |
| Vehicle Code, Plate Number, and Vehicle Name | Vehicle selection and work-order display |
| Vehicle Type, Brand, Model, and Year | Service requirements and technician reference |
| Engine Number, Chassis Number, and VIN | Identity verification and service documents |
| Current Odometer and Engine Hours | Maintenance due calculations and work-order readings |
| Fuel Type and vehicle specifications | Service planning and compatible parts or supplies |
| Operational Status | Determines whether maintenance blocks vehicle use |
| Assigned Branch and Warehouse | Workshop coordination and access scope |
| Warranty Expiry and attachments | Warranty validation and repair support |

### Summary Fields Updated by Other Modules

The vehicle master may expose current summary fields maintained through controlled cross-module services:

- Vehicle Operations: `operationalStatus`, `currentTripId`, `currentDriverId`, `lastKnownLocation`, `lastLocationAt`, `currentOdometer`, and `lastReadingDate`.
- Maintenance and Repairs: `operationalStatus`, `activeWorkOrderId`, `lastServiceDate`, `lastServiceOdometer`, `nextServiceDate`, `nextServiceOdometer`, and current downtime state.
- Historical transaction records remain in their owning modules; Delivery Vehicles stores only the latest operational summary.

## Suggested Frontend Placement

- Route: `/maintenance/delivery-vehicles`
- Feature source: `app/src/ui/modules/maintenance/delivery-vehicles`

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Vehicle Types](./vehicle-types.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Maintenance and Repairs](./maintenance-and-repairs.md)
