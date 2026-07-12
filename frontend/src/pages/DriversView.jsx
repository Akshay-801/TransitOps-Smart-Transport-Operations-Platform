import React, { useContext, useState } from 'react';
import { FleetContext } from '../context/FleetContext';
import { toast } from 'react-hot-toast';

const DriversView = () => {
  const { drivers, addDriver } = useContext(FleetContext);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('Standard');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [contact, setContact] = useState('');
  const [region, setRegion] = useState('North');
  const [status, setStatus] = useState('Available');

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'available';
      case 'on trip': return 'ontrip';
      case 'off duty': return 'draft';
      case 'suspended': return 'retired';
      default: return 'draft';
    }
  };

  const isExpired = (dateStr) => {
    return new Date(dateStr) < new Date();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !licenseNumber || !licenseExpiry || !contact) {
      toast.error('All fields are required.');
      return;
    }

    addDriver({
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      contact,
      region,
      status
    });

    toast.success('Driver profile created successfully!');
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setLicenseNumber('');
    setLicenseCategory('Standard');
    setLicenseExpiry('');
    setContact('');
    setRegion('North');
    setStatus('Available');
  };

  return (
    <div className="fade-in">
      <div className="page-title-row">
        <h1 className="page-title">Driver Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Add Driver
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>License No.</th>
              <th>Category</th>
              <th>License Expiry</th>
              <th>Contact</th>
              <th>Region</th>
              <th>Status</th>
              <th>Safety Score</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const expired = isExpired(d.licenseExpiry);
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>{d.licenseNumber}</td>
                  <td>{d.licenseCategory}</td>
                  <td style={{ 
                    color: expired ? 'var(--accent-danger)' : 'inherit',
                    fontWeight: expired ? 600 : 'normal' 
                  }}>
                    {d.licenseExpiry} {expired && '⚠️ (Expired)'}
                  </td>
                  <td>{d.contact}</td>
                  <td>{d.region}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(d.status)}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      fontWeight: 600, 
                      color: d.safetyScore >= 90 ? 'var(--accent-success)' : d.safetyScore >= 75 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                    }}>
                      {d.safetyScore}/100
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Driver Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Register Driver Profile</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alex Jones" 
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">License Number *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. DL-883718" 
                      className="form-input"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License Category</label>
                    <select className="form-select" value={licenseCategory} onChange={(e) => setLicenseCategory(e.target.value)}>
                      <option value="Standard">Standard (Class C)</option>
                      <option value="Medium Cargo">Medium Cargo (Class B)</option>
                      <option value="Heavy Vehicle">Heavy Vehicle (Class A)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">License Expiry Date *</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={licenseExpiry}
                      onChange={(e) => setLicenseExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +1-555-0199" 
                      className="form-input"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <select className="form-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Available">Available</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversView;
