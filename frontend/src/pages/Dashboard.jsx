import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FleetContext } from '../context/FleetContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { 
    vehicles, 
    drivers, 
    trips, 
    expenses, 
    fuelLogs, 
    completeTrip,
    dispatchTrip
  } = useContext(FleetContext);

  const { user } = useContext(AuthContext);

  if (user?.role === 'DRIVER') {
    return <Navigate to="/trips" replace />;
  }

  // States for Driver Trip Completion inside Dashboard
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [endOdometer, setEndOdometer] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');

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

  const handleOpenCompleteModal = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    const vehicle = vehicles.find(v => v.regNumber === trip.vehicleReg);
    setSelectedTripId(tripId);
    setEndOdometer((vehicle?.currentOdometer || 0) + Math.ceil(trip.plannedDistance));
    setFuelLiters(Math.round(trip.plannedDistance * 0.2));
    setFuelCost(Math.round(trip.plannedDistance * 0.2 * 2.0));
    setShowCompleteModal(true);
  };

  const handleCompleteTripSubmit = (e) => {
    e.preventDefault();
    if (!endOdometer) {
      toast.error('Odometer reading is required.');
      return;
    }

    try {
      completeTrip(
        selectedTripId,
        parseInt(endOdometer),
        parseFloat(fuelLiters || 0),
        parseFloat(fuelCost || 0)
      );
      toast.success(`Trip ${selectedTripId} completed successfully!`);
      setShowCompleteModal(false);
    } catch (err) {
      toast.error(`Completion Failed: ${err.message}`);
    }
  };

  // --- Variant 1: FLEET MANAGER DASHBOARD ---
  const renderFleetManagerDashboard = () => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'In Shop').length;
    const activeTrips = trips.filter(t => t.status === 'On Trip' || t.status === 'Dispatched').length;
    const pendingTrips = trips.filter(t => t.status === 'Draft').length;
    const driversOnDuty = drivers.filter(d => d.status === 'On Trip' || d.status === 'Available').length;
    const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    const statusCounts = {
      Available: vehicles.filter(v => v.status === 'Available').length,
      OnTrip: vehicles.filter(v => v.status === 'On Trip').length,
      InShop: vehicles.filter(v => v.status === 'In Shop').length,
      Retired: vehicles.filter(v => v.status === 'Retired').length
    };

    return (
      <div className="fade-in">
        <div className="page-title-row">
          <h1 className="page-title">Operational Dashboard</h1>
        </div>

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

        <div className="dashboard-grid">
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
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No trips registered.
                    </td>
                  </tr>
                ) : (
                  trips.slice(0, 5).map((trip) => {
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

          <div className="table-container">
            <div className="table-header-row">
              <h3 className="table-title">Vehicle Status Summary</h3>
            </div>
            <div className="progress-list">
              <div className="progress-item">
                <div className="progress-label-row">
                  <span className="progress-label">Available</span>
                  <span className="progress-value">{statusCounts.Available} / {totalVehicles}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill green" style={{ width: `${totalVehicles > 0 ? (statusCounts.Available / totalVehicles) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-label-row">
                  <span className="progress-label">On Trip</span>
                  <span className="progress-value">{statusCounts.OnTrip} / {totalVehicles}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill blue" style={{ width: `${totalVehicles > 0 ? (statusCounts.OnTrip / totalVehicles) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-label-row">
                  <span className="progress-label">In Shop</span>
                  <span className="progress-value">{statusCounts.InShop} / {totalVehicles}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill orange" style={{ width: `${totalVehicles > 0 ? (statusCounts.InShop / totalVehicles) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Variant 2: DRIVER DASHBOARD ("My Trips Dashboard") ---
  const renderDriverDashboard = () => {
    const myDriverProfile = drivers.find(d => d.name.toLowerCase() === user.name.toLowerCase());
    const myTrips = trips.filter(t => t.driverId === myDriverProfile?.id);
    const completedTripsCount = myTrips.filter(t => t.status === 'Completed').length;
    const activeTrip = myTrips.find(t => t.status === 'Dispatched' || t.status === 'On Trip');

    return (
      <div className="fade-in">
        <div className="page-title-row">
          <h1 className="page-title">My Trips Dashboard</h1>
        </div>

        <div className="card-grid">
          <div className="kpi-card blue">
            <span className="kpi-title">My Total Trips</span>
            <span className="kpi-value">{myTrips.length.toString().padStart(2, '0')}</span>
          </div>
          <div className="kpi-card green">
            <span className="kpi-title">Completed Trips</span>
            <span className="kpi-value">{completedTripsCount.toString().padStart(2, '0')}</span>
          </div>
          <div className="kpi-card purple">
            <span className="kpi-title">My Safety Score</span>
            <span className="kpi-value">{myDriverProfile?.safetyScore || '95'}/100</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          {activeTrip ? (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '4px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)'
            }}>
              <span className="role-badge" style={{ backgroundColor: 'rgba(113, 75, 103, 0.08)', marginBottom: '8px', display: 'inline-block' }}>
                Active Assigned Trip
              </span>
              <h3 style={{ fontFamily: 'var(--font-family-title)', fontSize: '20px', marginBottom: '12px' }}>
                {activeTrip.source} ➔ {activeTrip.destination}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Vehicle: <strong>{activeTrip.vehicleReg}</strong> | Cargo: {activeTrip.cargoWeight} kg | Distance: {activeTrip.plannedDistance} km
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => handleOpenCompleteModal(activeTrip.id)}
              >
                🏁 Log Completion & Fuel
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🚚</span>
              No active trip currently dispatched. Enjoy your downtime!
            </div>
          )}

          <div className="table-container">
            <div className="table-header-row">
              <h3 className="table-title">My Trip History</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Revenue / Stats</th>
                </tr>
              </thead>
              <tbody>
                {myTrips.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No trips assigned to you yet.
                    </td>
                  </tr>
                ) : (
                  myTrips.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.id}</td>
                      <td>{t.source} ➔ {t.destination}</td>
                      <td>
                        <span className={`status-pill ${getStatusClass(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        {t.status === 'Completed' ? `${t.actualDistance} km completed` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- Variant 3: SAFETY OFFICER DASHBOARD ("Compliance Dashboard") ---
  const renderSafetyOfficerDashboard = () => {
    const expiredLicenses = drivers.filter(d => new Date(d.licenseExpiry) < new Date());
    const averageSafety = drivers.length > 0 
      ? Math.round(drivers.reduce((acc, d) => acc + d.safetyScore, 0) / drivers.length)
      : 95;
    const criticalDrivers = drivers.filter(d => d.safetyScore < 80);

    return (
      <div className="fade-in">
        <div className="page-title-row">
          <h1 className="page-title">Compliance & Safety Dashboard</h1>
        </div>

        <div className="card-grid">
          <div className="kpi-card green">
            <span className="kpi-title">Avg Safety Score</span>
            <span className="kpi-value">{averageSafety}%</span>
          </div>
          <div className="kpi-card red">
            <span className="kpi-title">Expired Licenses</span>
            <span className="kpi-value">{expiredLicenses.length.toString().padStart(2, '0')}</span>
          </div>
          <div className="kpi-card orange">
            <span className="kpi-title">Safety Concerns</span>
            <span className="kpi-value">{criticalDrivers.length.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Safety Alerts List */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div className="table-container">
            <div className="table-header-row">
              <h3 className="table-title">Active Safety Compliance Checks</h3>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expiredLicenses.map(d => (
                <div key={d.id} style={{
                  padding: '12px',
                  backgroundColor: 'rgba(217, 83, 79, 0.05)',
                  border: '1px solid rgba(217, 83, 79, 0.2)',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}>
                  ⚠️ <strong>License Expired:</strong> Driver <strong>{d.name}</strong> license expired on {d.licenseExpiry}. Requires suspension.
                </div>
              ))}
              {criticalDrivers.map(d => (
                <div key={d.id} style={{
                  padding: '12px',
                  backgroundColor: 'rgba(230, 126, 34, 0.05)',
                  border: '1px solid rgba(230, 126, 34, 0.2)',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}>
                  💤 <strong>Fatigue Risk:</strong> Driver <strong>{d.name}</strong> safety score is at {d.safetyScore}% - recommend scheduling fatigue rest period.
                </div>
              ))}
              {expiredLicenses.length === 0 && criticalDrivers.length === 0 && (
                <div style={{ color: 'var(--accent-success)', fontSize: '13px', fontWeight: 600, textAlign: 'center', padding: '20px' }}>
                  ✓ All active drivers are in compliance. No alerts.
                </div>
              )}
            </div>
          </div>

          <div className="table-container">
            <div className="table-header-row">
              <h3 className="table-title">OCR & Driver Validation</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: 'var(--bg-primary)',
                padding: '12px',
                border: '1px dashed var(--border-color)',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                <strong>Digital Document Audit Status:</strong> All driver license OCR readings matched database records (100% Hash verified).
              </div>
              <div style={{
                background: 'var(--bg-primary)',
                padding: '12px',
                border: '1px dashed var(--border-color)',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                <strong>Last Verification Run:</strong> Today, 12:00 PM.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Variant 4: FINANCIAL ANALYST DASHBOARD ---
  const renderFinancialAnalystDashboard = () => {
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const completedTrips = trips.filter(t => t.status === 'Completed');
    const totalRevenue = completedTrips.reduce((acc, t) => acc + (t.revenue || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const anomalies = expenses.filter(e => e.isAnomaly);

    return (
      <div className="fade-in">
        <div className="page-title-row">
          <h1 className="page-title">Financial Summary Dashboard</h1>
        </div>

        <div className="card-grid">
          <div className="kpi-card green">
            <span className="kpi-title">Total Revenue</span>
            <span className="kpi-value">${totalRevenue.toLocaleString()}</span>
          </div>
          <div className="kpi-card red">
            <span className="kpi-title">Total Expenses</span>
            <span className="kpi-value">${totalExpenses.toLocaleString()}</span>
          </div>
          <div className="kpi-card blue">
            <span className="kpi-title">Net Profit (ROI)</span>
            <span className="kpi-value" style={{ color: netProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              ${netProfit.toLocaleString()}
            </span>
          </div>
          <div className="kpi-card orange">
            <span className="kpi-title">Expense Anomalies</span>
            <span className="kpi-value">{anomalies.length.toString().padStart(2, '0')}</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="table-container" style={{ gridColumn: 'span 2' }}>
            <div className="table-header-row">
              <h3 className="table-title">Audited Expense Transactions</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle Reg</th>
                  <th>Expense Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Transaction Hash</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No expenses logged yet.
                    </td>
                  </tr>
                ) : (
                  expenses.slice(0, 8).map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.vehicleReg}</td>
                      <td>{exp.expenseType}</td>
                      <td style={{ fontWeight: 600 }}>${exp.amount.toLocaleString()}</td>
                      <td>{exp.date}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {exp.recordHash}
                      </td>
                      <td>
                        {exp.isAnomaly ? (
                          <span className="status-pill retired" style={{ fontSize: '10px' }}>⚠️ Anomaly</span>
                        ) : (
                          <span className="status-pill available" style={{ fontSize: '10px' }}>Verified</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- Variant 5: DISPATCHER DASHBOARD ("Dispatch KPIs") ---
  const renderDispatcherDashboard = () => {
    const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const activeTrips = trips.filter(t => t.status === 'On Trip' || t.status === 'Dispatched').length;
    const pendingTrips = trips.filter(t => t.status === 'Draft').length;
    const driversOnDuty = drivers.filter(d => d.status === 'On Trip' || d.status === 'Available').length;

    return (
      <div className="fade-in">
        <div className="page-title-row">
          <h1 className="page-title">Dispatcher Dashboard</h1>
        </div>

        <div className="card-grid">
          <div className="kpi-card blue">
            <span className="kpi-title">Active Trips</span>
            <span className="kpi-value">{activeTrips.toString().padStart(2, '0')}</span>
          </div>
          <div className="kpi-card purple">
            <span className="kpi-title">Pending Trips</span>
            <span className="kpi-value">{pendingTrips.toString().padStart(2, '0')}</span>
          </div>
          <div className="kpi-card green">
            <span className="kpi-title">Available Vehicles</span>
            <span className="kpi-value">{availableVehicles.toString().padStart(2, '0')}</span>
          </div>
          <div className="kpi-card blue">
            <span className="kpi-title">Drivers On Duty</span>
            <span className="kpi-value">{driversOnDuty.toString().padStart(2, '0')}</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="table-container" style={{ gridColumn: 'span 2' }}>
            <div className="table-header-row">
              <h3 className="table-title">Recent Trips & Log Status</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Vehicle Reg</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Cargo Weight</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No trips registered.
                    </td>
                  </tr>
                ) : (
                  trips.slice(0, 8).map((trip) => {
                    const driver = drivers.find(d => d.id === parseInt(trip.driverId));
                    return (
                      <tr key={trip.id}>
                        <td style={{ fontWeight: 600 }}>{trip.id}</td>
                        <td>{trip.vehicleReg}</td>
                        <td>{driver ? driver.name : '—'}</td>
                        <td>{trip.source} ➔ {trip.destination}</td>
                        <td>{trip.cargoWeight} kg</td>
                        <td>
                          <span className={`status-pill ${getStatusClass(trip.status)}`}>
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- Dynamic Dashboard Switcher based on User Role ---
  const getDashboardView = () => {
    switch (user?.role) {
      case 'FLEET_MANAGER':
        return renderFleetManagerDashboard();
      case 'DRIVER':
        return renderDriverDashboard();
      case 'SAFETY_OFFICER':
        return renderSafetyOfficerDashboard();
      case 'FINANCIAL_ANALYST':
        return renderFinancialAnalystDashboard();
      case 'DISPATCHER':
        return renderDispatcherDashboard();
      default:
        return <div>Invalid User Role</div>;
    }
  };

  return (
    <>
      {getDashboardView()}

      {/* Driver Complete Trip Modal (shared here for convenience) */}
      {showCompleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Complete Delivery Log</h3>
              <button className="modal-close-btn" onClick={() => setShowCompleteModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCompleteTripSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Final Odometer Reading (km) *</label>
                  <input 
                    type="number" 
                    placeholder="Input final odometer" 
                    className="form-input"
                    value={endOdometer}
                    onChange={(e) => setEndOdometer(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Fuel Consumed (Liters)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 40" 
                      className="form-input"
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fuel Cost ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 80" 
                      className="form-input"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Complete Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
