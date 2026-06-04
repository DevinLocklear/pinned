import React from 'react';

export default function StatsBar({ holders, countries, collections }) {
  return (
    <div style={{
      position:'absolute', top:52, left:0, right:0, height:32,
      background:'rgba(10,10,10,0.92)', borderBottom:'1px solid #1E1E1E',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:499, backdropFilter:'blur(8px)',
    }}>
      {[
        { num: holders, label: 'Holders' },
        { num: countries, label: 'Countries' },
        { num: collections, label: 'Collections' },
      ].map((s, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center', gap:5,
          padding:'0 16px', borderRight: i < 2 ? '1px solid #1E1E1E' : 'none',
          fontSize:11, color:'#555', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap',
        }}>
          <span style={{ color:'#CAFF00', fontWeight:700, fontSize:12, fontFamily:"'DM Mono',monospace" }}>
            {s.num}
          </span>
          {s.label}
        </div>
      ))}
    </div>
  );
}
