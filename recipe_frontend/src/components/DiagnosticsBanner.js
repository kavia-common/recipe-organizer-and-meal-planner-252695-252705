import React, { useEffect, useState } from 'react';
import { getAuthStatus, apiClient } from '../services/apiClient';

/**
 * PUBLIC_INTERFACE
 * Non-secret diagnostics banner shown only in development.
 * Displays the resolved TheMealDB base URL and connectivity state.
 * Performs a tiny health-check on mount and shows a graceful note if failing.
 */
export default function DiagnosticsBanner() {
  // Hooks must be called unconditionally
  const [health, setHealth] = useState({ ok: true, checking: true, msg: '' });
  const status = getAuthStatus();
  const dev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    if (!dev) return; // still allowed inside effect body
    let active = true;
    (async () => {
      try {
        const res = await apiClient.healthCheck();
        if (!active) return;
        setHealth({ ok: !!res.ok, checking: false, msg: res.ok ? '' : 'Health check failed' });
      } catch (e) {
        if (!active) return;
        setHealth({ ok: false, checking: false, msg: e?.message || 'Health check failed' });
      }
    })();
    return () => {
      active = false;
    };
  }, [dev]);

  if (!dev) return null;

  const hint = !health.ok
    ? 'If you see "Failed to fetch", check that you are online and retry the action.'
    : '';

  return (
    <div
      role="note"
      aria-label="Diagnostics banner"
      style={{
        background: 'linear-gradient(90deg, rgba(37,99,235,0.08), rgba(249,250,251,1))',
        borderBottom: '1px dashed #93c5fd',
        color: '#111827',
        padding: '8px 16px',
        fontSize: 12,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      <strong style={{ color: '#2563EB' }}>Diagnostics</strong>
      <span>Base URL: <code>{status.baseUrl}</code></span>
      <span>Online: <strong>{String(status.online)}</strong></span>
      {health.checking ? (
        <span>Health: checking…</span>
      ) : (
        <span>Health: <strong style={{ color: health.ok ? '#16a34a' : '#EF4444' }}>{health.ok ? 'ok' : 'fail'}</strong></span>
      )}
      {!!status.lastFailingUrl && (
        <span title="Last failing request URL (dev only)">
          Last error URL: <code>{status.lastFailingUrl}</code>
        </span>
      )}
      {!health.ok && (
        <span style={{ color: '#EF4444' }}>
          {health.msg} — {hint}
        </span>
      )}
      <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
        Visible in development only.
      </span>
    </div>
  );
}
