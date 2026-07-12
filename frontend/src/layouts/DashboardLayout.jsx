import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FleetContext } from '../context/FleetContext';

const DashboardLayout = () => {
  const { alerts, isApiOnline } = useContext(FleetContext);
  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">TransitOps</div>
        </div>
        <nav className="sidebar-menu">
          <NavLink to="/" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/fleet" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
            <span>🚚</span> Fleet
          </NavLink>
          <NavLink to="/drivers" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
            <span>👤</span> Drivers
          </NavLink>
          <NavLink to="/trips" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
            <span>🗺️</span> Trips
          </NavLink>
          <NavLink to="/maintenance" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
            <span>🔧</span> Maintenance
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
            <span>💳</span> Fuel & Expenses
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
            <span>📈</span> Analytics
          </NavLink>
        </nav>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        {/* Upper Header */}
        <header className="top-header">
          <div className="search-container">
            <input type="text" placeholder="Search vehicle, driver or trips..." className="search-input" />
          </div>

          <div className="header-actions" style={{ gap: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: isApiOnline ? 'var(--accent-success)' : 'var(--accent-warning)', 
              fontSize: '13px', 
              fontWeight: 600,
              background: 'rgba(255,255,255,0.03)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: `1px solid ${isApiOnline ? 'rgba(46, 204, 113, 0.2)' : 'rgba(230, 126, 34, 0.2)'}`
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: isApiOnline ? 'var(--accent-success)' : 'var(--accent-warning)',
                display: 'inline-block'
              }}></span>
              {isApiOnline ? 'Database Connected' : 'Server Offline (Fallback)'}
            </div>

            {activeAlertsCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e74c3c', fontSize: '13px', fontWeight: 600 }}>
                <span>⚠️</span> {activeAlertsCount} Active Alerts
              </div>
            )}
            <div className="user-profile">
              <div className="user-avatar">RK</div>
              <div className="user-info">
                <span className="user-name">Raven K.</span>
                <span className="user-role"><span className="role-badge">Fleet Manager</span></span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <div className="page-container fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
