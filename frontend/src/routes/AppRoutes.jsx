import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import FleetView from '../pages/FleetView';
import DriversView from '../pages/DriversView';
import TripsView from '../pages/TripsView';
import MaintenanceView from '../pages/MaintenanceView';
import ExpensesView from '../pages/ExpensesView';
import AnalyticsView from '../pages/AnalyticsView';
import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes wrapped in DashboardLayout */}
      <Route element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'DISPATCHER']} />}>
        <Route path="/" element={<DashboardLayout />}>
          
          {/* Dashboard - Driver is redirected to /trips inside the Dashboard component itself */}
          <Route index element={<Dashboard />} />
          
          {/* Trips - Accessible by all roles */}
          <Route path="trips" element={<TripsView />} />

          {/* Vehicles (Fleet) - Accessible by Manager, Dispatcher, Safety, Finance */}
          <Route element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']} />}>
            <Route path="fleet" element={<FleetView />} />
          </Route>

          {/* Drivers - Accessible by all roles (Drivers see self-only) */}
          <Route path="drivers" element={<DriversView />} />

          {/* Maintenance - Accessible by Manager, Dispatcher, Safety, Finance */}
          <Route element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']} />}>
            <Route path="maintenance" element={<MaintenanceView />} />
          </Route>

          {/* Expenses & Fuel Logs - Manager, Dispatcher, Finance */}
          <Route element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST']} />}>
            <Route path="expenses" element={<ExpensesView />} />
          </Route>

          {/* Analytics & Reports - Manager, Dispatcher, Safety, Finance */}
          <Route element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']} />}>
            <Route path="analytics" element={<AnalyticsView />} />
          </Route>

          <Route path="*" element={<div style={{ padding: '20px' }}><h2>Page Not Found</h2></div>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
