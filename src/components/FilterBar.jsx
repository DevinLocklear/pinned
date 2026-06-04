import React from 'react';

export default function FilterBar({ collections, activeFilters, onToggle, onClearAll }) {
  if (!collections.length) return null;

  return (
    <div style={{
      position:'absolute', top:84, left:0, right:0,
      height:44, display:'flex', alignItems:'center',
      gap:8, padding:'0 16px', overflowX:'auto', overflowY:'hidden',
      zIndex:498, background:'rgba(10,10,10,0.85)', backdropFilter:'blur(8px)',
      borderBottom:'1px solid #1E1E1E',
    }}>
      {/* All button */}
      <FilterBtn
        label="All"
        color="#CAFF00"
        active={activeFilters.length === 0}
        onClick={onClearAll}
      />

      {collections.map(col => (
        <FilterBtn
          key={col.id}
          label={col.name}
          color={col.color || '#CAFF00'}
          active={activeFilters.includes(col.id)}
          logo={col.logo_url}
          onClick={() => onToggle(col.id)}
        />
      ))}
    </div>
  );
}

function FilterBtn({ label, color, active, logo, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'5px 12px', borderRadius:20, flexShrink:0,
        border: `1.5px solid ${active ? color : hover ? color : '#2A2A2A'}`,
        background: active ? `${color}18` : hover ? `${color}0D` : 'transparent',
        cursor:'pointer', transition:'all 0.15s',
        fontFamily:"'DM Sans',sans-serif", fontWeight:600,
        fontSize:11, color: active ? color : hover ? color : '#888',
        letterSpacing:'0.02em', whiteSpace:'nowrap',
      }}>
      {logo && <img src={logo} alt="" style={{ width:14, height:14, borderRadius:3, objectFit:'contain' }} />}
      {label}
    </button>
  );
}
