import React, { useEffect, useState } from 'react';
import { checkHealth } from '../services/api.js';

/** Live backend/database status - polls the real /api/health endpoint. */
export default function StatusPill() {
  const [state, setState] = useState('checking'); // checking | online | degraded | offline

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const h = await checkHealth();
        if (!cancelled) setState(h.db === 'ok' ? 'online' : 'degraded');
      } catch (err) {
        if (!cancelled) setState(err.status === 503 ? 'degraded' : 'offline');
      }
    }
    poll();
    const id = setInterval(poll, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const label = { checking: 'CONNECTING', online: 'SYSTEM ONLINE', degraded: 'DB DOWN', offline: 'API OFFLINE' }[state];
  return (
    <span className={`status-pill status-${state}`} title="Live status of the CyberShild API">
      <span className="status-dot" />
      {label}
    </span>
  );
}
