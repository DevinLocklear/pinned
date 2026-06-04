import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getActiveCollections } from '../lib/supabase';

export default function Landing({ onConnect }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ holders: 0, countries: 0, collections: 0 });
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    getActiveCollections().then(setCollections).catch(() => {});
  }, []);

  return (
    <div style={{
      width:'100%', height:'100%', background:'#0A0A0A',
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', overflow:'auto', padding:'40px 20px 80px',
      position:'relative',
    }}>
      {/* Subtle grid bg */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(#1E1E1E 1px, transparent 1px), linear-gradient(90deg, #1E1E1E 1px, transparent 1px)',
        backgroundSize:'60px 60px', opacity:0.15,
        maskImage:'radial-gradient(ellipse 80% 80% at 50% 40%, black, transparent)',
      }} />

      {/* Glow */}
      <div style={{
        position:'absolute', width:600, height:600, borderRadius:'50%', top:'10%', left:'50%',
        transform:'translateX(-50%)',
        background:'radial-gradient(circle, rgba(202,255,0,0.04) 0%, transparent 70%)',
        pointerEvents:'none',
      }} />

      {/* Logo */}
      <div style={{
        fontFamily:"'Syne',sans-serif", fontSize:'clamp(72px,14vw,140px)',
        fontWeight:800, letterSpacing:'-0.04em', lineHeight:0.9,
        color:'#fff', textAlign:'center', marginBottom:16,
        position:'relative', zIndex:2,
        animation:'fadeUp 0.8s ease 0.1s both',
      }}>
        PINN<span style={{ color:'#CAFF00', textShadow:'0 0 60px rgba(202,255,0,0.3)' }}>ED</span>
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily:"'DM Mono',monospace", fontSize:'clamp(10px,2vw,13px)',
        letterSpacing:'0.22em', textTransform:'uppercase', color:'#555',
        marginBottom:36, position:'relative', zIndex:2,
        animation:'fadeUp 0.8s ease 0.25s both',
      }}>
        The NFT Social Map
      </div>

      {/* CTA Button */}
      <button onClick={onConnect} style={{
        padding:'16px 52px', background:'#CAFF00', border:'none', borderRadius:8,
        fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, letterSpacing:'0.02em',
        color:'#0A0A0A', cursor:'pointer', marginBottom:12,
        position:'relative', zIndex:2,
        boxShadow:'0 0 40px rgba(202,255,0,0.2)',
        animation:'fadeUp 0.8s ease 0.4s both',
      }}
      onMouseEnter={e => { e.target.style.background='#D4FF20'; e.target.style.transform='translateY(-2px)'; }}
      onMouseLeave={e => { e.target.style.background='#CAFF00'; e.target.style.transform='translateY(0)'; }}>
        Drop Your Pin
      </button>

      {/* View map without connecting */}
      <button onClick={() => navigate('/map')} style={{
        background:'transparent', border:'none', cursor:'pointer',
        fontFamily:"'DM Mono',monospace", fontSize:11, color:'#444',
        letterSpacing:'0.1em', marginBottom:32,
        animation:'fadeUp 0.8s ease 0.5s both', position:'relative', zIndex:2,
      }}
      onMouseEnter={e => e.target.style.color='#888'}
      onMouseLeave={e => e.target.style.color='#444'}>
        Explore the map →
      </button>

      {/* Stats */}
      <div style={{
        display:'flex', background:'rgba(30,30,30,0.6)', border:'1px solid #2A2A2A',
        borderRadius:12, overflow:'hidden', marginBottom:40,
        position:'relative', zIndex:2,
        animation:'fadeUp 0.8s ease 0.55s both',
      }}>
        {[
          { num: stats.holders, label: 'Holders' },
          { num: stats.countries, label: 'Countries' },
          { num: stats.collections, label: 'Collections' },
        ].map((s, i) => (
          <div key={i} style={{
            padding:'14px 24px', textAlign:'center',
            borderRight: i < 2 ? '1px solid #2A2A2A' : 'none',
          }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:'#CAFF00', lineHeight:1 }}>
              {s.num}
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#555', letterSpacing:'0.15em', textTransform:'uppercase', marginTop:3 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Collections showcase */}
      {collections.length > 0 && (
        <div style={{
          maxWidth:600, width:'100%', position:'relative', zIndex:2,
          animation:'fadeUp 0.8s ease 0.65s both',
        }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#444', letterSpacing:'0.2em', textTransform:'uppercase', textAlign:'center', marginBottom:14 }}>
            Featured Collections
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
            {collections.map(col => (
              <div key={col.id} style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'7px 14px', background:'rgba(30,30,30,0.5)',
                border:`1px solid ${col.color}30`, borderRadius:20,
              }}>
                {col.logo_url && <img src={col.logo_url} alt="" style={{ width:16, height:16, borderRadius:4, objectFit:'contain' }} />}
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, color: col.color || '#CAFF00' }}>
                  {col.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social links */}
      <div style={{
        position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)',
        display:'flex', gap:24, zIndex:2,
        animation:'fadeUp 0.8s ease 0.75s both',
      }}>
        {[
          { label:'Twitter', href:'https://x.com' },
          { label:'Discord', href:'https://discord.com' },
        ].map(s => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{
            fontFamily:"'DM Mono',monospace", fontSize:10, color:'#333',
            letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none',
          }}
          onMouseEnter={e => e.target.style.color='#CAFF00'}
          onMouseLeave={e => e.target.style.color='#333'}>
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
