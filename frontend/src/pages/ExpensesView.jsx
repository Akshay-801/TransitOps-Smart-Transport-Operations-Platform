import React, { useContext, useState } from 'react';
import { FleetContext } from '../context/FleetContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ExpensesView = () => {
  const { expenses, vehicles, addCustomExpense } = useContext(FleetContext);
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [vehicleReg, setVehicleReg] = useState('');
  const [expenseType, setExpenseType] = useState('Other');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description) {
      toast.error('Amount and Description are required.');
      return;
    }

    addCustomExpense({
      vehicleReg: vehicleReg || '—',
      tripId: null,
      expenseType,
      amount: parseFloat(amount),
      description
    });

    toast.success('Expense recorded with cryptographic auditing hash!');
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setVehicleReg('');
    setExpenseType('Other');
    setAmount('');
    setDescription('');
  };

  const totalExpenseSum = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fade-in">
      <div className="page-title-row">
        <h1 className="page-title">Fuel & Expense Management</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-card)', padding: '10px 20px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
            Total Outflow: <span style={{ color: 'var(--accent-danger)' }}>${totalExpenseSum.toLocaleString()}</span>
          </div>
          {user?.role === 'FINANCIAL_ANALYST' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              💳 Log Expense
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Date</th>
              <th>Audit Check</th>
              <th>Cryptographic Hash (SHA-256)</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} style={{ backgroundColor: exp.isAnomaly ? 'rgba(231, 76, 60, 0.05)' : 'inherit' }}>
                <td style={{ fontWeight: 600 }}>E{exp.id.toString().padStart(3, '0')}</td>
                <td>{exp.vehicleReg}</td>
                <td>
                  <span className={`status-pill ${exp.expenseType === 'Fuel' ? 'ontrip' : exp.expenseType === 'Maintenance' ? 'inshop' : 'draft'}`}>
                    {exp.expenseType}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: exp.isAnomaly ? 'var(--accent-danger)' : 'inherit' }}>
                  ${exp.amount.toLocaleString()}
                </td>
                <td>{exp.description}</td>
                <td>{exp.date}</td>
                <td>
                  {exp.isAnomaly ? (
                    <span className="status-pill retired" style={{ fontSize: '11px', padding: '2px 6px' }}>
                      ⚠️ SUSPICIOUS
                    </span>
                  ) : (
                    <span className="status-pill available" style={{ fontSize: '11px', padding: '2px 6px' }}>
                      ✓ VERIFIED
                    </span>
                  )}
                </td>
                <td style={{ fontStyle: 'italic', fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '11px' }}>
                  {exp.recordHash}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Expense Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Record Fleet Expense</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Associated Vehicle (Optional)</label>
                  <select className="form-select" value={vehicleReg} onChange={(e) => setVehicleReg(e.target.value)}>
                    <option value="">-- No Specific Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.regNumber} value={v.regNumber}>{v.regNumber}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Expense Type</label>
                    <select className="form-select" value={expenseType} onChange={(e) => setExpenseType(e.target.value)}>
                      <option value="Fuel">Fuel</option>
                      <option value="Tolls">Tolls / Taxes</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Other">Other Expenses</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expense Amount ($) *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 50" 
                      className="form-input"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Parking fees or Toll gate pass" 
                    className="form-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Secure Log Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
