import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ProfileCard from './ProfileCard';

function buildRing(collections) {
  if (!collections.length) return '#CAFF00';
  if (collections.length === 1) return collections[0].color || '#CAFF00';
  const seg = 360 / collections.length;
  const stops = collections.map((c, i) => `${c.color || '#CAFF00'} ${i * seg}deg ${(i + 1) * seg}deg`).join(',');
  return `conic-gradient(${stops})`;
}

export default function MapComponent({ profiles, activeFilters, myProfile, onMapReady }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  // Init map once
  useEffect(() => {
    if (mapRef.current) return;
    const bounds = L.latLngBounds(L.latLng(-75, -220), L.latLng(83, 220));
    const map = L.map(containerRef.current, {
      center: [25, 10], zoom: 2, minZoom: 2, maxZoom: 16,
      maxBounds: bounds, maxBoundsViscosity: 1.0,
      worldCopyJump: false, bounceAtZoomLimits: false, zoomControl: false,
    });
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);
    map.on('drag', () => map.panInsideBounds(bounds, { animate: false }));
    map.on('click', () => setSelectedProfile(null));
    mapRef.current = map;
    if (onMapReady) onMapReady(map);
  }, []);

  // Update markers when profiles or filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    const filtered = activeFilters.length === 0
      ? profiles
      : profiles.filter(p =>
          (p.wallet_collections || []).some(wc => activeFilters.includes(wc.collection_id))
        );

    filtered.forEach(profile => {
      if (!profile.latitude || !profile.longitude) return;

      const collections = (profile.wallet_collections || [])
        .map(wc => wc.collections)
        .filter(Boolean);

      const ring = buildRing(collections);
      const highColor = collections[0]?.color || '#CAFF00';
      const isRing = ring.startsWith('conic');

      const html = `
        <div style="
          position:relative;width:44px;height:44px;border-radius:50%;
          ${isRing ? `background:${ring};` : `border:2.5px solid ${highColor};`}
          padding:${isRing ? '2.5px' : '0'};
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,0.6);
          ${profile.wallet_address === myProfile?.wallet_address ? 'box-shadow:0 0 0 2px #CAFF00,0 2px 16px rgba(202,255,0,0.4);' : ''}
        ">
          <div style="
            width:100%;height:100%;border-radius:50%;overflow:hidden;
            background:#1E1E1E;display:flex;align-items:center;justify-content:center;font-size:18px;
          ">
            ${profile.avatar_url
              ? `<img src="${profile.avatar_url}" style="width:100%;height:100%;object-fit:cover;" />`
              : '👤'}
          </div>
          ${collections.length ? `<div style="
            position:absolute;bottom:-2px;right:-2px;
            width:16px;height:16px;border-radius:50%;
            background:${highColor};border:2px solid #0A0A0A;
            font-size:8px;font-weight:700;color:#000;font-family:'DM Mono',monospace;
            display:flex;align-items:center;justify-content:center;z-index:2;
          ">${collections.length}</div>` : ''}
        </div>`;

      const icon = L.divIcon({ className: '', html, iconSize: [44, 44], iconAnchor: [22, 22] });
      const marker = L.marker([profile.latitude, profile.longitude], { icon });

      marker.on('click', (e) => {
        e.originalEvent.stopPropagation();
        const point = map.latLngToContainerPoint([profile.latitude, profile.longitude]);
        setPopupPos({ x: point.x, y: point.y });
        setSelectedProfile(profile);
      });

      marker.addTo(map);
      markersRef.current[profile.id] = marker;
    });
  }, [profiles, activeFilters, myProfile]);

  return (
    <div style={{ position:'absolute', inset:0 }}>
      <div ref={containerRef} style={{ width:'100%', height:'100%' }} />

      {/* Profile popup */}
      {selectedProfile && (
        <div style={{
          position:'absolute',
          left: Math.min(popupPos.x + 10, window.innerWidth - 260),
          top: Math.max(popupPos.y - 120, 128),
          zIndex:600, pointerEvents:'all',
        }}>
          <div style={{
            background:'#1E1E1E', border:'1px solid #2A2A2A',
            borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.7)',
            overflow:'hidden',
          }}>
            <ProfileCard profile={selectedProfile} />
          </div>
        </div>
      )}
    </div>
  );
}
