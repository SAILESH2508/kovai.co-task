/**
 * Navbar — sticky glassmorphism header with orange brand gradient text.
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="app-navbar" aria-label="Main navigation">
      <div className="container-lg d-flex align-items-center justify-content-between py-2">

        {/* Brand */}
        <div className="d-flex align-items-center gap-2">
          <div className="navbar-brand-icon" aria-hidden="true">
            <i className="bi bi-check2-square" />
          </div>
          <span className="navbar-brand-text">TaskFlow</span>
        </div>

        {/* Right side */}
        <div className="d-flex align-items-center gap-3">
          {/* User info */}
          <div className="d-none d-sm-flex align-items-center gap-2">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="user-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="user-avatar-initials" aria-hidden="true">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="d-none d-md-block">
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray-800)', lineHeight: 1.2 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="d-none d-sm-block" style={{ width: 1, height: 28, background: 'var(--gray-200)' }} aria-hidden="true" />

          {/* Logout */}
          <button className="btn-logout" onClick={logout} aria-label="Log out">
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
