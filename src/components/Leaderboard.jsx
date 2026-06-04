import React from 'react';
import { Avatar, VerifyBadge } from './ProfileCard';

export default function Leaderboard({ profiles, open, onClose, onPinClick }) {
  const sorted = [...profiles].sort((a, b) => {
    const ac = (a.wallet_collections?.length || 0);
    const bc = (b.wallet_collections?.length || 0);
    return bc - ac;
  });

  return (
    <Panel open={open} side="left">
      <PanelHead title="🏆 Top Holders" onClose={onClose} />
      <div style={{ flex:1, overflowY:'auto' }}>
        {sorted.map((p, i) => (
          <div key={p.id} onClick={() => { onPinClick(p); onClose(); }}
            style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 14px', borderBottom:'1px solid rgba(30,30,30,0.6)',
              cursor:'pointer', transition:'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(202,255,0,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            {/* Rank */}
            <div style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, width:22,
              textAlign:'center', flexShrink:0,
              color: i===0 ? '#F5FF00' : i===1 ? '#C0C0C0' : i===2 ? '#CD7F32' : '#444',
            }}>
              {i+1}
            </div>
            <Avatar profile={p} size={34} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {p.username || 'Anon'}
                </span>
                {p.twitter_verified && <VerifyBadge label="𝕏" color="#1DA1F2" />}
                {p.discord_verified && <VerifyBadge label="DC" color="#5865F2" />}
              </div>
              <div style={{ fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", marginTop:1 }}>
                📍 {[p.location_state, p.location_country].filter(Boolean).join(', ')}
              </div>
            </div>
            {/* Collection dots */}
            <div style={{ display:'flex', gap:3, flexShrink:0 }}>
              {(p.wallet_collections || []).map(wc => (
                <div key={wc.collection_id} style={{
                  width:8, height:8, borderRadius:'50%',
                  background: wc.collections?.color || '#CAFF00',
                }} title={wc.collections?.name} />
              ))}
            </div>
          </div>
        ))}
        {!sorted.length && (
          <div style={{ padding:24, textAlign:'center', fontSize:12, color:'#444', fontFamily:"'DM Mono',monospace" }}>
            No holders yet
          </div>
        )}
      </div>
    </Panel>
  );
}

export function ActivityFeed({ events, open, onClose }) {
  return (
    <Panel open={open} side="right">
      <PanelHead title="⚡ Activity" onClose={onClose} />
      <div style={{ flex:1, overflowY:'auto' }}>
        {events.length === 0 && (
          <div style={{ padding:24, textAlign:'center', fontSize:12, color:'#444', fontFamily:"'DM Mono',monospace" }}>
            Waiting for activity...
          </div>
        )}
        {events.map((ev, i) => (
          <div key={i} style={{
            display:'flex', gap:9, padding:'10px 14px',
            borderBottom:'1px solid rgba(30,30,30,0.4)',
            animation:'slideIn 0.4s ease both',
          }}>
            <Avatar profile={ev} size={28} />
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#fff' }}>
                {ev.username || 'Anon'}
              </div>
              <div style={{ fontSize:10, color:'#555', marginTop:1 }}>
                {ev.type === 'joined' ? `joined from ${ev.location_country || 'somewhere'}` : 'updated their profile'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Panel({ children, open, side }) {
  return (
    <div style={{
      position:'absolute', top:128, bottom:0,
      width:'min(300px,85vw)',
      [side]: 0,
      background:'rgba(10,10,10,0.97)',
      border: side==='left' ? '1px solid #1E1E1E' : 'none',
      borderLeft: side==='right' ? '1px solid #1E1E1E' : undefined,
      zIndex:490, display:'flex', flexDirection:'column',
      transform: open ? 'translateX(0)' : side==='left' ? 'translateX(-100%)' : 'translateX(100%)',
      transition:'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {children}
    </div>
  );
}

function PanelHead({ title, onClose }) {
  return (
    <div style={{
      padding:'14px 16px 12px', borderBottom:'1px solid #1E1E1E',
      display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0,
    }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:'#fff', letterSpacing:'-0.01em' }}>
        {title}
      </div>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'#555', fontSize:18, cursor:'pointer', padding:'2px 6px' }}>✕</button>
    </div>
  );
}
