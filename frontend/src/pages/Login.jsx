import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect target
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      toast.success('Welcome back to TransitOps!');
      navigate(from, { replace: true });
    } else {
      toast.error(res.message);
    }
  };

  const quickFill = (roleType) => {
    switch (roleType) {
      case 'FLEET_MANAGER':
        setEmail('manager@transitops.com');
        setPassword('securepassword123');
        break;
      case 'DRIVER':
        setEmail('driver@transitops.com');
        setPassword('securepassword123');
        break;
      case 'SAFETY_OFFICER':
        setEmail('safety@transitops.com');
        setPassword('securepassword123');
        break;
      case 'FINANCIAL_ANALYST':
        setEmail('finance@transitops.com');
        setPassword('securepassword123');
        break;
      case 'DISPATCHER':
        setEmail('dispatch@transitops.com');
        setPassword('securepassword123');
        break;
      default:
        break;
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        width: '100%',
        maxWidth: '440px',
        padding: '32px',
        boxShadow: 'var(--modal-shadow)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'var(--font-family-title)',
            fontSize: '32px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-purple) 100%)',
            WebkitBackgroundClip: text => 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            TransitOps
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Smart Transport Operations Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. manager@transitops.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              backgroundColor: 'var(--accent-primary)',
              justifyContent: 'center',
              height: '42px',
              fontSize: '14px',
              marginTop: '8px'
            }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px'
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Quick Fill Demo Accounts
          </span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px', justifyContent: 'center' }}
              onClick={() => quickFill('FLEET_MANAGER')}
            >
              💼 Manager
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px', justifyContent: 'center' }}
              onClick={() => quickFill('DRIVER')}
            >
              🚚 Driver
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px', justifyContent: 'center' }}
              onClick={() => quickFill('SAFETY_OFFICER')}
            >
              🛡️ Safety
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px', justifyContent: 'center' }}
              onClick={() => quickFill('FINANCIAL_ANALYST')}
            >
              📈 Finance
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px', justifyContent: 'center', gridColumn: 'span 2' }}
              onClick={() => quickFill('DISPATCHER')}
            >
              ⚡ Dispatcher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
