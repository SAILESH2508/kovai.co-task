/**
 * WelcomeBanner — greets the user on the dashboard.
 * Shows a time-aware greeting, motivational message based on task stats,
 * and can be dismissed. Remembers dismissal per session via sessionStorage.
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', icon: '☀️' };
  if (h < 17) return { text: 'Good afternoon', icon: '🌤️' };
  return { text: 'Good evening', icon: '🌙' };
}

function getMotivation(stats) {
  if (stats.total === 0)
    return { msg: "You're all set! Start by creating your first task.", color: 'var(--orange-600)' };
  if (stats.complete === stats.total)
    return { msg: '🎉 Amazing — you completed all your tasks!', color: '#16a34a' };
  const pct = Math.round((stats.complete / stats.total) * 100);
  if (pct >= 75)
    return { msg: `Almost there! ${pct}% of your tasks are complete.`, color: '#2563eb' };
  if (stats.inProgress > 0)
    return { msg: `You have ${stats.inProgress} task${stats.inProgress > 1 ? 's' : ''} in progress. Keep going!`, color: 'var(--orange-600)' };
  return { msg: `You have ${stats.total} task${stats.total > 1 ? 's' : ''} to work through. Let's get started!`, color: 'var(--orange-600)' };
}

export default function WelcomeBanner({ stats }) {
  const { user } = useAuth();
  const sessionKey = 'taskflow_banner_dismissed';
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(sessionKey));

  const dismiss = () => {
    sessionStorage.setItem(sessionKey, '1');
    setVisible(false);
  };

  if (!visible) return null;

  const { text: greetText, icon } = getGreeting();
  const { msg, color } = getMotivation(stats);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="welcome-banner mb-4" role="banner">
      {/* Decorative blobs */}
      <div className="welcome-blob welcome-blob-1" aria-hidden="true" />
      <div className="welcome-blob welcome-blob-2" aria-hidden="true" />

      <div className="welcome-banner-inner">
        {/* Left: text */}
        <div className="welcome-text">
          <div className="welcome-greeting">
            <span className="welcome-icon" aria-hidden="true">{icon}</span>
            {greetText}, <strong>{firstName}</strong>!
          </div>
          <p className="welcome-msg" style={{ '--motivation-color': color }}>
            {msg}
          </p>

          {/* Mini progress bar */}
          {stats.total > 0 && (
            <div className="welcome-progress-wrap">
              <div className="welcome-progress-bar">
                <div
                  className="welcome-progress-fill"
                  style={{ width: `${Math.round((stats.complete / stats.total) * 100)}%` }}
                  role="progressbar"
                  aria-valuenow={stats.complete}
                  aria-valuemin={0}
                  aria-valuemax={stats.total}
                  aria-label={`${stats.complete} of ${stats.total} tasks complete`}
                />
              </div>
              <span className="welcome-progress-label">
                {stats.complete}/{stats.total} complete
              </span>
            </div>
          )}
        </div>

        {/* Right: illustration */}
        <div className="welcome-illustration" aria-hidden="true">
          <div className="welcome-illo-circle">
            <i className="bi bi-check2-all" />
          </div>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        className="welcome-dismiss"
        onClick={dismiss}
        aria-label="Dismiss welcome banner"
        title="Dismiss"
      >
        <i className="bi bi-x" />
      </button>
    </div>
  );
}
