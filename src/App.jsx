import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './styles/globals.css';
import Landing from './pages/Landing';
import MapPage from './pages/MapPage';
import UserProfile from './pages/UserProfile';
import Admin from './pages/Admin';
import WalletSelector from './components/WalletSelector';

function AppInner() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [toast, setToast] = useState(null);

  function handleConnectClick() {
    setShowWalletSelector(true);
  }

  function handleConnected(address, prov) {
    setWallet(address);
    setProvider(prov);
    setShowWalletSelector(false);
    showToast('Wallet connected!', 'ok');
    navigate('/map');
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div style={{ width:'100%', height:'100%', background:'#0A0A0A' }}>
      <Routes>
        <Route path="/"       element={<Landing onConnect={handleConnectClick} />} />
        <Route path="/map"    element={<MapPage wallet={wallet} onConnectClick={handleConnectClick} />} />
        <Route path="/u/:username" element={<UserProfile />} />
        <Route path="/admin"  element={<Admin />} />
      </Routes>

      {showWalletSelector && (
        <WalletSelector
          onConnected={handleConnected}
          onError={msg => showToast(msg, 'err')}
          onClose={() => setShowWalletSelector(false)}
        />
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
