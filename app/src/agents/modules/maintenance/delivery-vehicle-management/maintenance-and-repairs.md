# Maintenance and Repairs

Maintenance and Repairs manages scheduled servicing, inspection defects, unexpected repairs, replaceable components, maintenance cost, service history, and vehicle downtime.

## Purpose

- Keep delivery vehicles safe and roadworthy.
- Schedule preventive maintenance by date or usage.
- Convert defects and breakdowns into controlled maintenance or repair work.
- Record parts, labor, service providers, costs, attachments, and approvals.
- Track tires and other high-value components through their lifecycle.
- Prevent unavailable or unsafe vehicles from being dispatched.

## Main Views

### Maintenance Dashboard

Recommended metrics:

- Due Soon
- Overdue
- Under Maintenance
- Out of Service
- Open Repair Orders
- Awaiting Parts
- Completed This Month
- Maintenance Cost This Month
- Total Downtime

### Preventive Maintenance Schedule

Defines recurring service requirements for a vehicle or vehicle type.

Recommended fields:

- Schedule Code
- Vehicle or Vehicle Type
- Maintenance Type
- Schedule Basis: Date, Odometer, Engine Hours, or Combined
- Date Interval
- Odometer Interval
- Engine-Hour Interval
- Last Service Date
- Last Service Odometer
- Last Service Engine Hours
- Next Service Date
- Next Service Odometer
- Next Service Engine Hours
- Reminder Lead Time or Usage
- Maintenance Checklist
- Preferred Workshop or Service Provider
- Estimated Cost
- Schedule Status

Examples include oil change, brake inspection, tire rotation, engine tune-up, battery inspection, and refrigeration-unit servicing.

### Maintenance and Repair Orders

Controls planned service and unexpected repair work.

Recommended fields:

- Work Order Number
- Work Type: Preventive Maintenance, Corrective Repair, Inspection Defect, or Breakdown
- Vehicle
- Related Schedule
- Related Inspection, Trip, Breakdown, or Incident
- Complaint or Reported Defect
- Diagnosis
- Work Required
- Priority
- Assigned Workshop or Technician
- Service Provider
- Planned Start and Completion
- Actual Start and Completion
- Starting and Ending Odometer
- Starting and Ending Engine Hours
- Parts Cost
- Labor Cost
- Other Cost
- Total Cost
- Downtime
- Work Status
- Attachments
- Approval and Completion Details

### Parts and Labor

Records the resources consumed by a maintenance or repair order.

Recommended fields:

- Part, Material, or Service
- Inventory Item or Purchase Reference
- Description
- Quantity
- Unit of Measurement
- Unit Cost
- Total Cost
- Technician or Service Provider
- Labor Hours
- Labor Rate
- Removed Component
- Installed Component

### Tires and Components

Tracks replaceable or high-value vehicle components.

Recommended fields:

- Component Type
- Serial Number
- Vehicle
- Position
- Brand and Model
- Supplier
- Acquisition Date and Cost
- Installation Date
- Installation Odometer or Engine Hours
- Current Condition
- Rotation or Transfer History
- Service History
- Removal Date and Reading
- Replacement Reason
- Warranty Expiry
- Component Status

Tracked components may include tires, batteries, refrigeration units, GPS devices, alternators, and other major parts.

### Service History

Provides a permanent chronological history of completed work for each vehicle.

Recommended information:

- Service or Repair Date
- Work Order
- Maintenance or Repair Type
- Odometer and Engine Hours
- Work Performed
- Parts and Labor
- Service Provider
- Total Cost
- Downtime
- Attachments
- Completed and Approved By

## Work Order Status Flow

```text
Draft
  `-- submit ----------------> Open

Open
  |-- approve and schedule --> Scheduled
  `-- cancel ----------------> Cancelled

Scheduled
  `-- begin work ------------> In Progress

In Progress
  |-- wait for parts --------> Awaiting Parts
  |-- finish work -----------> For Inspection
  `-- cancel with reason ----> Cancelled

Awaiting Parts
  `-- resume work -----------> In Progress

For Inspection
  |-- pass ------------------> Completed
  `-- fail ------------------> In Progress
```

Completed and Cancelled records are retained for audit and history.

## Key Rules

