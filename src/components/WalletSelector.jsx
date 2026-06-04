import React from 'react';
import { getAvailableWallets, connectWithProvider, isMobile, getMetaMaskDeepLink } from '../lib/wallet';

export default function WalletSelector({ onConnected, onError, onClose }) {
  const [loading, setLoading] = React.useState(false);

  const wallets = getAvailableWallets();

  async function handleSelect(provider) {
    setLoading(true);
    try {
      const address = await connectWithProvider(provider);
      onConnected(address, provider);
    } catch(e) {
      if (e.code !== 4001) onError(e.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  }

  // Mobile without wallet browser
  if (isMobile() && !wallets.length) {
    return (
      <Overlay onClose={onClose}>
        <Title>Open in Wallet App</Title>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#888', margin:'0 0 20px', lineHeight:1.6, textAlign:'center' }}>
          On mobile, open this page inside your wallet's browser.
        </p>
        <WalletBtn name="Open in MetaMask" icon="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
          onClick={() => window.location.href = getMetaMaskDeepLink()} />
        <Cancel onClose={onClose} />
      </Overlay>
    );
  }

  if (!wallets.length) {
    return (
      <Overlay onClose={onClose}>
        <Title>No Wallet Found</Title>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#888', margin:'0 0 20px', lineHeight:1.6, textAlign:'center' }}>
          Install MetaMask or OKX Wallet to continue.
        </p>
        <WalletBtn name="Get MetaMask" icon="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
          onClick={() => window.open('https://metamask.io', '_blank')} />
        <Cancel onClose={onClose} />
      </Overlay>
    );
  }

  if (wallets.length === 1) {
    handleSelect(wallets[0].provider);
    return null;
  }

  return (
    <Overlay onClose={onClose}>
      <Title>Choose Wallet</Title>
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
        {wallets.map(w => (
          <WalletBtn key={w.id} name={w.name} icon={w.icon}
            onClick={() => handleSelect(w.provider)}
            disabled={loading} />
        ))}
      </div>
      <Cancel onClose={onClose} />
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:900, backdropFilter:'blur(6px)', padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'#1E1E1E', border:'1px solid #2A2A2A', borderRadius:16,
        padding:'24px 20px 18px', width:'min(320px,90vw)',
        boxShadow:'0 16px 48px rgba(0,0,0,0.6)',
      }}>
        {children}
      </div>
    </div>
  );
}

function Title({ children }) {
  return (
    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22,
      letterSpacing:'-0.02em', color:'#fff', textAlign:'center', marginBottom:20 }}>
      {children}
    </div>
  );
}

function WalletBtn({ name, icon, onClick, disabled }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display:'flex', alignItems:'center', gap:14, width:'100%',
        padding:'14px 16px', background: hover ? '#2A2A2A' : '#141414',
        border: hover ? '1.5px solid #CAFF00' : '1.5px solid #2A2A2A',
        borderRadius:12, cursor:'pointer', transition:'all 0.2s',
        opacity: disabled ? 0.5 : 1,
      }}>
      <img src={icon} alt={name} style={{ width:36, height:36, borderRadius:8, objectFit:'contain' }} />
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#fff' }}>{name}</div>
      </div>
    </button>
  );
}

function Cancel({ onClose }) {
  return (
    <button onClick={onClose} style={{
      width:'100%', padding:11, background:'transparent',
      border:'1.5px solid #2A2A2A', borderRadius:10,
      fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600,
      color:'#555', cursor:'pointer', transition:'all 0.2s',
    }}
    onMouseEnter={e => { e.target.style.borderColor='#fff'; e.target.style.color='#fff'; }}
    onMouseLeave={e => { e.target.style.borderColor='#2A2A2A'; e.target.style.color='#555'; }}>
      Cancel
    </button>
  );
}
