# TransitOps Smart Transport Operations Platform - API Documentation

## Overview

Complete REST API for managing transport operations including vehicles, drivers, trips, maintenance, fuel, and expenses.

**Base URL:** `http://localhost:8080/api`  
**Backend Version:** Spring Boot 4.1.0  
**Database:** PostgreSQL (localhost:5432, schema: transitops)

---

## Table of Contents

1. [Response Format](#response-format)
2. [Vehicle Management](#vehicle-management)
3. [Driver Management](#driver-management)
4. [Trip Management](#trip-management)
5. [Maintenance Management](#maintenance-management)
6. [Fuel Management](#fuel-management)
7. [Expense Management](#expense-management)
8. [Error Handling](#error-handling)
9. [Business Logic & State Transitions](#business-logic--state-transitions)

---

## Response Format

### Success Response (2xx)

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Resource data here
  }
}
```

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 201 | Created (POST successful) |
| 200 | OK (GET/PUT/DELETE successful) |
| 400 | Bad Request (Validation failed) |
| 404 | Not Found (Resource doesn't exist) |
| 409 | Conflict (Duplicate unique field) |
| 500 | Internal Server Error |

---

## Vehicle Management

**Endpoint Base:** `/api/vehicles`

### 1. Create Vehicle

**POST** `/api/vehicles`

**Status:** 201 Created

**Request Body:**
```json
{
  "registrationNumber": "ABC-123",
  "name": "Semi-Truck 01",
  "type": "Semi-Truck",
  "maxLoadCapacity": 5000.00,
  "acquisitionCost": 150000.00,
  "region": "North"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "registrationNumber": "ABC-123",
    "name": "Semi-Truck 01",
    "type": "Semi-Truck",
    "maxLoadCapacity": 5000.00,
    "odometer": 0.00,
    "acquisitionCost": 150000.00,
    "status": "AVAILABLE",
    "region": "North",
    "createdAt": "2026-07-12T13:49:33.000+05:30"
  }
}
```

**Validation Rules:**
- `registrationNumber` (unique, required): Cannot have duplicates
- `maxLoadCapacity` (required): Must be positive number
- `acquisitionCost` (required): Must be positive number

**Test Cases:**
- ✅ Create vehicle with valid data → 201 Created
- ✅ Create duplicate registration → 400 Bad Request
- ✅ Missing required fields → 400 Bad Request

**Business Logic:**
- Default status set to `AVAILABLE`
- Default odometer initialized to `0.00`
- CreatedAt timestamp set automatically

---

### 2. Get Single Vehicle

**GET** `/api/vehicles/{id}`

**Status:** 200 OK

**Path Parameters:**
- `id` (UUID): Vehicle identifier

**Response:**
```json
{
  "success": true,
  "message": "Vehicle retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "registrationNumber": "ABC-123",
    "name": "Semi-Truck 01",
    "type": "Semi-Truck",
    "maxLoadCapacity": 5000.00,
    "odometer": 520.00,
    "acquisitionCost": 150000.00,
    "status": "AVAILABLE",
    "region": "North",
    "createdAt": "2026-07-12T13:49:33.000+05:30"
  }
}
```

**Error Scenarios:**
- ✅ Vehicle not found → 404 Not Found
- ✅ Invalid UUID format → 400 Bad Request

---

### 3. Get All Vehicles

**GET** `/api/vehicles`

**Status:** 200 OK

**Query Parameters:**
- `status` (optional): Filter by status (AVAILABLE, ON_TRIP, IN_SHOP, RETIRED)

**Examples:**
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles?status=AVAILABLE` - Get available vehicles only
- `GET /api/vehicles?status=ON_TRIP` - Get vehicles currently on trip

**Response:**
```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "registrationNumber": "ABC-123",
      "status": "AVAILABLE",
      ...
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "registrationNumber": "ABC-124",
      "status": "ON_TRIP",
      ...
    }
  ]
}
```

**Test Cases:**
- ✅ Get all vehicles → 200 OK with full list
- ✅ Filter by AVAILABLE status → 200 OK with filtered results
- ✅ Filter by ON_TRIP status → 200 OK with on-trip vehicles
- ✅ Empty list when no vehicles match filter → 200 OK with empty array

---

### 4. Update Vehicle

**PUT** `/api/vehicles/{id}`

**Status:** 200 OK

**Path Parameters:**
- `id` (UUID): Vehicle identifier

**Request Body:**
```json
{
  "name": "Updated Truck Name",
  "maxLoadCapacity": 6000.00,
  "region": "South"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "registrationNumber": "ABC-123",
    "name": "Updated Truck Name",
    "maxLoadCapacity": 6000.00,
    "region": "South",
    "status": "AVAILABLE",
    ...
  }
}
```

**Updatable Fields:**
- `name`, `type`, `region`, `maxLoadCapacity`, `acquisitionCost`

**Non-Updatable Fields:**
- `id`, `registrationNumber`, `odometer`, `status`, `createdAt`

**Test Cases:**
- ✅ Update name only → 200 OK
- ✅ Update capacity → 200 OK
- ✅ Update non-existent vehicle → 404 Not Found
- ✅ Partial updates → 200 OK with merged changes

---

### 5. Delete Vehicle

**DELETE** `/api/vehicles/{id}`

**Status:** 200 OK

**Path Parameters:**
- `id` (UUID): Vehicle identifier

**Response:**
```json
{
  "success": true,
  "message": "Vehicle deleted successfully",
  "data": null
}
```

**Cascade Behavior:**
- Related trips, maintenance logs, fuel logs, and expenses are NOT deleted
- Vehicle status is set to RETIRED before deletion (logical delete option)

**Test Cases:**
- ✅ Delete existing vehicle → 200 OK
- ✅ Subsequent GET returns 404 Not Found
- ✅ Delete non-existent vehicle → 404 Not Found

---

## Driver Management

**Endpoint Base:** `/api/drivers`

### 1. Create Driver

**POST** `/api/drivers`

**Status:** 201 Created

**Request Body:**
```json
{
  "licenseNumber": "DL-123456",
  "name": "John Doe",
  "licenseCategory": "HMV",
  "licenseExpiryDate": "2027-07-12",
  "contactNumber": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Driver created successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "licenseNumber": "DL-123456",
    "name": "John Doe",
    "licenseCategory": "HMV",
    "licenseExpiryDate": "2027-07-12",
    "contactNumber": "9876543210",
    "safetyScore": 100,
    "status": "AVAILABLE",
    "createdAt": "2026-07-12T13:49:33.000+05:30"
  }
}
```

**Validation Rules:**
- `licenseNumber` (unique, required): Cannot have duplicates
- `licenseExpiryDate` (required): Must not be in the past (validated at service layer)
- `name`, `contactNumber` (required): Cannot be empty

**Test Cases:**
- ✅ Create driver with valid data → 201 Created
- ✅ Create driver with expired license → 400 Bad Request
- ✅ Duplicate license number → 400 Bad Request
- ✅ Missing required fields → 400 Bad Request

**Business Logic:**
- Default safety score: 100
- Default status: AVAILABLE
- License expiry validation: Cannot be before today's date

---

### 2. Get Single Driver

**GET** `/api/drivers/{id}`

**Status:** 200 OK

**Response:** Similar structure to Create Driver response

**Error Scenarios:**
- ✅ Driver not found → 404 Not Found

---

### 3. Get All Drivers

**GET** `/api/drivers`

**Query Parameters:**
- `status` (optional): Filter by status (AVAILABLE, ON_TRIP, OFF_DUTY, SUSPENDED)

**Examples:**
- `GET /api/drivers?status=AVAILABLE`
- `GET /api/drivers?status=SUSPENDED`

**Test Cases:**
- ✅ Get all drivers → 200 OK
- ✅ Filter by status → 200 OK with filtered results
- ✅ Empty result on no matches → 200 OK with empty array

---

### 4. Update Driver

**PUT** `/api/drivers/{id}`

**Status:** 200 OK

**Request Body:**
```json
{
  "name": "Jane Doe",
  "safetyScore": 95,
  "contactNumber": "9876543211"
}
```

**Updatable Fields:**
- `name`, `contactNumber`, `safetyScore`, `licenseExpiryDate`

**Validation on Update:**
- `licenseExpiryDate`: Must not be in past if updated

**Test Cases:**
- ✅ Update safety score → 200 OK
- ✅ Update name → 200 OK
- ✅ Update with expired license → 400 Bad Request

---

### 5. Delete Driver

**DELETE** `/api/drivers/{id}`

**Status:** 200 OK

**Response:**
```json
{
  "success": true,
  "message": "Driver deleted successfully",
  "data": null
}
```

**Test Cases:**
- ✅ Delete existing driver → 200 OK
- ✅ Subsequent GET returns 404 Not Found

---

## Trip Management

**Endpoint Base:** `/api/trips`

### 1. Create Trip

**POST** `/api/trips`

**Status:** 201 Created

**Request Body:**
```json
{
  "vehicleId": "550e8400-e29b-41d4-a716-446655440000",
  "driverId": "660e8400-e29b-41d4-a716-446655440001",
  "createdById": "770e8400-e29b-41d4-a716-446655440002",
  "source": "City A - Warehouse",
  "destination": "City B - Distribution Hub",
  "cargoWeight": 2500.00,
  "plannedDistance": 500.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "vehicleName": "Semi-Truck 01",
    "vehicleId": "550e8400-e29b-41d4-a716-446655440000",
    "driverName": "John Doe",
    "driverId": "660e8400-e29b-41d4-a716-446655440001",
    "createdByName": "Admin User",
    "createdById": "770e8400-e29b-41d4-a716-446655440002",
    "source": "City A - Warehouse",
    "destination": "City B - Distribution Hub",
    "cargoWeight": 2500.00,
    "plannedDistance": 500.00,
    "actualDistance": null,
    "status": "DRAFT",
    "dispatchedAt": null,
    "completedAt": null,
    "createdAt": "2026-07-12T13:49:33.000+05:30"
  }
}
```

**Validation Rules:**
- `vehicleId`, `driverId`, `createdById` (required): Must reference existing entities
- `cargoWeight` (required): Must be ≤ vehicle's maxLoadCapacity
- `plannedDistance` (required): Must be positive number
- Vehicle must be in AVAILABLE status
- Driver must be in AVAILABLE status

**Test Cases:**
- ✅ Create trip with valid data → 201 Created
- ✅ Cargo exceeds capacity → 400 Bad Request
- ✅ Vehicle not available → 400 Bad Request
- ✅ Driver not available → 400 Bad Request
- ✅ Non-existent vehicle ID → 400 Bad Request

**Business Logic:**
- Initial status: DRAFT
- No status change to vehicle/driver yet
- dispatchedAt and completedAt remain null
- actualDistance starts as null

---

### 2. Get Single Trip

**GET** `/api/trips/{id}`

**Status:** 200 OK

**Response:** Trip object with all relationships populated

**Test Cases:**
- ✅ Get existing trip → 200 OK
- ✅ Trip not found → 404 Not Found

---

### 3. Get All Trips

**GET** `/api/trips`

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, DISPATCHED, COMPLETED, CANCELLED)

**Examples:**
- `GET /api/trips` - All trips
- `GET /api/trips?status=DISPATCHED` - Only dispatched trips
- `GET /api/trips?status=COMPLETED` - Only completed trips

**Test Cases:**
- ✅ Get all trips → 200 OK
- ✅ Filter by DRAFT status → 200 OK with pending trips
- ✅ Filter by DISPATCHED → 200 OK with active trips
- ✅ Empty result on no matches → 200 OK with empty array

---

### 4. Dispatch Trip

**POST** `/api/trips/{id}/dispatch`

**Status:** 200 OK

**Path Parameters:**
- `id` (UUID): Trip identifier

**Request Body:** Empty

**Response:**
```json
{
  "success": true,
  "message": "Trip dispatched successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "status": "DISPATCHED",
    "dispatchedAt": "2026-07-12T14:00:00.000+05:30",
    ...
  }
}
```

**State Transition Logic:**
- **Before:** Trip status = DRAFT, Vehicle status = AVAILABLE, Driver status = AVAILABLE
- **After:** Trip status = DISPATCHED, Vehicle status = ON_TRIP, Driver status = ON_TRIP
- Timestamp: `dispatchedAt` set to current time

**Validation:**
- Trip must be in DRAFT status (cannot redispatch DISPATCHED trips)
- Vehicle must be AVAILABLE (cannot dispatch if already on another trip)
- Driver must be AVAILABLE

**Test Cases:**
- ✅ Dispatch DRAFT trip → 200 OK with status update
- ✅ Verify vehicle status changed to ON_TRIP
- ✅ Verify driver status changed to ON_TRIP
- ✅ Dispatch already dispatched trip → 400 Bad Request
- ✅ Dispatch non-existent trip → 404 Not Found

---

### 5. Complete Trip

**POST** `/api/trips/{id}/complete`

**Status:** 200 OK

**Request Body:**
```json
{
  "tripId": "880e8400-e29b-41d4-a716-446655440003",
  "actualDistance": 520.50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip completed successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "status": "COMPLETED",
    "actualDistance": 520.50,
    "completedAt": "2026-07-12T16:30:00.000+05:30",
    ...
  }
}
```

**State Transition Logic:**
- **Before:** Trip status = DISPATCHED, Vehicle status = ON_TRIP, Driver status = ON_TRIP
- **After:** Trip status = COMPLETED, Vehicle status = AVAILABLE, Driver status = AVAILABLE
- Side Effect 1: Vehicle odometer incremented by actualDistance
- Side Effect 2: Timestamps updated (completedAt set)

**Example:**
- Vehicle odometer before: 520.00 km
- Actual distance: 80.50 km
- Vehicle odometer after: 600.50 km

**Validation:**
- Trip must be in DISPATCHED status (cannot complete draft/cancelled/completed trips)
- `actualDistance` must be positive number
- `tripId` must match path parameter

**Test Cases:**
- ✅ Complete dispatched trip → 200 OK
- ✅ Verify vehicle odometer updated correctly
- ✅ Verify both vehicle and driver statuses reset to AVAILABLE
- ✅ Complete DRAFT trip → 400 Bad Request
- ✅ Complete already completed trip → 400 Bad Request
- ✅ actualDistance mismatch in body → 400 Bad Request

---

### 6. Cancel Trip

**POST** `/api/trips/{id}/cancel`

**Status:** 200 OK

**Request Body:** Empty

**Response:**
```json
{
  "success": true,
  "message": "Trip cancelled successfully",
  "data": null
}
```

**State Transition Logic:**
- **Case 1 - DRAFT Trip:**
  - Trip status: DRAFT → CANCELLED
  - No vehicle/driver status changes (still AVAILABLE)
  
- **Case 2 - DISPATCHED Trip:**
  - Trip status: DISPATCHED → CANCELLED
  - Vehicle status: ON_TRIP → AVAILABLE
  - Driver status: ON_TRIP → AVAILABLE
  - Side Effect: Reverts availability due to dispatch cancellation

- **Case 3 - Already COMPLETED/CANCELLED:**
  - No change, already terminal state

**Test Cases:**
- ✅ Cancel DRAFT trip → 200 OK
- ✅ Cancel DISPATCHED trip → 200 OK with status resets
- ✅ Cancel completed trip → 400 Bad Request
- ✅ Cancel non-existent trip → 404 Not Found

---

## Maintenance Management

**Endpoint Base:** `/api/maintenance`

### 1. Open Maintenance

**POST** `/api/maintenance`

**Status:** 201 Created

**Request Body:**
```json
{
  "vehicleId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Engine oil change and filter replacement",
  "cost": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance opened successfully",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "vehicleName": "Semi-Truck 01",
    "vehicleId": "550e8400-e29b-41d4-a716-446655440000",
    "description": "Engine oil change and filter replacement",
    "cost": null,
    "status": "OPEN",
    "openedAt": "2026-07-12T14:00:00.000+05:30",
    "closedAt": null
  }
}
```

**Side Effects:**
- Vehicle status changed from AVAILABLE to IN_SHOP
- `openedAt` timestamp set to current time
- `closedAt` remains null

**Validation:**
- `vehicleId` must reference existing vehicle
- `description` required and non-empty

**Test Cases:**
- ✅ Open maintenance for available vehicle → 201 Created
- ✅ Verify vehicle status changed to IN_SHOP
- ✅ Non-existent vehicle → 400 Bad Request
- ✅ Empty description → 400 Bad Request

---

### 2. Get Single Maintenance Log

**GET** `/api/maintenance/{id}`

**Status:** 200 OK

**Response:** Maintenance log with vehicle name populated

**Test Cases:**
- ✅ Get existing maintenance → 200 OK
- ✅ Maintenance not found → 404 Not Found

---

### 3. Get All Maintenance Logs

**GET** `/api/maintenance`

**Query Parameters:**
- `openOnly` (optional): Filter for open maintenance only (true/false, default: false)

**Examples:**
- `GET /api/maintenance` - All maintenance logs
- `GET /api/maintenance?openOnly=true` - Only OPEN logs
- `GET /api/maintenance?openOnly=false` - All logs (same as no param)

**Response:**
```json
{
  "success": true,
  "message": "Maintenance logs retrieved successfully",
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "vehicleName": "Semi-Truck 01",
      "description": "Engine repair",
      "status": "OPEN",
      ...
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "vehicleName": "Semi-Truck 02",
      "description": "Tire replacement",
      "status": "CLOSED",
      ...
    }
  ]
}
```

**Test Cases:**
- ✅ Get all maintenance → 200 OK with all logs
- ✅ Filter for open only → 200 OK with only OPEN status
- ✅ Empty result on no open maintenance → 200 OK with empty array

---

### 4. Close Maintenance

**POST** `/api/maintenance/{id}/close`

**Status:** 200 OK

**Request Body:**
```json
{
  "maintenanceId": "990e8400-e29b-41d4-a716-446655440004",
  "cost": 5000.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance closed successfully",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "status": "CLOSED",
    "cost": 5000.00,
    "closedAt": "2026-07-12T16:00:00.000+05:30",
    ...
  }
}
```

**State Transition Logic:**
- **Before:** Maintenance status = OPEN, Vehicle status = IN_SHOP
- **After:** Maintenance status = CLOSED, Vehicle status = AVAILABLE
- Side Effect: `closedAt` timestamp set, cost recorded

**Validation:**
- Maintenance must be in OPEN status
- `maintenanceId` must match path parameter
- `cost` must be positive if provided

**Test Cases:**
- ✅ Close open maintenance with cost → 200 OK
- ✅ Verify vehicle status reverted to AVAILABLE
- ✅ Verify closedAt timestamp set
- ✅ Close already closed maintenance → 400 Bad Request
- ✅ Non-existent maintenance → 404 Not Found

---

## Fuel Management

**Endpoint Base:** `/api/fuel`

### 1. Log Fuel

**POST** `/api/fuel`

**Status:** 201 Created

**Request Body:**
```json
{
  "vehicleId": "550e8400-e29b-41d4-a716-446655440000",
  "tripId": null,
  "liters": 50.00,
  "cost": 5500.00,
  "logDate": "2026-07-12"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fuel logged successfully",
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "vehicleName": "Semi-Truck 01",
    "vehicleId": "550e8400-e29b-41d4-a716-446655440000",
    "tripName": null,
    "tripId": null,
    "liters": 50.00,
    "cost": 5500.00,
    "logDate": "2026-07-12",
    "createdAt": "2026-07-12T14:30:00.000+05:30"
  }
}
```

**Field Constraints:**
- `vehicleId` (required): Must reference existing vehicle
- `tripId` (optional): Can be null, or reference existing trip
- `liters` (required): Must be positive
- `cost` (required): Can be null or positive
- `logDate` (required): Valid date

**Test Cases:**
- ✅ Log fuel with all fields → 201 Created
- ✅ Log fuel without trip reference → 201 Created
- ✅ Duplicate fuel log same day → 201 OK (no uniqueness constraint)
- ✅ Non-existent vehicle → 400 Bad Request
- ✅ Negative liters → 400 Bad Request

---

### 2. Get Single Fuel Log

**GET** `/api/fuel/{id}`

**Status:** 200 OK

**Response:** Fuel log with vehicle and trip names

**Test Cases:**
- ✅ Get existing fuel log → 200 OK
- ✅ Fuel log not found → 404 Not Found

---

### 3. Get All Fuel Logs

**GET** `/api/fuel`

**Query Parameters:**
- `vehicleId` (optional): Filter by specific vehicle UUID

**Examples:**
- `GET /api/fuel` - All fuel logs
- `GET /api/fuel?vehicleId=550e8400-e29b-41d4-a716-446655440000` - Logs for one vehicle

**Response:**
```json
{
  "success": true,
  "message": "Fuel logs retrieved successfully",
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440006",
      "vehicleName": "Semi-Truck 01",
      "liters": 50.00,
      "logDate": "2026-07-12",
      ...
    }
  ]
}
```

**Test Cases:**
- ✅ Get all fuel logs → 200 OK
- ✅ Filter by vehicle → 200 OK with that vehicle's logs only
- ✅ Empty result on no logs → 200 OK with empty array

---

### 4. Delete Fuel Log

**DELETE** `/api/fuel/{id}`

**Status:** 200 OK

**Response:**
```json
{
  "success": true,
  "message": "Fuel log deleted successfully",
  "data": null
}
```

**Test Cases:**
- ✅ Delete existing fuel log → 200 OK
- ✅ Subsequent GET returns 404 Not Found
- ✅ Delete non-existent log → 404 Not Found

---

## Expense Management

**Endpoint Base:** `/api/expenses`

### 1. Create Expense

**POST** `/api/expenses`

**Status:** 201 Created

**Request Body:**
```json
{
  "vehicleId": "550e8400-e29b-41d4-a716-446655440000",
  "tripId": "880e8400-e29b-41d4-a716-446655440003",
  "category": "TOLL",
  "amount": 1500.00,
  "expenseDate": "2026-07-12",
  "description": "Highway toll fees"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "vehicleName": "Semi-Truck 01",
    "vehicleId": "550e8400-e29b-41d4-a716-446655440000",
    "tripName": "City A to City B",
    "tripId": "880e8400-e29b-41d4-a716-446655440003",
    "category": "TOLL",
    "amount": 1500.00,
    "expenseDate": "2026-07-12",
    "description": "Highway toll fees",
    "createdAt": "2026-07-12T15:00:00.000+05:30"
  }
}
```

**Expense Categories:**
- `TOLL`: Highway/toll fees
- `MAINTENANCE`: Repair/maintenance costs
- `MISC`: Miscellaneous expenses

**Field Constraints:**
- `vehicleId` (required): Must reference existing vehicle
- `tripId` (optional): Can be null for vehicle-wide expenses
- `category` (required): Must be valid enum value
- `amount` (required): Must be positive
- `expenseDate` (required): Valid date
- `description` (optional): Additional notes

**Test Cases:**
- ✅ Create TOLL expense → 201 Created
- ✅ Create MAINTENANCE expense → 201 Created
- ✅ Create without trip reference → 201 Created
- ✅ Invalid category → 400 Bad Request
- ✅ Non-existent vehicle → 400 Bad Request
- ✅ Negative amount → 400 Bad Request

---

### 2. Get Single Expense

**GET** `/api/expenses/{id}`

**Status:** 200 OK

**Response:** Expense with vehicle and trip names

**Test Cases:**
- ✅ Get existing expense → 200 OK
- ✅ Expense not found → 404 Not Found

---

### 3. Get All Expenses

**GET** `/api/expenses`

**Query Parameters:**
- `vehicleId` (optional): Filter by specific vehicle UUID

**Examples:**
- `GET /api/expenses` - All expenses
- `GET /api/expenses?vehicleId=550e8400-e29b-41d4-a716-446655440000` - One vehicle's expenses

**Response:**
```json
{
  "success": true,
  "message": "Expenses retrieved successfully",
  "data": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440007",
      "vehicleName": "Semi-Truck 01",
      "category": "TOLL",
      "amount": 1500.00,
      ...
    }
  ]
}
```

**Test Cases:**
- ✅ Get all expenses → 200 OK
- ✅ Filter by vehicle → 200 OK with that vehicle's expenses
- ✅ Empty result on no expenses → 200 OK with empty array

---

### 4. Delete Expense

**DELETE** `/api/expenses/{id}`

**Status:** 200 OK

**Response:**
```json
{
  "success": true,
  "message": "Expense deleted successfully",
  "data": null
}
```

**Test Cases:**
- ✅ Delete existing expense → 200 OK
- ✅ Subsequent GET returns 404 Not Found
- ✅ Delete non-existent expense → 404 Not Found

---

## Error Handling

### Common Error Scenarios

**400 Bad Request** - Validation Failure
```json
{
  "success": false,
  "message": "Cargo weight exceeds vehicle capacity",
  "data": null
}
```

**404 Not Found** - Resource Missing
```json
{
  "success": false,
  "message": "Vehicle not found with ID: xxx",
  "data": null
}
```

**409 Conflict** - Duplicate Unique Field
```json
{
  "success": false,
  "message": "Registration number already exists",
  "data": null
}
```

### Validation Rules Enforced

| Entity | Field | Rule |
|--------|-------|------|
| Vehicle | registrationNumber | Unique, required |
| Vehicle | maxLoadCapacity | Positive, required |
| Driver | licenseNumber | Unique, required |
| Driver | licenseExpiryDate | Not in past, required |
| Trip | cargoWeight | ≤ vehicle capacity |
| Trip | vehicle/driver | Must be AVAILABLE |
| Maintenance | vehicle | Must exist |
| Fuel | vehicle | Must exist |
| Expense | vehicle | Must exist |

---

## Business Logic & State Transitions

### Vehicle State Machine

```
[AVAILABLE] 
    ↓ (trip dispatched)
[ON_TRIP]
    ↓ (trip completed/cancelled)
[AVAILABLE]

[AVAILABLE]
    ↓ (maintenance opened)
[IN_SHOP]
    ↓ (maintenance closed)
[AVAILABLE]

[AVAILABLE/ON_TRIP/IN_SHOP]
    ↓ (manual status change or delete)
[RETIRED]
```

### Driver State Machine

```
[AVAILABLE]
    ↓ (trip dispatched)
[ON_TRIP]
    ↓ (trip completed/cancelled)
[AVAILABLE]

[AVAILABLE]
    ↓ (manual status change)
[OFF_DUTY] or [SUSPENDED]
```

### Trip State Machine

```
[DRAFT]
    ↓ (dispatch)
[DISPATCHED]
    ├─→ (complete)
    │   [COMPLETED]
    └─→ (cancel)
        [CANCELLED]
```

### Key Business Rules

1. **Trip Creation:**
   - Validates cargo ≤ vehicle capacity
   - Requires vehicle and driver in AVAILABLE status
   - Creates with DRAFT status

2. **Trip Dispatch:**
   - Vehicle: AVAILABLE → ON_TRIP
   - Driver: AVAILABLE → ON_TRIP
   - Trip: DRAFT → DISPATCHED
   - Records dispatchedAt timestamp

3. **Trip Completion:**
   - Vehicle: ON_TRIP → AVAILABLE
   - Driver: ON_TRIP → AVAILABLE
   - Trip: DISPATCHED → COMPLETED
   - Increments vehicle odometer by actualDistance
   - Records completedAt timestamp

4. **Trip Cancellation:**
   - If DRAFT: Just change trip status
   - If DISPATCHED: Revert vehicle/driver to AVAILABLE
   - Trip: [DRAFT|DISPATCHED] → CANCELLED

5. **Maintenance Open:**
   - Vehicle: AVAILABLE → IN_SHOP
   - Maintenance: OPEN status with timestamp

6. **Maintenance Close:**
   - Vehicle: IN_SHOP → AVAILABLE
   - Maintenance: OPEN → CLOSED
   - Records closedAt timestamp and cost

---

## Example Integration Test Flow

### Scenario: Complete Transport Operation

**Step 1: Create Resources**
```bash
# Create vehicle
POST /api/vehicles
→ Vehicle created with ID: V1, status: AVAILABLE

# Create driver  
POST /api/drivers
→ Driver created with ID: D1, status: AVAILABLE
```

**Step 2: Create Trip**
```bash
POST /api/trips
{
  "vehicleId": "V1",
  "driverId": "D1",
  "createdById": "USER1",
  "cargoWeight": 2500,
  "plannedDistance": 500
}
→ Trip created with ID: T1, status: DRAFT
```

**Step 3: Dispatch Trip**
```bash
POST /api/trips/T1/dispatch

Verify:
- Trip T1 status: DRAFT → DISPATCHED
- Vehicle V1 status: AVAILABLE → ON_TRIP
- Driver D1 status: AVAILABLE → ON_TRIP
```

**Step 4: Log Fuel (During Trip)**
```bash
POST /api/fuel
{
  "vehicleId": "V1",
  "tripId": "T1",
  "liters": 50,
  "cost": 5500,
  "logDate": "2026-07-12"
}
→ Fuel log created
```

**Step 5: Record Expense**
```bash
POST /api/expenses
{
  "vehicleId": "V1",
  "tripId": "T1",
  "category": "TOLL",
  "amount": 1500,
  "expenseDate": "2026-07-12"
}
→ Expense recorded
```

**Step 6: Complete Trip**
```bash
POST /api/trips/T1/complete
{
  "tripId": "T1",
  "actualDistance": 520.50
}

Verify:
- Trip T1 status: DISPATCHED → COMPLETED
- Vehicle V1 status: ON_TRIP → AVAILABLE
- Vehicle V1 odometer: 0 → 520.50
- Driver D1 status: ON_TRIP → AVAILABLE
- completedAt timestamp recorded
```

**Step 7: Perform Maintenance**
```bash
# Open maintenance
POST /api/maintenance
{
  "vehicleId": "V1",
  "description": "Post-trip inspection"
}
→ Maintenance created, Vehicle V1 status: AVAILABLE → IN_SHOP

# Close maintenance
POST /api/maintenance/{maintenanceId}/close
{
  "maintenanceId": "M1",
  "cost": 2000
}
→ Maintenance closed, Vehicle V1 status: IN_SHOP → AVAILABLE
```

**Step 8: Retrieve Trip Summary**
```bash
GET /api/trips/T1
→ Returns complete trip with:
  - Trip status: COMPLETED
  - Dispatch/completion timestamps
  - Vehicle and driver names
  - Cargo and distance info
  - Associated fuel logs and expenses
```

---

## Testing Checklist

### Vehicle Endpoints
- [ ] POST - Create with valid data
- [ ] POST - Reject duplicate registration
- [ ] GET - Retrieve single vehicle
- [ ] GET - Retrieve all vehicles
- [ ] GET - Filter by status
- [ ] PUT - Update vehicle fields
- [ ] DELETE - Remove vehicle

### Driver Endpoints
- [ ] POST - Create with valid data
- [ ] POST - Reject expired license
- [ ] POST - Reject duplicate license
- [ ] GET - Retrieve single driver
- [ ] GET - Retrieve all drivers
- [ ] GET - Filter by status
- [ ] PUT - Update driver fields
- [ ] DELETE - Remove driver

### Trip Endpoints
- [ ] POST - Create with valid data
- [ ] POST - Reject if cargo exceeds capacity
- [ ] POST - Reject if vehicle/driver not available
- [ ] GET - Retrieve single trip
- [ ] GET - Retrieve all trips
- [ ] GET - Filter by status
- [ ] POST /dispatch - Change states correctly
- [ ] POST /complete - Update odometer correctly
- [ ] POST /cancel - Revert states on DISPATCHED cancel

### Maintenance Endpoints
- [ ] POST - Open maintenance, change vehicle status
- [ ] GET - Retrieve single maintenance
- [ ] GET - Retrieve all maintenance logs
- [ ] GET - Filter for open-only
- [ ] POST /close - Close and revert vehicle status

### Fuel Endpoints
- [ ] POST - Log fuel
- [ ] GET - Retrieve single fuel log
- [ ] GET - Retrieve all fuel logs
- [ ] GET - Filter by vehicle
- [ ] DELETE - Remove fuel log

### Expense Endpoints
- [ ] POST - Create expense
- [ ] GET - Retrieve single expense
- [ ] GET - Retrieve all expenses
- [ ] GET - Filter by vehicle
- [ ] DELETE - Remove expense

---

## Performance Considerations

- **Pagination:** Add `page` and `size` query params to list endpoints (future enhancement)
- **Indexes:** Add indexes on `status` fields and FK relationships for faster filtering
- **Caching:** Cache vehicle types and driver license categories (reference data)
- **Batch Operations:** Support bulk expense/fuel log creation (future enhancement)

---

## Security Notes

- All endpoints require Spring Security authentication in production
- Implement role-based access control (FLEET_MANAGER, DRIVER, SAFETY_OFFICER, FINANCIAL_ANALYST)
- Validate user permissions before allowing modifications
- All timestamps use server time for audit compliance
- Soft delete recommended for vehicles/drivers instead of hard delete

---

## Deployment

**Build & Run:**
```bash
cd backend
./mvnw clean compile
./mvnw test
./mvnw spring-boot:run
```

**Database Setup:**
```bash
# PostgreSQL must be running on localhost:5432
# Create transitops database
createdb transitops

# Hibernate will auto-create tables (ddl-auto=update)
```

**Environment Variables:**
```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/transitops
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-12 | Initial API implementation with 6 resource endpoints |

---

## Contact & Support

For issues, feature requests, or contributions, contact the TransitOps development team.
