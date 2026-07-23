# Location Availability

Location Availability manages operational availability for storage locations.

## Scope

- UI shell only.
- Future backend should persist availability changes with audit details.

## Recommended Statuses

- Available
- Reserved
- Blocked
- Under Maintenance
- Quality Hold
- Inactive

## Recommended Fields

- Warehouse
- Location
- Availability Status
- Reason
- Effective Date
- Expected Available Date
- Changed By

## Key Rules

- Availability is manually controlled operational state.
- Occupied, partially occupied, and full should be calculated inventory state.
- Blocking a location must not automatically inactivate the warehouse.
