import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [wallet, setWallet]       = useState(null);
  const [provider, setProvider]   = useState(null);
  const [profile, setProfile]     = useState(null);
  const [collections, setCollections] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = useCallback((msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setProvider(null);
    setProfile(null);
  }, []);

  return (
    <AppContext.Provider value={{
      wallet, setWallet,
      provider, setProvider,
      profile, setProfile,
      collections, setCollections,
      showWalletModal, setShowWalletModal,
      showProfileForm, setShowProfileForm,
      toast, showToast,
      disconnect,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
