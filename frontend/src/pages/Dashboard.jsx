import React, { useContext, useState } from 'react';
import { FleetContext } from '../context/FleetContext';

const Dashboard = () => {
  const { vehicles, drivers, trips } = useContext(FleetContext);
  
  // Filter States
  const [vehicleType, setVehicleType] = useState('All');
  const [vehicleStatus, setVehicleStatus] = useState('All');
  const [vehicleRegion, setVehicleRegion] = useState('All');

  // Calculated KPI values
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'In Shop').length;
  
  const activeTrips = trips.filter(t => t.status === 'On Trip' || t.status === 'Dispatched').length;
  const pendingTrips = trips.filter(t => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Trip' || d.status === 'Available').length;
  
  // Utilization calculation: (On Trip / Total Vehicles) * 100
  const fleetUtilization = totalVehicles > 0 
    ? Math.round((activeVehicles / totalVehicles) * 100) 
    : 0;

  // Vehicle Status distribution counts
  const statusCounts = {
    Available: vehicles.filter(v => v.status === 'Available').length,
    OnTrip: vehicles.filter(v => v.status === 'On Trip').length,
    InShop: vehicles.filter(v => v.status === 'In Shop').length,
    Retired: vehicles.filter(v => v.status === 'Retired').length
  };

  // Helper to determine status class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'available';
      case 'on trip': return 'ontrip';
      case 'in shop': return 'inshop';
      case 'retired': return 'retired';
      case 'draft': return 'draft';
      case 'dispatched': return 'dispatched';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return 'draft';
    }
  };

  // Filter logic for recent trips
  const filteredTrips = trips.filter(trip => {
    const v = vehicles.find(veh => veh.regNumber === trip.vehicleReg);
    if (!v) return true; // If draft or no vehicle assigned, show it
    
    const matchesType = vehicleType === 'All' || v.type === vehicleType;
    const matchesStatus = vehicleStatus === 'All' || v.status === vehicleStatus;
    const matchesRegion = vehicleRegion === 'All' || v.region === vehicleRegion;
    
    return matchesType && matchesStatus && matchesRegion;
  });

  return (
    <div className="fade-in">
      <div className="page-title-row">
        <h1 className="page-title">Operational Dashboard</h1>
      </div>

      {/* KPI Cards Row */}
      <div className="card-grid">
        <div className="kpi-card blue">
          <span className="kpi-title">Active Vehicles</span>
          <span className="kpi-value">{activeVehicles.toString().padStart(2, '0')}</span>
        </div>
        <div className="kpi-card green">
          <span className="kpi-title">Available Vehicles</span>
          <span className="kpi-value">{availableVehicles.toString().padStart(2, '0')}</span>
        </div>
        <div className="kpi-card orange">
          <span className="kpi-title">In Maintenance</span>
          <span className="kpi-value">{maintenanceVehicles.toString().padStart(2, '0')}</span>
        </div>
        <div className="kpi-card blue">
          <span className="kpi-title">Active Trips</span>
          <span className="kpi-value">{activeTrips.toString().padStart(2, '0')}</span>
        </div>
        <div className="kpi-card purple">
          <span className="kpi-title">Pending Trips</span>
          <span className="kpi-value">{pendingTrips.toString().padStart(2, '0')}</span>
        </div>
        <div className="kpi-card blue">
          <span className="kpi-title">Drivers On Duty</span>
          <span className="kpi-value">{driversOnDuty.toString().padStart(2, '0')}</span>
        </div>
        <div className="kpi-card green">
          <span className="kpi-title">Fleet Utilization</span>
          <span className="kpi-value">{fleetUtilization}%</span>
        </div>
      </div>

      {/* Interactive Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">Vehicle Type</label>
          <select 
            className="filter-select"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Truck">Trucks</option>
            <option value="Van">Vans</option>
            <option value="Mini-Van">Mini-Vans</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Vehicle Status</label>
          <select 
            className="filter-select"
            value={vehicleStatus}
            onChange={(e) => setVehicleStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Region</label>
          <select 
            className="filter-select"
            value={vehicleRegion}
            onChange={(e) => setVehicleRegion(e.target.value)}
          >
            <option value="All">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Recent Trips & Status Breakdown */}
      <div className="dashboard-grid">
        {/* Recent Trips Table */}
        <div className="table-container">
          <div className="table-header-row">
            <h3 className="table-title">Recent Trips</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Vehicle Reg</th>
                <th>Driver</th>
                <th>Status</th>
                <th>ETA / Info</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No trips match the selected vehicle filters.
                  </td>
                </tr>
              ) : (
                filteredTrips.slice(0, 8).map((trip) => {
                  const driver = drivers.find(d => d.id === parseInt(trip.driverId));
                  return (
                    <tr key={trip.id}>
                      <td style={{ fontWeight: 600 }}>{trip.id}</td>
                      <td>{trip.vehicleReg}</td>
                      <td>{driver ? driver.name : '—'}</td>
                      <td>
                        <span className={`status-pill ${getStatusClass(trip.status)}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td>{trip.eta || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side: Vehicle Status Breakdown */}
        <div className="table-container">
          <div className="table-header-row">
            <h3 className="table-title">Vehicle Status</h3>
          </div>
          <div className="progress-list">
            <div className="progress-item">
              <div className="progress-label-row">
                <span className="progress-label">Available</span>
                <span className="progress-value">
                  {statusCounts.Available} / {totalVehicles}
                </span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill green" 
                  style={{ width: `${totalVehicles > 0 ? (statusCounts.Available / totalVehicles) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label-row">
                <span className="progress-label">On Trip</span>
                <span className="progress-value">
                  {statusCounts.OnTrip} / {totalVehicles}
                </span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill blue" 
                  style={{ width: `${totalVehicles > 0 ? (statusCounts.OnTrip / totalVehicles) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label-row">
                <span className="progress-label">In Shop</span>
                <span className="progress-value">
                  {statusCounts.InShop} / {totalVehicles}
                </span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill orange" 
                  style={{ width: `${totalVehicles > 0 ? (statusCounts.InShop / totalVehicles) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label-row">
                <span className="progress-label">Retired</span>
                <span className="progress-value">
                  {statusCounts.Retired} / {totalVehicles}
                </span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill red" 
                  style={{ width: `${totalVehicles > 0 ? (statusCounts.Retired / totalVehicles) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
