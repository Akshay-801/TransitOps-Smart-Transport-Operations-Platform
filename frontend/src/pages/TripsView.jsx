import React, { useContext, useState } from 'react';
import { FleetContext } from '../context/FleetContext';
import { toast } from 'react-hot-toast';

const TripsView = () => {
  const { 
    trips, 
    vehicles, 
    drivers, 
    createTrip, 
    dispatchTrip, 
    completeTrip, 
    cancelTrip 
  } = useContext(FleetContext);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  // New Trip Form State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [revenue, setRevenue] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [driverId, setDriverId] = useState('');

  // Complete Trip Form State
  const [endOdometer, setEndOdometer] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'draft';
      case 'dispatched': return 'dispatched';
      case 'on trip': return 'ontrip';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return 'draft';
    }
  };

  const handleCreateTrip = (e) => {
    e.preventDefault();
    if (!source || !destination || !cargoWeight || !plannedDistance || !revenue) {
      toast.error('Source, Destination, Cargo Weight, Distance and Revenue are required.');
      return;
    }

    createTrip({
      vehicleReg: vehicleReg || '—',
      driverId: driverId ? parseInt(driverId) : null,
      source,
      destination,
      cargoWeight: parseFloat(cargoWeight),
      plannedDistance: parseFloat(plannedDistance),
      revenue: parseFloat(revenue)
    });

    toast.success('Trip created in Draft status.');
    setShowCreateModal(false);
    resetCreateForm();
  };

  const handleDispatch = (tripId) => {
    try {
      dispatchTrip(tripId);
      toast.success(`Trip ${tripId} has been successfully dispatched! Vehicle and Driver statuses are now 'On Trip'.`);
    } catch (err) {
      toast.error(`Dispatch Failed: ${err.message}`);
    }
  };

  const handleOpenCompleteModal = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    const vehicle = vehicles.find(v => v.regNumber === trip.vehicleReg);
    setSelectedTripId(tripId);
    setEndOdometer((vehicle?.currentOdometer || 0) + Math.ceil(trip.plannedDistance));
    setFuelLiters(Math.round(trip.plannedDistance * 0.2)); // rough fuel estimation
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
      toast.success(`Trip ${selectedTripId} completed successfully! Odometer, expenses, and fuel logs are updated.`);
      setShowCompleteModal(false);
    } catch (err) {
      toast.error(`Completion Failed: ${err.message}`);
    }
  };

  const handleCancel = (tripId) => {
    if (window.confirm(`Are you sure you want to cancel trip ${tripId}?`)) {
      cancelTrip(tripId);
      toast.success(`Trip ${tripId} has been cancelled.`);
    }
  };

  const resetCreateForm = () => {
    setSource('');
    setDestination('');
    setCargoWeight('');
    setPlannedDistance('');
    setRevenue('');
    setVehicleReg('');
    setDriverId('');
  };

  // Filter lists for selectors
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available' && new Date(d.licenseExpiry) >= new Date());

  return (
    <div className="fade-in">
      <div className="page-title-row">
        <h1 className="page-title">Trip Log & Dispatch</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          ➕ Create Trip
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Cargo Weight</th>
              <th>Planned Dist</th>
              <th>Revenue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => {
              const driver = drivers.find(d => d.id === parseInt(trip.driverId));
              return (
                <tr key={trip.id}>
                  <td style={{ fontWeight: 600 }}>{trip.id}</td>
                  <td>{trip.vehicleReg}</td>
                  <td>{driver ? driver.name : '—'}</td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{trip.source} ➔ {trip.destination}</div>
                  </td>
                  <td>{trip.cargoWeight.toLocaleString()} kg</td>
                  <td>{trip.plannedDistance} km</td>
                  <td>${trip.revenue.toLocaleString()}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(trip.status)}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {trip.status === 'Draft' && (
                        <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDispatch(trip.id)}>
                          🚀 Dispatch
                        </button>
                      )}
                      {(trip.status === 'Dispatched' || trip.status === 'On Trip') && (
                        <>
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenCompleteModal(trip.id)}>
                            🏁 Complete
                          </button>
                          <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleCancel(trip.id)}>
                            🛑 Cancel
                          </button>
                        </>
                      )}
                      {trip.status === 'Completed' && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Completed</span>
                      )}
                      {trip.status === 'Cancelled' && (
                        <span style={{ fontSize: '12px', color: 'var(--accent-danger)', fontWeight: 500 }}>Cancelled</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create Transport Trip</h3>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTrip}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Source Warehouse *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Warehouse A" 
                      className="form-input"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination Outlet *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Retailer 3" 
                      className="form-input"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Cargo Weight (kg) *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 450" 
                      className="form-input"
                      value={cargoWeight}
                      onChange={(e) => setCargoWeight(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Planned Distance (km) *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 32" 
                      className="form-input"
                      value={plannedDistance}
                      onChange={(e) => setPlannedDistance(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Planned Revenue ($) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1200" 
                    className="form-input"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Assign Vehicle</label>
                    <select className="form-select" value={vehicleReg} onChange={(e) => setVehicleReg(e.target.value)}>
                      <option value="">-- Select Available --</option>
                      {availableVehicles.map(v => (
                        <option key={v.regNumber} value={v.regNumber}>
                          {v.regNumber} (Max: {v.maxLoadCapacity}kg)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Driver</label>
                    <select className="form-select" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                      <option value="">-- Select Available --</option>
                      {availableDrivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} (Safety: {d.safetyScore})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Draft</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
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
    </div>
  );
};

export default TripsView;
