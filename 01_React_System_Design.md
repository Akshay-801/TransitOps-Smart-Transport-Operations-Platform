# TransitOps_React_System_Design_Specification

## TransitOps - React System Design Specification

## Application Flow

App Start
↓
Login
↓
POST /auth/login
↓
JWT
↓
Decode Role
↓
ProtectedRoute
↓
Role Dashboard

## Folder Structure

src/
 components/
 pages/
  Login
  FleetManager
  Driver
  SafetyOfficer
  FinancialAnalyst
 layouts/
 routes/
 context/
 services/

## RBAC

Fleet Manager -> Analytics Dashboard
Driver -> My Trips
Safety Officer -> Compliance Dashboard
Financial Analyst -> Finance Dashboard

## Navigation

Fleet: Dashboard Vehicles Drivers Trips Maintenance Expenses Reports
Driver: Dashboard My Trips
Safety: Dashboard Drivers Reports
Finance: Dashboard Vehicles Expenses Reports

## Widgets

Fleet: KPIs Maintenance
Driver: Start/Complete Trip
Safety: License/Fatigue Alerts
Finance: ROI Fuel Fraud

## APIs

POST /auth/login
GET /dashboard
GET /vehicles
GET /drivers
GET /trips
GET /expenses
GET /reports
