# Delivery Vehicle Management Overview

Delivery Vehicle Management is consolidated into five main modules. Standalone setup or operational pages that duplicated the same lifecycle are merged into the nearest operational module.

## Sidebar Modules

1. Delivery Vehicles
2. Vehicle Scheduling & Assignment
3. Delivery Planning & Dispatch
4. Trip Monitoring
5. Vehicle Repair and Maintenance

## Module Workspaces

### Delivery Vehicles (`DVE`)

Combines vehicle records and vehicle type setup.

Workspaces:
- Vehicles
- Vehicle Types
- Capacity & Specifications
- Ownership & Assignment
- Registration Details
- Status

### Vehicle Scheduling & Assignment (`DVAS`)

Combines vehicle availability and vehicle assignment.

Workspaces:
- Availability Calendar
- Vehicle Assignments
- Driver Assignments
- Reservation History
- Conflict Warnings

Availability should be derived from assignments, delivery trips, inspections, and maintenance schedules.

### Delivery Planning & Dispatch (`DVD`)

Combines load planning with trip scheduling and dispatch.

Process:
- Select deliveries or orders
- Create load plan
- Assign vehicle and driver
- Validate capacity
- Arrange delivery sequence
- Dispatch trip

Workspaces:
- Unplanned Deliveries
- Load Plans
- Scheduled Trips
- Dispatched Trips
- Completed Trips

### Trip Monitoring (`DVTK`)

Combines trip tracking with fuel, expenses, delays, incidents, and proof of delivery.

Workspaces:
- Live Trips
- Trip Timeline
- Fuel Logs
- Expenses
- Delays
- Incidents
- Proof of Delivery

Fuel can become its own module later if it grows into fuel inventory, fuel cards, suppliers, consumption analysis, or reimbursements.

### Vehicle Repair and Maintenance (`DVMR`)

Combines inspections with maintenance and repair workflows.

Workspaces:
- Inspection Schedule
- Inspection Results
- Reported Defects
- Maintenance Requests
- Repair Work Orders
- Service History
- Maintenance Schedule

Inspection findings can generate maintenance requests or repair work orders.