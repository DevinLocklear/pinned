import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfileByUsername } from '../lib/supabase';
import { Avatar, VerifyBadge } from '../components/ProfileCard';

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfileByUsername(username)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div style={{ height:'100vh', background:'#0A0A0A', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #1E1E1E', borderTopColor:'#CAFF00', animation:'spin 0.7s linear infinite' }} />
    </div>
  );

  if (!profile) return (
    <div style={{ height:'100vh', background:'#0A0A0A', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:'#fff' }}>Not Found</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:'#555' }}>No profile for @{username}</div>
      <button onClick={() => navigate('/')} style={{ marginTop:8, padding:'10px 24px', background:'#CAFF00', border:'none', borderRadius:6, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#0A0A0A', cursor:'pointer' }}>
        Go Home
      </button>
    </div>
  );

  const collections = profile.wallet_collections?.map(wc => wc.collections).filter(Boolean) || [];

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0A', display:'flex', flexDirection:'column', alignItems:'center', padding:'48px 20px' }}>
      {/* Back */}
      <div style={{ width:'100%', maxWidth:560, marginBottom:24 }}>
        <button onClick={() => navigate('/map')} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Mono',monospace", fontSize:11, color:'#555', letterSpacing:'0.1em' }}
          onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='#555'}>
          ← Back to map
        </button>
      </div>

      <div style={{ width:'100%', maxWidth:560, background:'#1E1E1E', border:'1px solid #2A2A2A', borderRadius:20, overflow:'hidden' }}>
        {/* Header */}
        <div style={{ height:80, background:'linear-gradient(135deg, #1A1A1A, #2A2A2A)', position:'relative' }}>
          <div style={{ position:'absolute', bottom:-32, left:24 }}>
            <Avatar profile={profile} size={64} />
          </div>
        </div>

        <div style={{ padding:'40px 24px 28px' }}>
          {/* Name + badges */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:'#fff', letterSpacing:'-0.02em' }}>
              {profile.username}
            </div>
            {profile.twitter_verified && <VerifyBadge label="𝕏" color="#1DA1F2" />}
            {profile.discord_verified && <VerifyBadge label="DC" color="#5865F2" />}
          </div>

          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:'#555', marginBottom:16 }}>
            📍 {[profile.location_state, profile.location_country].filter(Boolean).join(', ')}
          </div>

          {profile.bio && (
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'#888', lineHeight:1.6, marginBottom:20 }}>
              {profile.bio}
            </div>
          )}

          {/* Social */}
          <div style={{ display:'flex', gap:16, marginBottom:24 }}>
            {profile.twitter_handle && (
              <a href={`https://x.com/${profile.twitter_handle.replace('@','')}`} target="_blank" rel="noreferrer"
                style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:'#555', textDecoration:'none' }}
                onMouseEnter={e => e.target.style.color='#1DA1F2'} onMouseLeave={e => e.target.style.color='#555'}>
                𝕏 {profile.twitter_handle}
              </a>
            )}
            {profile.discord_handle && (
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:'#555' }}>
                💬 {profile.discord_handle}
              </span>
            )}
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#444', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:10 }}>
                Verified Collections
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {collections.map(col => (
                  <div key={col.id} style={{
                    padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600,
                    fontFamily:"'DM Sans',sans-serif",
                    border:`1.5px solid ${col.color}`,
                    background:`${col.color}12`, color:col.color,
                  }}>
                    {col.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share */}
      <button onClick={() => { navigator.clipboard.writeText(window.location.href); }}
        style={{ marginTop:16, padding:'10px 24px', background:'transparent', border:'1px solid #2A2A2A', borderRadius:8, fontFamily:"'DM Mono',monospace", fontSize:11, color:'#555', cursor:'pointer', letterSpacing:'0.08em' }}
        onMouseEnter={e => { e.target.style.borderColor='#CAFF00'; e.target.style.color='#CAFF00'; }}
        onMouseLeave={e => { e.target.style.borderColor='#2A2A2A'; e.target.style.color='#555'; }}>
        Copy Profile Link
      </button>
    </div>
  );
}
