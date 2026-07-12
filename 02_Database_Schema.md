# TransitOps_Database_Schema_Highlighted_Green

## TransitOps Database Schema Review & Recommended Structure

This document summarizes the recommended production-ready database schema for the TransitOps platform. It supports authentication, RBAC, fleet management, AI features, analytics, and hackathon requirements.

## Core Entities

## users

## id (PK)

## email (Unique)

## password_hash

## full_name

## phone

## is_active

## created_at

## last_login

## roles

## id (PK)

## role_name

## user_roles

## user_id (FK users)

## role_id (FK roles)

## vehicles

## reg_number (PK)

## name_model

## type

## region

## max_load_capacity

## current_odometer

## acquisition_cost

## fuel_type

## vehicle_year

## insurance_expiry

## status

## health_score

## predictive_alert_flag

## estimated_days_to_failure

## drivers

## id (PK)

## user_id

## license_number

## license_category

## license_expiry

## contact

## safety_score

## status

## region

## driver_license_documents

## id

## driver_id

## image_path

## ocr_license_number

## ocr_name

## ocr_expiry_date

## verification_status

## trips

## id

## vehicle_reg

## driver_id

## source

## destination

## cargo_weight

## planned_distance

## actual_distance

## revenue

## status

## created_at

## completed_at

## trip_routes

## id

## trip_id

## latitude

## longitude

## speed

## timestamp

## maintenance_logs

## id

## vehicle_reg

## issue_description

## maintenance_type

## priority

## cost

## is_open

## resolved_date

## fuel_logs

## id

## vehicle_reg

## trip_id

## liters

## price_per_liter

## total_cost

## date

## is_anomaly

## record_hash

## expenses

## id

## vehicle_reg

## trip_id

## maintenance_log_id

## expense_type

## amount

## description

## is_anomaly

## record_hash

## vehicle_telemetry_history

## id

## vehicle_reg

## timestamp

## recorded_odometer

## cargo_weight_carried

## average_speed

## environmental_factors(JSON)

## driver_behavior_logs

## id

## driver_id

## trip_id

## hard_brakes

## overspeed_events

## rapid_accelerations

## behavior_cluster

## driver_fatigue_logs

## id

## driver_id

## trip_id

## driving_hours

## rest_hours

## fatigue_level

## prediction

## dispatch_recommendations

## id

## trip_id

## recommended_vehicle

## recommended_driver

## recommendation_score

## accepted

## vehicle_documents

## id

## vehicle_reg

## document_type

## expiry_date

## file_path

## alerts

## id

## alert_type

## reference_type

## reference_id

## severity

## status

## created_at

## Key Relationships

## Users 1..N User_Roles N..1 Roles

## Users 1..1 Drivers

## Drivers 1..N Trips

## Vehicles 1..N Trips

## Vehicles 1..N Maintenance Logs

## Trips 1..N Fuel Logs

## Trips 1..N Expenses

## Drivers 1..N Behavior Logs

## Drivers 1..N Fatigue Logs

## Vehicles 1..N Vehicle Documents

## Trips 1..N Dispatch Recommendations

## Alerts may reference Drivers, Vehicles, Trips or Maintenance

## Vehicles 1..N Vehicle Telemetry History

## Business Rules

Vehicle registration number must be unique.

Vehicle status must not be RETIRED or IN_SHOP before dispatch.

Driver must not be SUSPENDED or have an expired license.

Cargo weight cannot exceed vehicle capacity.

Vehicle and driver cannot have overlapping active trips.

Dispatch automatically sets vehicle and driver status to ON_TRIP.

Trip completion/cancellation restores availability.

Opening maintenance sets vehicle status to IN_SHOP.

Closing maintenance restores AVAILABLE unless retired.

Operational cost = Fuel + Maintenance + Other Expenses.

Vehicle ROI = (Revenue - Operational Costs) / Acquisition Cost.

Generate alerts for maintenance, insurance, license expiry and fatigue.

Fuel and expense records must be cryptographically hashed.

Maintenance alerts proactively triggered from ML health_score.

## Recommended Indexes

## vehicles(status, region)

## drivers(status, license_expiry)

## trips(status, vehicle_reg, driver_id)

## maintenance_logs(vehicle_reg, is_open)

## fuel_logs(vehicle_reg)

## expenses(vehicle_reg)

## alerts(status)

## vehicle_telemetry_history(vehicle_reg, timestamp)

## Implementation Notes

Use BCrypt password hashing with JWT managed by Spring Security. Enforce RBAC using @PreAuthorize backed by users/roles/user_roles. Use foreign keys, constraints, transactions and triggers or service-layer logic to enforce business rules. Implement anomaly detection and cryptographic hashing in the application service layer before database insertion.
