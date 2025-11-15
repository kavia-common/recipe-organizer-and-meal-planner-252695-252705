import React from 'react';
import { getAuthStatus } from '../services/apiClient';

/**
 * PUBLIC_INTERFACE
 * Non-secret diagnostics banner shown only in development.
 * Displays the resolved TheMealDB base URL. No API key is required.
 */
export default function DiagnosticsBanner() {
  const dev = process.env.NODE_ENV !== 'production';
  if (!dev) return null;

  const { baseUrl } = getAuthStatus();

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
      }}
    >
      <strong style={{ color: '#2563EB' }}>Diagnostics</strong>
      <span>Base URL: <code>{baseUrl}</code></span>
      <span>No API key required</span>
      <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
        Visible in development only.
      </span>
    </div>
  );
}
