import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: '#111', border: `1.5px solid ${toast.type === 'ok' ? '#CAFF00' : '#FF3CAC'}`,
      borderRadius: 50, padding: '10px 22px', fontFamily: 'var(--font-d)',
      fontSize: 13, fontWeight: 700, color: toast.type === 'ok' ? '#CAFF00' : '#FF3CAC',
      whiteSpace: 'nowrap', pointerEvents: 'none',
      animation: 'fadeIn 0.3s ease',
    }}>
      {toast.msg}
    </div>
  );
}
