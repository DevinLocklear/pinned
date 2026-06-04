/* ── WALLET CONNECTION (MetaMask + OKX + Brave detection) ── */

export function getMetaMaskProvider() {
  if (window.ethereum?.providers?.length) {
    return window.ethereum.providers.find(p => p.isMetaMask && !p.isBraveWallet) || null;
  }
  if (window.ethereum?.isMetaMask && !window.ethereum?.isBraveWallet) return window.ethereum;
  return null;
}

export function getOKXProvider() {
  if (window.okxwallet) return window.okxwallet;
  if (window.ethereum?.providers?.length) {
    return window.ethereum.providers.find(p => p.isOKExWallet || p.isOKXWallet) || null;
  }
  return null;
}

export function getAvailableWallets() {
  const wallets = [];
  const mm = getMetaMaskProvider();
  const okx = getOKXProvider();
  if (mm)  wallets.push({ id: 'metamask', name: 'MetaMask',   provider: mm,  icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg' });
  if (okx) wallets.push({ id: 'okx',      name: 'OKX Wallet', provider: okx, icon: 'https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png' });
  return wallets;
}

export async function connectWithProvider(provider) {
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts?.length) throw new Error('No accounts returned');
  return accounts[0];
}

export function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function getMetaMaskDeepLink() {
  return 'https://metamask.app.link/dapp/' + window.location.href.replace(/^https?:\/\//, '');
}
