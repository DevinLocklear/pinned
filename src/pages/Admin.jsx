import React, { useState, useEffect } from 'react';
import { getAllCollections } from '../lib/supabase';

const ADMIN_PW = process.env.REACT_APP_ADMIN_PASSWORD || '';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [collections, setCollections] = useState([]);
  const [form, setForm] = useState({ name:'', slug:'', contract_address:'', color:'#CAFF00', logo_url:'', website:'', twitter:'', chain:'ethereum' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (authed) loadCollections();
  }, [authed]);

  async function loadCollections() {
    const c = await getAllCollections();
    setCollections(c);
  }

  async function callAdmin(action, data) {
    const res = await fetch('/api/admin', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ password: pw, action, data }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    return res.json();
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name || !form.slug) { setMsg('Name and slug required'); return; }
    setSaving(true); setMsg('');
    try {
      await callAdmin('add_collection', form);
      setMsg('Collection added!');
      setForm({ name:'', slug:'', contract_address:'', color:'#CAFF00', logo_url:'', website:'', twitter:'', chain:'ethereum' });
      loadCollections();
    } catch(e) { setMsg('Error: ' + e.message); }
    finally { setSaving(false); }
  }

  async function handleToggle(col) {
    try {
      await callAdmin('toggle_collection', { id: col.id, active: !col.active });
      loadCollections();
    } catch(e) { setMsg('Error: ' + e.message); }
  }

  async function handleDelete(col) {
    if (!window.confirm(`Delete "${col.name}"? This removes all verified holdings for this collection.`)) return;
    try {
      await callAdmin('delete_collection', { id: col.id });
      loadCollections();
    } catch(e) { setMsg('Error: ' + e.message); }
  }

  if (!authed) {
    return (
      <div style={{ minHeight:'100vh', background:'#0A0A0A', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ background:'#1E1E1E', border:'1px solid #2A2A2A', borderRadius:14, padding:'32px 28px', width:'min(360px,90vw)' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:'#fff', marginBottom:6, letterSpacing:'-0.02em' }}>
            PINN<span style={{ color:'#CAFF00' }}>ED</span> Admin
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#444', marginBottom:24 }}>Collection Management</div>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key==='Enter' && setAuthed(pw === (process.env.REACT_APP_ADMIN_PASSWORD || 'changeme123'))}
            placeholder="Admin password"
            style={{ width:'100%', background:'#0A0A0A', border:'1.5px solid #2A2A2A', borderRadius:8, color:'#fff', fontSize:14, padding:'11px 14px', fontFamily:"'DM Sans',sans-serif", outline:'none', marginBottom:12 }} />
          <button onClick={() => setAuthed(pw === (process.env.REACT_APP_ADMIN_PASSWORD || 'changeme123'))}
            style={{ width:'100%', padding:12, background:'#CAFF00', border:'none', borderRadius:8, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:'#0A0A0A', cursor:'pointer' }}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0A', padding:'40px 20px' }}>
      <div style={{ maxWidth:800, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:40 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.02em' }}>
              PINN<span style={{ color:'#CAFF00' }}>ED</span> Admin
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#444', marginTop:2 }}>Collection Management</div>
          </div>
          <a href="/map" style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:'#555', textDecoration:'none', letterSpacing:'0.08em' }}>
            ← Back to map
          </a>
        </div>

        {/* Add collection form */}
        <div style={{ background:'#1E1E1E', border:'1px solid #2A2A2A', borderRadius:14, padding:24, marginBottom:32 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#555', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:20 }}>
            Add New Collection
          </div>

          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <Field label="Collection Name *"><Input value={form.name} onChange={v => setForm(f=>({...f,name:v}))} placeholder="Garbage Friends" /></Field>
              <Field label="OpenSea Slug *"><Input value={form.slug} onChange={v => setForm(f=>({...f,slug:v}))} placeholder="garbage-friends-main" /></Field>
              <Field label="Contract Address"><Input value={form.contract_address} onChange={v => setForm(f=>({...f,contract_address:v}))} placeholder="0x..." /></Field>
              <Field label="Chain">
                <select value={form.chain} onChange={e => setForm(f=>({...f,chain:e.target.value}))}
                  style={{ width:'100%', background:'#0A0A0A', border:'1.5px solid #2A2A2A', borderRadius:8, color:'#fff', fontSize:13, padding:'9px 12px', fontFamily:"'DM Sans',sans-serif", outline:'none' }}>
                  <option value="ethereum">Ethereum</option>
                  <option value="solana">Solana</option>
                  <option value="base">Base</option>
                  <option value="polygon">Polygon</option>
                </select>
              </Field>
              <Field label="Brand Color">
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <Input value={form.color} onChange={v => setForm(f=>({...f,color:v}))} placeholder="#CAFF00" />
                  <input type="color" value={form.color} onChange={e => setForm(f=>({...f,color:e.target.value}))}
                    style={{ width:38, height:38, borderRadius:8, border:'1.5px solid #2A2A2A', background:'none', cursor:'pointer', padding:2 }} />
                </div>
              </Field>
              <Field label="Logo URL"><Input value={form.logo_url} onChange={v => setForm(f=>({...f,logo_url:v}))} placeholder="https://..." /></Field>
              <Field label="Website"><Input value={form.website} onChange={v => setForm(f=>({...f,website:v}))} placeholder="https://..." /></Field>
              <Field label="Twitter"><Input value={form.twitter} onChange={v => setForm(f=>({...f,twitter:v}))} placeholder="@handle" /></Field>
            </div>

            {msg && <div style={{ fontSize:12, color: msg.includes('Error') ? '#FF3CAC' : '#CAFF00', marginBottom:12, fontFamily:"'DM Mono',monospace" }}>{msg}</div>}

            <button type="submit" disabled={saving} style={{
              padding:'12px 28px', background:'#CAFF00', border:'none', borderRadius:8,
              fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:'#0A0A0A',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Adding...' : '+ Add Collection'}
            </button>
          </form>
        </div>

        {/* Existing collections */}
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#555', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:14 }}>
          Collections ({collections.length})
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {collections.map(col => (
            <div key={col.id} style={{
              background:'#1E1E1E', border:`1px solid ${col.active ? col.color + '30' : '#2A2A2A'}`,
              borderRadius:10, padding:'14px 18px',
              display:'flex', alignItems:'center', gap:14,
              opacity: col.active ? 1 : 0.5,
            }}>
              <div style={{ width:12, height:12, borderRadius:'50%', background:col.color, flexShrink:0 }} />
              {col.logo_url && <img src={col.logo_url} alt="" style={{ width:32, height:32, borderRadius:6, objectFit:'contain', background:'#2A2A2A' }} />}
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#fff' }}>{col.name}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#555', marginTop:2 }}>
                  {col.slug} · {col.chain} · {col.contract_address ? col.contract_address.slice(0,10)+'...' : 'no contract'}
                </div>
              </div>
              <div style={{ display:'flex', gap:8' }}>
                <button onClick={() => handleToggle(col)} style={{
                  padding:'6px 14px', background:'transparent',
                  border:`1px solid ${col.active ? '#2A2A2A' : '#CAFF00'}`, borderRadius:6,
                  fontFamily:"'DM Mono',monospace", fontSize:10,
                  color: col.active ? '#555' : '#CAFF00', cursor:'pointer',
                }}>
                  {col.active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => handleDelete(col)} style={{
                  padding:'6px 14px', background:'transparent',
                  border:'1px solid rgba(255,60,172,0.3)', borderRadius:6,
                  fontFamily:"'DM Mono',monospace", fontSize:10, color:'#FF3CAC', cursor:'pointer',
                }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!collections.length && (
            <div style={{ padding:24, textAlign:'center', fontFamily:"'DM Mono',monospace", fontSize:12, color:'#444' }}>
              No collections yet. Add your first one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#555', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:5 }}>{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width:'100%', background:'#0A0A0A', border:'1.5px solid #2A2A2A', borderRadius:8, color:'#fff', fontSize:13, padding:'9px 12px', fontFamily:"'DM Sans',sans-serif", outline:'none' }}
      onFocus={e => e.target.style.borderColor='#CAFF00'}
      onBlur={e => e.target.style.borderColor='#2A2A2A'} />
  );
}
