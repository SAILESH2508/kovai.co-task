/**
 * LoginPage — Dark/orange themed with animated background orbs.
 * Uses Google Identity Services prompt() + renderButton fallback.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [gisReady, setGisReady] = useState(false);

  const handleGoogleResponse = useCallback(async (response) => {
    if (!response?.credential) {
      setError('No credential received from Google. Please try again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle(response.credential);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  }, [loginWithGoogle, navigate]);

  const callbackRef = useRef(handleGoogleResponse);
  useEffect(() => { callbackRef.current = handleGoogleResponse; }, [handleGoogleResponse]);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID') {
      setError('Google Client ID is not configured. Check your .env file.');
      return;
    }

    let cancelled = false; // cleanup flag for StrictMode double-invoke

    const init = () => {
      if (cancelled) return;
      if (!window.google?.accounts?.id) { setTimeout(init, 150); return; }
      // Cancel any previously-initialized instance before re-initializing
      try { window.google.accounts.id.cancel(); } catch (_) { /* ignore */ }
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => callbackRef.current(resp),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      if (!cancelled) setGisReady(true);
    };

    init();
    return () => { cancelled = true; };
  }, []);

  const handleButtonClick = () => {
    if (!window.google?.accounts?.id) {
      setError('Google sign-in is not ready yet. Please wait a moment.');
      return;
    }
    setError('');
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const container = document.getElementById('gis-hidden-btn');
        container.innerHTML = '';
        window.google.accounts.id.renderButton(container, {
          theme: 'outline', size: 'large', type: 'standard', width: 1,
        });
        setTimeout(() => {
          const btn = container.querySelector('div[role="button"]') || container.firstElementChild;
          btn?.click();
        }, 100);
      }
    });
  };

  return (
    <div className="login-page">
      {/* Soft background blobs */}
      <div className="login-orb login-orb-1" aria-hidden="true" />
      <div className="login-orb login-orb-2" aria-hidden="true" />
      <div className="login-orb login-orb-3" aria-hidden="true" />

      <div className="login-outer">

        {/* Left branding panel — desktop only */}
        <div className="login-brand-panel">
          <div>
            <div className="login-brand-headline">
              Organise your<br /><span>work & life.</span>
            </div>
            <p className="login-brand-sub">
              A clean, focused task manager. Create tasks, track progress,
              and get things done — all in one place.
            </p>
          </div>
          <div className="login-feature-list">
            {[
              { icon: 'bi-lightning-charge-fill', text: 'Create tasks instantly' },
              { icon: 'bi-arrow-repeat',          text: 'Track status in real time' },
              { icon: 'bi-shield-lock-fill',      text: 'Secured with Google Sign-In' },
              { icon: 'bi-phone-fill',            text: 'Works on any device' },
            ].map(({ icon, text }) => (
              <div key={text} className="login-feature-item">
                <div style={{
                  width: 32, height: 32, flexShrink: 0,
                  background: 'linear-gradient(135deg,var(--orange-400),var(--orange-500))',
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.85rem',
                }}>
                  <i className={`bi ${icon}`} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Sign-in card */}
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo-wrap">
            <i className="bi bi-check2-square" aria-hidden="true" />
          </div>

          <h1 className="login-title">TaskFlow</h1>
          <p className="login-subtitle">Plan, track, and complete your tasks.</p>

          <hr className="login-divider" />

          <p className="login-label">Sign in to access your dashboard</p>

          {/* Error */}
          {error && (
            <div
              className="d-flex align-items-start gap-2 mb-3 p-3"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                color: '#dc2626',
                fontSize: '0.82rem',
              }}
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1" />
              <span>{error}</span>
            </div>
          )}

          {/* Button */}
          {loading ? (
            <div className="d-flex align-items-center justify-content-center gap-3 py-3" style={{ color: 'var(--gray-500)' }}>
              <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ color: 'var(--orange-500)' }} />
              <span style={{ fontSize: '0.9rem' }}>Signing you in…</span>
            </div>
          ) : (
            <button
              className="btn-google"
              onClick={handleButtonClick}
              disabled={!gisReady}
              aria-label="Continue with Google"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {gisReady ? 'Continue with Google' : 'Loading…'}
            </button>
          )}

          {/* Hidden GIS fallback */}
          <div id="gis-hidden-btn" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1, overflow: 'hidden' }} />

          <hr className="login-divider" />
          <p className="login-footer-text">
            Your tasks are private and only visible to you.<br />
            This is an assessment project — no sensitive data should be stored.
          </p>
        </div>

      </div>
    </div>
  );
}
