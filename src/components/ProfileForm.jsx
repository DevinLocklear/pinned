import React, { useState, useEffect } from 'react';
import { upsertProfile, uploadAvatar } from '../lib/supabase';
import { geocode, COUNTRIES } from '../lib/geocode';

export default function ProfileForm({ wallet, existingProfile, verifiedCollections, onSaved, onClose }) {
  const [form, setForm] = useState({
    username: '', bio: '', twitter_handle: '',
    discord_handle: '', location_country: '', location_state: '',
    avatar_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [twVerified, setTwVerified] = useState(false);
  const [dcVerified, setDcVerified] = useState(false);
  const [twConfirm, setTwConfirm] = useState(false);
  const [dcConfirm, setDcConfirm] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      setForm({
        username: existingProfile.username || '',
        bio: existingProfile.bio || '',
        twitter_handle: existingProfile.twitter_handle || '',
        discord_handle: existingProfile.discord_handle || '',
        location_country: existingProfile.location_country || '',
        location_state: existingProfile.location_state || '',
        avatar_url: existingProfile.avatar_url || '',
      });
      setTwVerified(existingProfile.twitter_verified || false);
      setDcVerified(existingProfile.discord_verified || false);
    }
  }, [existingProfile]);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleAvatarUpload(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File too large. Max 5MB.'); return; }
    setUploading(true);
    try {
      const url = await uploadAvatar(wallet, file);
      set('avatar_url', url);
    } catch(e) { setError('Upload failed. Try a URL instead.'); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!form.username.trim()) { setError('Username is required.'); return; }
    if (!form.location_country.trim()) { setError('Country is required.'); return; }
    setSaving(true); setError('');
    try {
      const coords = await geocode(form.location_country, form.location_state);
      const profileData = {
        wallet_address: wallet.toLowerCase(),
        username: form.username.trim(),
        bio: form.bio.trim(),
        twitter_handle: form.twitter_handle.trim(),
        discord_handle: form.discord_handle.trim(),
        avatar_url: form.avatar_url.trim(),
        location_country: form.location_country.trim(),
        location_state: form.location_state.trim(),
        latitude: coords.lat,
        longitude: coords.lng,
        twitter_verified: twVerified,
        discord_verified: dcVerified,
      };
      const saved = await upsertProfile(profileData);
      onSaved(saved);
    } catch(e) { setError(e.message || 'Failed to save. Try again.'); }
    finally { setSaving(false); }
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:700, backdropFilter:'blur(6px)', padding:16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'#0A0A0A', border:'1px solid #2A2A2A', borderRadius:16,
        width:'min(460px,100%)', maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,0.8)',
      }}>
        {/* Header */}
        <div style={{
          padding:'18px 20px 14px', borderBottom:'1px solid #1E1E1E',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          position:'sticky', top:0, background:'#0A0A0A', zIndex:10,
        }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff' }}>
              {existingProfile ? 'Edit Profile' : 'Create Profile'}
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#444', marginTop:2 }}>
              Drop your pin on the map
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#555', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
          {/* Verified collections */}
          {verifiedCollections?.length > 0 && (
            <div>
              <Label>Verified Collections</Label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
                {verifiedCollections.map(col => (
                  <span key={col.id} style={{
                    padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600,
                    border:`1.5px solid ${col.color}`, background:`${col.color}15`, color:col.color,
                  }}>
                    {col.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Avatar */}
          <div>
            <Label>Profile Picture</Label>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginTop:6 }}>
              <div style={{
                width:60, height:60, borderRadius:'50%', border:'2px solid #2A2A2A',
                background:'#1E1E1E', overflow:'hidden', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
              }}>
                {form.avatar_url ? <img src={form.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '👤'}
              </div>
              <div style={{ flex:1 }}>
                <label style={{
                  display:'block', width:'100%', padding:'9px 12px',
                  background:'#1E1E1E', border:'1.5px dashed #2A2A2A', borderRadius:8,
                  fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:'#888',
                  cursor:'pointer', textAlign:'center', marginBottom:8,
                }}>
                  {uploading ? 'Uploading...' : '📷 Upload Image or GIF'}
                  <input type="file" accept="image/*,.gif" onChange={e => handleAvatarUpload(e.target.files[0])} style={{ display:'none' }} />
                </label>
                <Input value={form.avatar_url} onChange={v => set('avatar_url', v)} placeholder="or paste image URL" />
              </div>
            </div>
          </div>

          <Field label="Username *">
            <Input value={form.username} onChange={v => set('username', v)} placeholder="cryptowanderer" maxLength={24} />
          </Field>

          <Field label="Bio">
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell the community about yourself..." maxLength={160}
              style={{ ...inputStyle, resize:'vertical', minHeight:64, lineHeight:1.5 }} />
          </Field>

          {/* Twitter */}
          <Field label="Twitter / X">
            <div style={{ display:'flex', gap:8 }}>
              <Input value={form.twitter_handle} onChange={v => set('twitter_handle', v)} placeholder="@username" />
              {!twVerified
                ? <VerifyBtn onClick={() => { if (form.twitter_handle) setTwConfirm(true); }}>Verify</VerifyBtn>
                : <VerifyBtn verified>✓ Verified</VerifyBtn>}
            </div>
            {twConfirm && (
              <ConfirmBox
                msg={`Is "${form.twitter_handle}" your Twitter / X handle?`}
                onYes={() => { setTwVerified(true); setTwConfirm(false); }}
                onNo={() => setTwConfirm(false)}
              />
            )}
          </Field>

          {/* Discord */}
          <Field label="Discord">
            <div style={{ display:'flex', gap:8 }}>
              <Input value={form.discord_handle} onChange={v => set('discord_handle', v)} placeholder="username" />
              {!dcVerified
                ? <VerifyBtn onClick={() => { if (form.discord_handle) setDcConfirm(true); }}>Verify</VerifyBtn>
                : <VerifyBtn verified>✓ Verified</VerifyBtn>}
            </div>
            {dcConfirm && (
              <ConfirmBox
                msg={`Is "${form.discord_handle}" your Discord username?`}
                onYes={() => { setDcVerified(true); setDcConfirm(false); }}
                onNo={() => setDcConfirm(false)}
              />
            )}
          </Field>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Country *">
              <input list="country-list" value={form.location_country} onChange={e => set('location_country', e.target.value)}
                placeholder="United States" style={inputStyle} />
              <datalist id="country-list">
                {COUNTRIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </Field>
            <Field label="State / Region">
              <Input value={form.location_state} onChange={v => set('location_state', v)} placeholder="California" />
            </Field>
          </div>

          <div style={{ height:1, background:'#1E1E1E' }} />

          {error && (
            <div style={{ fontSize:12, color:'#FF3CAC', background:'rgba(255,60,172,0.1)', padding:'10px 14px', borderRadius:8 }}>
              {error}
            </div>
          )}

          <button onClick={handleSave} disabled={saving} style={{
            width:'100%', padding:14, background:'#CAFF00',
            border:'none', borderRadius:8,
            fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, letterSpacing:'0.02em',
            color:'#0A0A0A', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Saving...' : existingProfile ? 'Update Profile' : 'Drop My Pin'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width:'100%', background:'#1E1E1E', border:'1.5px solid #2A2A2A',
  borderRadius:8, color:'#fff', fontSize:13, padding:'9px 12px',
  fontFamily:"'DM Sans',sans-serif", outline:'none',
};

function Input({ value, onChange, placeholder, maxLength }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} maxLength={maxLength}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor='#CAFF00'}
      onBlur={e => e.target.style.borderColor='#2A2A2A'} />
  );
}

function Label({ children }) {
  return <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#555', marginBottom:6 }}>{children}</div>;
}

function Field({ label, children }) {
  return <div><Label>{label}</Label>{children}</div>;
}

function VerifyBtn({ children, onClick, verified }) {
  return (
    <button onClick={onClick} style={{
      padding:'9px 12px', flexShrink:0, borderRadius:8, cursor: verified ? 'default' : 'pointer',
      border: `1.5px solid ${verified ? '#CAFF00' : '#2A2A2A'}`,
      background: verified ? 'rgba(202,255,0,0.1)' : 'transparent',
      fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700,
      color: verified ? '#CAFF00' : '#888', whiteSpace:'nowrap',
    }}>
      {children}
    </button>
  );
}

function ConfirmBox({ msg, onYes, onNo }) {
  return (
    <div style={{ marginTop:8, background:'#1E1E1E', border:'1.5px solid #2A2A2A', borderRadius:10, padding:'12px 14px' }}>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#ccc', marginBottom:10 }}>{msg}</div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={onYes} style={{ flex:1, padding:8, background:'#CAFF00', border:'none', borderRadius:6, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, color:'#0A0A0A', cursor:'pointer' }}>
          ✓ Yes, that's me
        </button>
        <button onClick={onNo} style={{ padding:'8px 14px', background:'transparent', border:'1.5px solid #2A2A2A', borderRadius:6, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'#888', cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
