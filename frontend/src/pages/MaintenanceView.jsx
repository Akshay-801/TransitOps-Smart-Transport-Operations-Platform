import React, { useContext, useState } from 'react';
import { FleetContext } from '../context/FleetContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const MaintenanceView = () => {
  const { maintenanceLogs, vehicles, addMaintenance, closeMaintenance } = useContext(FleetContext);
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [vehicleReg, setVehicleReg] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('Preventative');
  const [priority, setPriority] = useState('Medium');
  const [cost, setCost] = useState('');

  const getPriorityColor = (p) => {
    switch (p?.toLowerCase()) {
      case 'high': return 'var(--accent-danger)';
      case 'medium': return 'var(--accent-warning)';
      case 'low': return 'var(--accent-success)';
      default: return 'inherit';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleReg || !issueDescription || !cost) {
      toast.error('Vehicle, Issue Description and Cost are required.');
      return;
    }

    addMaintenance({
      vehicleReg,
      issueDescription,
      maintenanceType,
      priority,
      cost
    });

    toast.success(`Vehicle ${vehicleReg} placed in maintenance! Status is now 'In Shop'.`);
    setShowModal(false);
    resetForm();
  };

  const handleResolve = (logId, vehicleReg) => {
    try {
      closeMaintenance(logId);
      toast.success(`Maintenance resolved! Vehicle ${vehicleReg} is now restored to 'Available' status.`);
    } catch (err) {
      toast.error(err.message || 'Failed to resolve maintenance.');
    }
  };

  const resetForm = () => {
    setVehicleReg('');
    setIssueDescription('');
    setMaintenanceType('Preventative');
    setPriority('Medium');
    setCost('');
  };

  // Only vehicles that can go in shop: those not already retired and not currently in shop or on trip
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired' && v.status !== 'In Shop' && v.status !== 'On Trip');

  const isManager = user?.role === 'FLEET_MANAGER';

  return (
    <div className="fade-in">
      <div className="page-title-row">
        <h1 className="page-title">Maintenance Logistics</h1>
        {isManager && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            🔧 Log Maintenance
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Vehicle Reg</th>
              <th>Issue Description</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Resolution Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontWeight: 600 }}>M{log.id.toString().padStart(3, '0')}</td>
                <td>{log.vehicleReg}</td>
                <td>{log.issueDescription}</td>
                <td>{log.maintenanceType}</td>
                <td style={{ color: getPriorityColor(log.priority), fontWeight: 600 }}>{log.priority}</td>
                <td>${log.cost.toLocaleString()}</td>
                <td>
                  <span className={`status-pill ${log.isOpen ? 'inshop' : 'completed'}`}>
                    {log.isOpen ? 'In Shop' : 'Closed'}
                  </span>
                </td>
                <td>{log.resolvedDate || '—'}</td>
                <td>
                  {log.isOpen ? (
                    isManager ? (
                      <button 
                        className="btn btn-success" 
                        style={{ padding: '6px 12px', fontSize: '12px' }} 
                        onClick={() => handleResolve(log.id, log.vehicleReg)}
                      >
                        ✓ Resolve
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--accent-warning)', fontWeight: 500 }}>In Progress</span>
                    )
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Resolved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Maintenance Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Schedule Vehicle Maintenance</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Vehicle *</label>
                  <select className="form-select" value={vehicleReg} onChange={(e) => setVehicleReg(e.target.value)} required>
                    <option value="">-- Select Available Vehicle --</option>
                    {activeVehicles.map(v => (
                      <option key={v.regNumber} value={v.regNumber}>
                        {v.regNumber} - {v.nameModel} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Issue Description *</label>
                  <textarea 
                    placeholder="Describe maintenance issues..." 
                    className="form-textarea"
                    rows="3"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Maintenance Type</label>
                    <select className="form-select" value={maintenanceType} onChange={(e) => setMaintenanceType(e.target.value)}>
                      <option value="Preventative">Preventative</option>
                      <option value="Repair">Repair</option>
                      <option value="Inspection">Inspection</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Service Cost ($) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 250" 
                    className="form-input"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Place In Shop</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceView;
