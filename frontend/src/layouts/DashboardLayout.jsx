import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FleetContext } from '../context/FleetContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const DashboardLayout = () => {
  const { alerts, isApiOnline } = useContext(FleetContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const activeAlertsCount = alerts ? alerts.filter(a => a.status === 'Active').length : 0;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRole = (role) => {
    if (!role) return '';
    return role
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Define screen permissions based on Role
  const role = user?.role || '';
  const canViewDashboard = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'].includes(role);
  const canViewFleet = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'].includes(role);
  const canViewDrivers = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'DRIVER'].includes(role);
  const canViewTrips = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'DRIVER'].includes(role);
  const canViewMaintenance = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'].includes(role);
  const canViewExpenses = ['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'].includes(role);
  const canViewAnalytics = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'].includes(role);

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">TransitOps</div>
        </div>
        <nav className="sidebar-menu">
          {canViewDashboard && (
            <NavLink to="/" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
              <span>📊</span> Dashboard
            </NavLink>
          )}

          {canViewFleet && (
            <NavLink to="/fleet" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
              <span>🚚</span> Fleet
            </NavLink>
          )}

          {canViewDrivers && (
            <NavLink to="/drivers" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
              <span>👤</span> Drivers
            </NavLink>
          )}

          {canViewTrips && (
            <NavLink to="/trips" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
              <span>🗺️</span> Trips
            </NavLink>
          )}

          {canViewMaintenance && (
            <NavLink to="/maintenance" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
              <span>🔧</span> Maintenance
            </NavLink>
          )}

          {canViewExpenses && (
            <NavLink to="/expenses" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
              <span>💳</span> Fuel & Expenses
            </NavLink>
          )}

          {canViewAnalytics && (
            <NavLink to="/analytics" className={({ isActive }) => `sidebar-item-btn ${isActive ? 'active' : ''}`}>
              <span>📈</span> Analytics
            </NavLink>
          )}
        </nav>

        {/* Sidebar Footer Logout */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
        }}>
          <button 
            className="sidebar-item-btn" 
            onClick={handleLogout}
            style={{ 
              color: 'var(--accent-danger)', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <span>🚪</span> Log Out
          </button>
        </div>
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
              <div className="user-avatar">{getInitials(user?.name)}</div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role"><span className="role-badge">{formatRole(user?.role)}</span></span>
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
