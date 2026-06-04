import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ActivityFeed({ open, onClose }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const ch = supabase
      .channel('pinned_activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, p => {
        addEvent(p.new, 'joined');
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, p => {
        addEvent(p.new, 'updated');
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  function addEvent(profile, type) {
    setEvents(prev => [{
      id: Date.now(),
      profile,
      type,
      time: new Date(),
    }, ...prev].slice(0, 50));
  }

  function timeAgo(d) {
    const s = Math.floor((new Date() - d) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    return `${Math.floor(s/3600)}h ago`;
  }

  return (
    <div style={{ ...styles.panel, transform: open ? 'translateX(0)' : 'translateX(100%)' }}>
      <div style={styles.head}>
        <span style={styles.title}>⚡ Live Activity</span>
        <button style={styles.close} onClick={onClose}>✕</button>
      </div>
      <div style={styles.body}>
        {events.length === 0
          ? <div style={styles.empty}>Waiting for activity...<br/><span style={{ fontSize:10 }}>Events will appear here in real time</span></div>
          : events.map(ev => (
          <div key={ev.id} style={styles.row}>
            <div style={styles.pfp}>
              {ev.profile.avatar_url
                ? <img src={ev.profile.avatar_url} style={styles.pfpImg} alt="" />
                : <span style={{ fontSize:14 }}>👤</span>
              }
            </div>
            <div style={styles.text}>
              <div style={styles.name}>{ev.profile.username || 'Anonymous'}</div>
              <div style={styles.desc}>
                {ev.type === 'joined' ? '📍 joined the map' : '✏️ updated profile'}
                {ev.profile.location_country ? ` from ${ev.profile.location_country}` : ''}
              </div>
            </div>
            <div style={styles.time}>{timeAgo(ev.time)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  panel: { position:'absolute', top:84, bottom:0, right:0, width:'min(300px,85vw)', background:'rgba(10,10,10,0.97)', borderLeft:'1px solid #1E1E1E', zIndex:490, display:'flex', flexDirection:'column', transition:'transform 0.3s cubic-bezier(0.16,1,0.3,1)' },
  head:  { padding:'14px 16px 12px', borderBottom:'1px solid #1E1E1E', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  title: { fontFamily:'var(--font-d)', fontSize:16, fontWeight:800, color:'#fff', letterSpacing:'-0.01em' },
  close: { background:'none', border:'none', color:'#444', fontSize:18, padding:'2px 6px', lineHeight:1 },
  body:  { flex:1, overflowY:'auto', padding:'4px 0' },
  empty: { textAlign:'center', padding:'28px 16px', fontSize:12, color:'#444', lineHeight:1.8, fontFamily:'var(--font-b)' },
  row:   { display:'flex', alignItems:'flex-start', gap:9, padding:'10px 14px', borderBottom:'1px solid rgba(30,30,30,0.5)', animation:'fadeUp 0.4s ease both' },
  pfp:   { width:30, height:30, borderRadius:'50%', border:'1.5px solid #2A2A2A', background:'#161616', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' },
  pfpImg:{ width:'100%', height:'100%', objectFit:'cover' },
  text:  { flex:1, minWidth:0 },
  name:  { fontFamily:'var(--font-d)', fontSize:12, fontWeight:700, color:'#fff' },
  desc:  { fontSize:10, color:'#555', marginTop:2, fontFamily:'var(--font-b)' },
  time:  { fontSize:9, color:'#333', flexShrink:0, fontFamily:'var(--font-m)', marginTop:2 },
};