- A preventive-maintenance schedule may apply to one vehicle or provide defaults by vehicle type.
- A combined schedule becomes due when any configured date or usage threshold is reached.
- Critical overdue maintenance blocks new vehicle assignments.
- Opening approved maintenance or repair work changes the vehicle to Under Maintenance when the vehicle cannot be used.
- Unsafe vehicles must use Out of Service instead of Under Maintenance.
- A work order cannot be completed without actual completion information and a final odometer or engine-hour reading when applicable.
- Ending odometer and engine hours cannot be lower than their starting values without an authorized correction.
- Parts and labor totals must reconcile with the work-order total.
- Inventory-managed parts must reference an approved stock issue or adjustment.
- Outsourced repairs must reference the appropriate supplier, service, or purchase record when required.
- A failed completion inspection returns the work order to In Progress.
- Returning a vehicle to Available requires completion approval and any required safety inspection.
- Completed work orders and component histories cannot be deleted; corrections must remain auditable.
- Editing a maintenance schedule must not rewrite completed service history.

## Reports and Alerts

- Maintenance Due Soon
- Overdue Maintenance
- Open and Delayed Work Orders
- Vehicles Under Maintenance
- Vehicles Out of Service
- Repair and Maintenance History
- Vehicle Downtime
- Cost by Vehicle
- Cost by Maintenance or Repair Type
- Parts and Labor Usage
- Tire and Component Replacement
- Warranty Expiry

## Integration Points

- **Delivery Vehicles:** vehicle identity, readings, status, and service history.
- **Vehicle Operations:** inspection defects, breakdowns, incidents, availability, and return-to-service status.
- **Inventory Management:** spare-parts, tires, lubricant, and supply issues.
- **Purchase Management:** external services, replacement parts, and service providers.
- **Accounting:** maintenance expense, repair expense, payable, and vehicle cost reporting.
- **Asset Management:** capitalized improvements, component assets, warranty, and disposal.
- **Employee Management:** internal technician and approver information.

## Shared Data Contract

Maintenance and Repairs does not create a separate vehicle master. It selects and references a vehicle owned by [Delivery Vehicles](./delivery-vehicles.md) and may receive defects, breakdowns, or incidents from [Vehicle Operations](./vehicle-operations.md).

### Vehicle Fields Consumed from Delivery Vehicles

| Source Field | Maintenance and Repair Usage |
| --- | --- |
| `vehicleId` | Required relationship on schedules, work orders, parts usage, and component history |
| Vehicle Code, Plate Number, and Vehicle Name | Vehicle picker and work-order header |
| Vehicle Type, Body Type, Brand, Model, and Year | Maintenance plan, service checklist, and technician reference |
| Engine Number, Chassis Number, and VIN | Identity verification and external service documents |
| Current Odometer and Engine Hours | Due calculation and starting readings |
| Fuel Type, axle count, and other specifications | Compatible service, part, tire, and supply selection |
| Refrigerated Vehicle | Refrigeration-unit maintenance requirements |
| Assigned Company, Branch, and Warehouse | Access, custody, and workshop coordination |
| Operational Status | Vehicle-use blocking and return-to-service workflow |
| Warranty Expiry and attachments | Warranty claim and repair authorization |

### Records Received from Vehicle Operations

| Source Record | Relationship Retained | Maintenance Usage |
| --- | --- | --- |
| Failed Inspection | `inspectionId`, `vehicleId`, optional `tripId` | Creates an inspection-defect work order |
| Breakdown | `incidentId`, `vehicleId`, optional `tripId` | Creates an urgent corrective-repair work order |
| Accident Damage | `incidentId`, `vehicleId`, optional `tripId` | Creates repair work linked to the incident and claim |
| Trip or Fuel Reading | `tripId` or `fuelEntryId`, `vehicleId` | Updates accepted odometer or engine-hour basis for due schedules |

### Maintenance Records Produced

| Record | Primary Relationships | Shared Result |
| --- | --- | --- |
| Maintenance Schedule | `maintenanceScheduleId`, `vehicleId` or `vehicleTypeId` | Next due date, odometer, or engine hours |
| Work Order | `workOrderId`, `vehicleId`, optional source activity ID | Maintenance status, expected completion, cost, and downtime |
| Service History | `serviceHistoryId`, `vehicleId`, `workOrderId` | Last service summary and permanent history |
| Component History | `componentId`, `vehicleId`, optional `workOrderId` | Installed component, position, condition, and replacement history |

### Data Sent Back to Delivery Vehicles and Vehicle Operations

- `operationalStatus`: Under Maintenance, Out of Service, or eligible for Available.
- `activeWorkOrderId` and work-order status.
- Expected completion and current downtime.
- Last service date, odometer, and engine hours.
- Next service date, odometer, and engine hours.
- Completion inspection requirement and return-to-service result.

Maintenance completion alone must not directly set the vehicle to Available when a completion inspection is required. Vehicle Operations records the inspection and applies the final operational status.

## Suggested Frontend Placement

- Route: `/maintenance/vehicle-maintenance-repairs`
- Feature source: `app/src/ui/modules/maintenance/vehicle-maintenance-repairs`

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Vehicle Types](./vehicle-types.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
