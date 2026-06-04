import React from 'react';

export default function NavBar({ wallet, onConnect, onMyProfile }) {
  const short = wallet ? wallet.slice(0,6) + '...' + wallet.slice(-4) : null;

  return (
    <nav style={{
      position:'absolute', top:0, left:0, right:0, height:52,
      background:'rgba(10,10,10,0.96)', borderBottom:'1px solid #1E1E1E',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 20px', zIndex:500, backdropFilter:'blur(12px)',
    }}>
      {/* Logo */}
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, letterSpacing:'-0.02em', color:'#fff', lineHeight:1 }}>
        PINN<span style={{ color:'#CAFF00' }}>ED</span>
      </div>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {wallet && (
          <button onClick={onMyProfile} style={{
            fontFamily:"'DM Mono',monospace", fontSize:11, color:'#888',
            background:'#1E1E1E', border:'1px solid #2A2A2A',
            padding:'5px 12px', borderRadius:6, cursor:'pointer',
            transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor='#CAFF00'; e.target.style.color='#CAFF00'; }}
          onMouseLeave={e => { e.target.style.borderColor='#2A2A2A'; e.target.style.color='#888'; }}
          >
            {short}
          </button>
        )}
        {!wallet && (
          <button onClick={onConnect} style={{
            fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13,
            background:'#CAFF00', color:'#0A0A0A',
            border:'none', padding:'8px 18px', borderRadius:6,
            cursor:'pointer', letterSpacing:'0.02em',
          }}>
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
