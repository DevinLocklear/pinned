import React, { useState, useEffect, useRef } from 'react';
import { getAllProfiles, getActiveCollections, saveVerifiedCollections, getProfileByWallet } from '../lib/supabase';
import { verifyHoldings } from '../lib/verify';
import { supabase } from '../lib/supabase';
import MapComponent from '../components/Map';
import NavBar from '../components/NavBar';
import StatsBar from '../components/StatsBar';
import FilterBar from '../components/FilterBar';
import Leaderboard, { ActivityFeed } from '../components/Leaderboard';
import ProfileForm from '../components/ProfileForm';

export default function MapPage({ wallet, onConnectClick }) {
  const [profiles, setProfiles] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [activityEvents, setActivityEvents] = useState([]);
  const [activityBadge, setActivityBadge] = useState(0);
  const [verifiedCollections, setVerifiedCollections] = useState([]);
  const [toast, setToast] = useState(null);
  const mapRef = useRef(null);

  const stats = {
    holders: profiles.length,
    countries: new Set(profiles.map(p => p.location_country).filter(Boolean)).size,
    collections: collections.length,
  };

  // Load data
  useEffect(() => {
    loadAll();
    setupRealtime();
  }, []);

  // Verify wallet holdings when wallet connects
  useEffect(() => {
    if (!wallet) return;
    async function verify() {
      try {
        const profile = await getProfileByWallet(wallet);
        setMyProfile(profile);
        const verifiedIds = await verifyHoldings(wallet);
        if (verifiedIds.length) {
          await saveVerifiedCollections(wallet, verifiedIds);
          const verifiedCols = collections.filter(c => verifiedIds.includes(c.id));
          setVerifiedCollections(verifiedCols);
        }
        if (!profile) {
          setVerifiedCollections(collections.filter(c => verifiedIds.includes(c.id)));
          setShowForm(true);
        }
        await loadAll();
      } catch(e) { console.warn('Verify error:', e); }
    }
    verify();
  }, [wallet, collections]);

  async function loadAll() {
    const [p, c] = await Promise.all([getAllProfiles(), getActiveCollections()]);
    setProfiles(p);
    setCollections(c);
  }

  function setupRealtime() {
    supabase.channel('map_activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        setProfiles(prev => [...prev, payload.new]);
        addActivity(payload.new, 'joined');
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        setProfiles(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        addActivity(payload.new, 'updated');
      })
      .subscribe();
  }

  function addActivity(profile, type) {
    setActivityEvents(prev => [{ ...profile, type }, ...prev].slice(0, 50));
    if (!showActivity) setActivityBadge(b => b + 1);
  }

  function toggleFilter(collId) {
    setActiveFilters(prev =>
      prev.includes(collId) ? prev.filter(id => id !== collId) : [...prev, collId]
    );
  }

  function showToast(msg, type = '') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleProfileSaved(saved) {
    setMyProfile(saved);
    setShowForm(false);
    loadAll();
    showToast("You're on the map! 📍", 'ok');
    if (saved.latitude && mapRef.current) {
      mapRef.current.flyTo([saved.latitude, saved.longitude], 6, { duration: 1.5 });
    }
  }

  function flyToProfile(profile) {
    if (profile.latitude && mapRef.current) {
      mapRef.current.flyTo([profile.latitude, profile.longitude], 7, { duration: 1.2 });
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'#0A0A0A' }}>
      {/* Map fills the screen */}
      <div style={{ position:'absolute', inset:0 }}>
        <MapComponent
          profiles={profiles}
          activeFilters={activeFilters}
          myProfile={myProfile}
          onMapReady={m => { mapRef.current = m; }}
        />
      </div>

      {/* Top nav */}
      <NavBar
        wallet={wallet}
        onConnect={onConnectClick}
        onMyProfile={() => wallet && setShowForm(true)}
      />

      {/* Stats bar */}
      <StatsBar holders={stats.holders} countries={stats.countries} collections={stats.collections} />

      {/* Filter bar */}
      <FilterBar
        collections={collections}
        activeFilters={activeFilters}
        onToggle={toggleFilter}
        onClearAll={() => setActiveFilters([])}
      />

      {/* Panel toggle buttons */}
      <PanelToggle side="left" label="Board" open={showLeaderboard}
        onClick={() => { setShowLeaderboard(v => !v); setShowActivity(false); }}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#CAFF00"><path d="M3 3h4v18H3zm7 6h4v12h-4zm7-3h4v15h-4z"/></svg>}
      />
      <PanelToggle side="right" label="Live" open={showActivity}
        badge={activityBadge}
        onClick={() => { setShowActivity(v => !v); setShowLeaderboard(false); setActivityBadge(0); }}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#CAFF00"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" stroke="#0A0A0A" strokeWidth="2" fill="none"/></svg>}
      />

      {/* Panels */}
      <Leaderboard profiles={profiles} open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        onPinClick={flyToProfile} />
      <ActivityFeed events={activityEvents} open={showActivity}
        onClose={() => setShowActivity(false)} />

      {/* My profile button */}
      {myProfile && (
        <button onClick={() => setShowForm(true)} style={{
          position:'absolute', bottom:28, right:14, zIndex:500,
          background:'#1E1E1E', border:'1px solid #2A2A2A', borderRadius:10,
          padding:'10px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:10,
          boxShadow:'0 4px 16px rgba(0,0,0,0.5)', transition:'border-color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor='#CAFF00'}
        onMouseLeave={e => e.currentTarget.style.borderColor='#2A2A2A'}>
          <div style={{ width:30, height:30, borderRadius:'50%', border:'1.5px solid #CAFF00', overflow:'hidden', background:'#2A2A2A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
            {myProfile.avatar_url ? <img src={myProfile.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '👤'}
          </div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#fff' }}>{myProfile.username}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#555' }}>Edit profile</div>
          </div>
        </button>
      )}

      {/* Profile form */}
      {showForm && (
        <ProfileForm
          wallet={wallet}
          existingProfile={myProfile}
          verifiedCollections={verifiedCollections}
          onSaved={handleProfileSaved}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}

function PanelToggle({ side, label, icon, onClick, open, badge }) {
  return (
    <button onClick={onClick} style={{
      position:'absolute', top:150, [side]: 0, zIndex:491,
      background: open ? 'rgba(202,255,0,0.08)' : 'rgba(10,10,10,0.9)',
      border:'1px solid', borderColor: open ? '#CAFF00' : '#1E1E1E',
      borderRadius: side==='left' ? '0 8px 8px 0' : '8px 0 0 8px',
      padding:'10px 10px', cursor:'pointer', display:'flex',
      flexDirection:'column', alignItems:'center', gap:4,
      transition:'all 0.2s', position:'absolute',
    }}>
      {icon}
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, fontWeight:700, color:'#555', letterSpacing:'0.08em', textTransform:'uppercase' }}>
        {label}
      </span>
      {badge > 0 && (
        <div style={{
          position:'absolute', top:-6, right:-6,
          background:'#CAFF00', color:'#000',
          fontFamily:"'DM Mono',monospace", fontSize:8, fontWeight:700,
          minWidth:16, height:16, borderRadius:8, padding:'0 3px',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {badge}
        </div>
      )}
    </button>
  );
}
