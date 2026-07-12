import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import FleetView from '../pages/FleetView';
import DriversView from '../pages/DriversView';
import TripsView from '../pages/TripsView';
import MaintenanceView from '../pages/MaintenanceView';
import ExpensesView from '../pages/ExpensesView';
import AnalyticsView from '../pages/AnalyticsView';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="fleet" element={<FleetView />} />
        <Route path="drivers" element={<DriversView />} />
        <Route path="trips" element={<TripsView />} />
        <Route path="maintenance" element={<MaintenanceView />} />
        <Route path="expenses" element={<ExpensesView />} />
        <Route path="analytics" element={<AnalyticsView />} />
        <Route path="*" element={<div style={{ padding: '20px' }}><h2>Page Not Found</h2></div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
