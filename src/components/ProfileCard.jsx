import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileCard({ profile }) {
  const navigate = useNavigate();
  if (!profile) return null;

  const collections = profile.wallet_collections?.map(wc => wc.collections).filter(Boolean) || [];

  return (
    <div style={{ width:230, padding:14 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <Avatar profile={profile} size={42} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{
            fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:'#fff',
            display:'flex', alignItems:'center', gap:4, overflow:'hidden',
          }}>
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {profile.username || 'Anon'}
            </span>
            {profile.twitter_verified && <VerifyBadge label="𝕏" color="#1DA1F2" />}
            {profile.discord_verified && <VerifyBadge label="DC" color="#5865F2" />}
          </div>
          <div style={{ fontSize:10, color:'#555', fontFamily:"'DM Mono',monospace", marginTop:1 }}>
            📍 {[profile.location_state, profile.location_country].filter(Boolean).join(', ')}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div style={{
          fontSize:11, color:'#888', lineHeight:1.5, marginBottom:8,
          overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
        }}>
          {profile.bio}
        </div>
      )}

      {/* Collection badges */}
      {collections.length > 0 && (
        <div style={{ marginBottom:8 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:'#444', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:5 }}>
            Collections
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
            {collections.map(col => (
              <span key={col.id} style={{
                padding:'2px 7px', borderRadius:3, fontSize:9, fontWeight:600,
                fontFamily:"'DM Mono',monospace", border:`1px solid ${col.color}40`,
                background:`${col.color}12`, color:col.color, whiteSpace:'nowrap',
              }}>
                {col.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        paddingTop:8, borderTop:'1px solid #2A2A2A',
      }}>
        <div style={{ display:'flex', gap:10 }}>
          {profile.twitter_handle && (
            <a href={`https://x.com/${profile.twitter_handle.replace('@','')}`}
              target="_blank" rel="noreferrer"
              style={{ fontSize:10, color:'#555', textDecoration:'none' }}
              onMouseEnter={e => e.target.style.color='#fff'}
              onMouseLeave={e => e.target.style.color='#555'}>
              𝕏 {profile.twitter_handle}
            </a>
          )}
        </div>
        {profile.username && (
          <button onClick={() => navigate(`/u/${profile.username}`)}
            style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#CAFF00',
              background:'transparent', border:'none', cursor:'pointer', letterSpacing:'0.05em' }}>
            View →
          </button>
        )}
      </div>
    </div>
  );
}

export function Avatar({ profile, size = 40 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      border:'2px solid #2A2A2A', background:'#1E1E1E',
      overflow:'hidden', display:'flex', alignItems:'center',
      justifyContent:'center', fontSize:size * 0.4, flexShrink:0,
    }}>
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : '👤'}
    </div>
  );
}

export function VerifyBadge({ label, color }) {
  return (
    <span style={{
      fontFamily:"'DM Mono',monospace", fontSize:8, fontWeight:700,
      padding:'1px 5px', borderRadius:3,
      background:`${color}18`, border:`1px solid ${color}40`, color,
    }}>
      {label}
    </span>
  );
}
