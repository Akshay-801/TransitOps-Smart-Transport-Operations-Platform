import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

const AnalyticsView = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [roiData, setRoiData] = useState([]);
  const [efficiencyData, setEfficiencyData] = useState([]);
  const [costData, setCostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  const canViewRoi = ['FLEET_MANAGER', 'FINANCIAL_ANALYST'].includes(user?.role);
  const canExportCsv = canViewRoi;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryRes, effRes, costRes] = await Promise.all([
        apiService.analytics.summary(),
        apiService.analytics.fuelEfficiency(),
        apiService.analytics.operationalCost(),
      ]);
      setSummary(summaryRes);
      setEfficiencyData(Array.isArray(effRes) ? effRes : []);
      setCostData(Array.isArray(costRes) ? costRes : []);

      if (canViewRoi) {
        const roiRes = await apiService.analytics.vehicleRoi();
        setRoiData(Array.isArray(roiRes) ? roiRes : []);
      }
    } catch (err) {
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const blob = await apiService.analytics.exportCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transitops-trips.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('CSV exported successfully!');
    } catch (err) {
      toast.error('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-in" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-title-row">
        <h1 className="page-title">Reports & Analytics</h1>
        {canExportCsv && (
          <button
            className="btn btn-primary"
            onClick={handleExportCsv}
            disabled={exportLoading}
          >
            {exportLoading ? '⏳ Exporting...' : '⬇️ Export CSV'}
          </button>
        )}
      </div>

      {/* Fleet KPI Summary */}
      {summary && (
        <div className="card-grid" style={{ marginBottom: '24px' }}>
          <div className="kpi-card blue">
            <span className="kpi-title">Fleet Utilization</span>
            <span className="kpi-value">{summary.fleetUtilizationPercent}%</span>
          </div>
          <div className="kpi-card green">
            <span className="kpi-title">Active Vehicles</span>
            <span className="kpi-value">{String(summary.activeVehicles).padStart(2, '0')}</span>
          </div>
          <div className="kpi-card orange">
            <span className="kpi-title">In Maintenance</span>
            <span className="kpi-value">{String(summary.inMaintenance).padStart(2, '0')}</span>
          </div>
          <div className="kpi-card purple">
            <span className="kpi-title">Completed Trips</span>
            <span className="kpi-value">{String(summary.completedTrips).padStart(2, '0')}</span>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Fuel Efficiency Table */}
        <div className="table-container">
          <div className="table-header-row">
            <h3 className="table-title">⛽ Fuel Efficiency (km/L)</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Total KM</th>
                <th>Liters Used</th>
                <th>km/L</th>
              </tr>
            </thead>
            <tbody>
              {efficiencyData.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data yet</td></tr>
              ) : efficiencyData.map((row) => (
                <tr key={row.vehicleId}>
                  <td style={{ fontWeight: 600 }}>{row.registrationNumber}</td>
                  <td>{row.totalKmDriven}</td>
                  <td>{row.totalLitersFueled}</td>
                  <td>
                    <span style={{ color: row.kmPerLiter > 10 ? 'var(--accent-success)' : 'var(--accent-warning)', fontWeight: 600 }}>
                      {row.kmPerLiter}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Operational Cost Table */}
        <div className="table-container">
          <div className="table-header-row">
            <h3 className="table-title">💸 Operational Cost</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Fuel ($)</th>
                <th>Expenses ($)</th>
                <th>Total ($)</th>
              </tr>
            </thead>
            <tbody>
              {costData.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data yet</td></tr>
              ) : costData.map((row) => (
                <tr key={row.vehicleId}>
                  <td style={{ fontWeight: 600 }}>{row.registrationNumber}</td>
                  <td>${Number(row.fuelCost).toLocaleString()}</td>
                  <td>${Number(row.otherExpenses).toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>
                    ${Number(row.totalOperationalCost).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ROI Table (Manager & Finance only) */}
        {canViewRoi && (
          <div className="table-container" style={{ gridColumn: 'span 2' }}>
            <div className="table-header-row">
              <h3 className="table-title">📈 Vehicle ROI Analysis</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                ROI = (Revenue − Costs) / Acquisition Cost × 100
              </span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Acquisition ($)</th>
                  <th>Revenue ($)</th>
                  <th>Fuel ($)</th>
                  <th>Maintenance ($)</th>
                  <th>Net Profit ($)</th>
                  <th>ROI %</th>
                </tr>
              </thead>
              <tbody>
                {roiData.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No completed trips to compute ROI</td></tr>
                ) : roiData.map((row) => (
                  <tr key={row.vehicleId}>
                    <td style={{ fontWeight: 600 }}>{row.registrationNumber}</td>
                    <td>${Number(row.acquisitionCost).toLocaleString()}</td>
                    <td style={{ color: 'var(--accent-success)' }}>${Number(row.revenue).toLocaleString()}</td>
                    <td>${Number(row.fuelCost).toLocaleString()}</td>
                    <td>${Number(row.maintenanceCost).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: Number(row.netProfit) >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                      ${Number(row.netProfit).toLocaleString()}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: Number(row.roiPercent) > 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
                      }}>
                        {row.roiPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;
