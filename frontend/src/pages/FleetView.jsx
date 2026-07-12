import React, { useContext, useState } from 'react';
import { FleetContext } from '../context/FleetContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const FleetView = () => {
  const { vehicles, addVehicle } = useContext(FleetContext);
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  // Dispatcher can only read Available vehicles
  const displayVehicles = user?.role === 'DISPATCHER'
    ? vehicles.filter(v => v.status === 'Available' || v.status === 'Available')
    : vehicles;
  
  // Form State
  const [regNumber, setRegNumber] = useState('');
  const [nameModel, setNameModel] = useState('');
  const [type, setType] = useState('Van');
  const [maxLoadCapacity, setMaxLoadCapacity] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [fuelType, setFuelType] = useState('Diesel');
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear());
  const [region, setRegion] = useState('North');
  const [status, setStatus] = useState('Available');

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'available';
      case 'on trip': return 'ontrip';
      case 'in shop': return 'inshop';
      case 'retired': return 'retired';
      default: return 'draft';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!regNumber || !nameModel || !maxLoadCapacity || !currentOdometer || !acquisitionCost) {
      toast.error('All fields are required.');
      return;
    }

    try {
      addVehicle({
        regNumber,
        nameModel,
        type,
        maxLoadCapacity: parseFloat(maxLoadCapacity),
        currentOdometer: parseInt(currentOdometer),
        acquisitionCost: parseFloat(acquisitionCost),
        fuelType,
        vehicleYear: parseInt(vehicleYear),
        insuranceExpiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], // 1 year from now
        region,
        status
      });

      toast.success('Vehicle registered successfully!');
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to add vehicle.');
    }
  };

  const resetForm = () => {
    setRegNumber('');
    setNameModel('');
    setType('Van');
    setMaxLoadCapacity('');
    setCurrentOdometer('');
    setAcquisitionCost('');
    setFuelType('Diesel');
    setVehicleYear(new Date().getFullYear());
    setRegion('North');
    setStatus('Available');
  };

  return (
    <div className="fade-in">
      <div className="page-title-row">
        <h1 className="page-title">Vehicle Registry</h1>
        {user?.role === 'FLEET_MANAGER' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ➕ Add Vehicle
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reg Number</th>
              <th>Model / Name</th>
              <th>Type</th>
              <th>Region</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Status</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            {displayVehicles.map((v) => (
              <tr key={v.regNumber}>
                <td style={{ fontWeight: 600 }}>{v.regNumber}</td>
                <td>{v.nameModel}</td>
                <td>{v.type}</td>
                <td>{v.region}</td>
                <td>{v.maxLoadCapacity.toLocaleString()} kg</td>
                <td>{v.currentOdometer.toLocaleString()} km</td>
                <td>
                  <span className={`status-pill ${getStatusClass(v.status)}`}>
                    {v.status}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    fontWeight: 600, 
                    color: v.healthScore > 85 ? 'var(--accent-success)' : v.healthScore > 70 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                  }}>
                    {v.healthScore}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Register New Vehicle</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Reg Number *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. VAN-05" 
                      className="form-input"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model / Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ford Transit" 
                      className="form-input"
                      value={nameModel}
                      onChange={(e) => setNameModel(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="Van">Van</option>
                      <option value="Mini-Van">Mini-Van</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <select className="form-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Max Load Capacity (kg) *</label>
                    <input 
                      type="number" 
                      placeholder="500" 
                      className="form-input"
                      value={maxLoadCapacity}
                      onChange={(e) => setMaxLoadCapacity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Odometer (km) *</label>
                    <input 
                      type="number" 
                      placeholder="12000" 
                      className="form-input"
                      value={currentOdometer}
                      onChange={(e) => setCurrentOdometer(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Acquisition Cost ($) *</label>
                    <input 
                      type="number" 
                      placeholder="25000" 
                      className="form-input"
                      value={acquisitionCost}
                      onChange={(e) => setAcquisitionCost(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fuel Type</label>
                    <select className="form-select" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Available">Available</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetView;
