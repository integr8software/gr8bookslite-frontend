# Trip Tracking

Trip Tracking is a submodule of [Vehicle Operations](./vehicle-operations.md). It monitors dispatched delivery trips, vehicle location, stop progress, route movement, delays, and tracking alerts.

## Purpose

- Show the live or last-known location of vehicles currently in use.
- Monitor progress against the planned route and stop schedule.
- Record arrival, departure, idle time, delay, and route deviation.
- Distinguish live, delayed, manually entered, and unavailable tracking data.
- Provide operational evidence for delivery, incident, and trip history.

## Record Ownership

- Primary event: `trackingEventId`
- Required relationships: `tripId` and `vehicleId`
- Trip and stops come from [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md).
- Vehicle identity comes from [Delivery Vehicles](./delivery-vehicles.md).

## Tracking Fields

- `trackingEventId`
- `tripId`
- `vehicleId`
- Event Type
- Latitude and Longitude
- Address or Location Description
- Location Source
- Source Device ID
- Captured At
- Received At
- Speed
- Heading
- Accuracy
- Odometer and Engine Hours when supplied
- Ignition State
- Idle Duration
- Related `tripStopId`
- Route Deviation Distance
- Tracking Quality or Status
- Recorded By for manual entries

## Tracking Sources

- GPS or telematics provider
- Driver mobile application
- Warehouse departure or return scan
- Customer stop arrival or confirmation
- Authorized manual update

## Main Views

- Active Trips Map
- Trip Timeline
- Stop Progress
- Vehicle Last Known Location
- Delayed or Offline Devices
- Route Deviation Alerts
- Excessive Idle Alerts
- Trip Tracking History

## Key Rules

- Every tracking event stores its source, capture time, and receive time.
- Tracking events are append-only; corrections create a new event or audit adjustment.
- A delayed location must not be labeled live.
- Manual entries identify the entering user and reason.
- Stop arrival may be suggested by geofence detection but requires the configured confirmation rule.
- Route deviation and idle alerts use configurable thresholds.
- Tracking must respect user access to the vehicle's company, branch, warehouse, and trip.
- Tracking loss does not automatically cancel or fail a trip; it creates an alert.
- Accepted telematics readings may update the vehicle's current odometer or engine-hour summary through a controlled service.
- Sensitive location retention and visibility follow company privacy policy.

## Suggested Frontend Placement

- Route: `/maintenance/vehicle-operations/tracking`
- Feature source: `app/src/ui/modules/maintenance/vehicle-operations/tracking`

## Related Documentation

- [Delivery Vehicle Management](./delivery-vehicle-management.md)
- [Delivery Vehicles](./delivery-vehicles.md)
- [Vehicle Operations](./vehicle-operations.md)
- [Vehicle Availability](./vehicle-availability.md)
- [Delivery Trips and Dispatch](./delivery-trips-and-dispatch.md)
- [Fuel and Incidents](./fuel-and-incidents.md)

