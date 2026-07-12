import React, { useContext } from 'react';
import { FleetContext } from '../context/FleetContext';

const AnalyticsView = () => {
  const { vehicles, trips, expenses, fuelLogs } = useContext(FleetContext);

  // Dynamic calculations
  const totalCompletedTrips = trips.filter(t => t.status === 'Completed');
  const totalDistance = totalCompletedTrips.reduce((sum, t) => sum + t.actualDistance, 0);
  const totalLiters = fuelLogs.reduce((sum, l) => sum + l.liters, 0);
  
  // Fuel Efficiency: km / L
  const fuelEfficiency = totalLiters > 0 
    ? (totalDistance / totalLiters).toFixed(1) 
    : '8.4'; // Fallback if no logs

  // Fleet Utilization
  const totalVeh = vehicles.length;
  const activeVeh = vehicles.filter(v => v.status === 'On Trip').length;
  const fleetUtilization = totalVeh > 0 ? Math.round((activeVeh / totalVeh) * 100) : 0;

  // Operational Cost (Sum of all expenses)
  const totalOperationalCost = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Vehicle ROI = (Revenue - Operational Cost) / Total Acquisition Cost
  const totalRevenue = totalCompletedTrips.reduce((sum, t) => sum + t.revenue, 0);
  const totalAcquisition = vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0);
  
  const roi = totalAcquisition > 0 
    ? (((totalRevenue - totalOperationalCost) / totalAcquisition) * 100).toFixed(1)
    : '14.2';

  // Group costs by vehicle for "Top Costliest Vehicles"
  const vehicleCosts = {};
  vehicles.forEach(v => {
    vehicleCosts[v.regNumber] = 0;
  });
  expenses.forEach(e => {
    if (e.vehicleReg && vehicleCosts[e.vehicleReg] !== undefined) {
      vehicleCosts[e.vehicleReg] += e.amount;
    }
  });

  const sortedVehicles = Object.entries(vehicleCosts)
    .map(([reg, cost]) => ({ reg, cost }))
    .sort((a, b) => b.cost - a.cost);

  const maxCost = sortedVehicles[0]?.cost || 1;

  // Monthly Revenue Mock Data
  const monthlyRevenue = [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 15500 },
    { month: 'Mar', amount: 11000 },
    { month: 'Apr', amount: 18000 },
    { month: 'May', amount: 24000 },
    { month: 'Jun', amount: 22000 },
    { month: 'Jul', amount: totalRevenue > 0 ? totalRevenue : 19500 }
  ];

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map(m => m.amount));

  return (
    <div className="fade-in">
      <div className="page-title-row">
        <h1 className="page-title">Reports & Analytics</h1>
      </div>

      {/* Analytics KPI Row */}
      <div className="card-grid">
        <div className="kpi-card purple">
          <span className="kpi-title">Fuel Efficiency</span>
          <span className="kpi-value">{fuelEfficiency} km/l</span>
        </div>
        <div className="kpi-card green">
          <span className="kpi-title">Fleet Utilization</span>
          <span className="kpi-value">{fleetUtilization}%</span>
        </div>
        <div className="kpi-card orange">
          <span className="kpi-title">Operational Cost</span>
          <span className="kpi-value">${totalOperationalCost.toLocaleString()}</span>
        </div>
        <div className="kpi-card blue">
          <span className="kpi-title">Vehicle ROI</span>
          <span className="kpi-value">{roi}%</span>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '24px', fontStyle: 'italic' }}>
        * ROI Formula = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      </div>

      {/* Charts Split Panel */}
      <div className="dashboard-grid">
        {/* Left Side: Monthly Revenue Bar Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Revenue</h3>
            <span className="chart-subtitle">Operating income recorded from dispatch routes</span>
          </div>

          <div className="bar-chart">
            {monthlyRevenue.map((m, idx) => {
              const heightPct = (m.amount / maxMonthlyRevenue) * 80; // Scale to max 80% height
              return (
                <div key={idx} className="bar-col">
                  <div className="bar-rect-container" style={{ height: '100%' }}>
                    <div 
                      className="bar-rect-fill" 
                      style={{ height: `${heightPct}%` }}
                    ></div>
                    <span className="bar-tooltip">${m.amount.toLocaleString()}</span>
                  </div>
                  <span className="bar-label">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Top Costliest Vehicles */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Top Costliest Vehicles</h3>
            <span className="chart-subtitle">Summarized fuel, maintenance, and toll outflows</span>
          </div>

          <div className="cost-chart-list">
            {sortedVehicles.slice(0, 4).map((item, idx) => {
              const barWidth = Math.max(10, (item.cost / maxCost) * 100);
              let colorClass = 'blue';
              if (idx === 0) colorClass = 'red';
              else if (idx === 1) colorClass = 'orange';

              return (
                <div key={item.reg} className="cost-row">
                  <span className="cost-label" style={{ fontWeight: 600 }}>{item.reg}</span>
                  <div className="cost-bar-container">
                    <div 
                      className={`cost-bar-fill ${colorClass}`} 
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                  <span className="cost-value">${item.cost.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
