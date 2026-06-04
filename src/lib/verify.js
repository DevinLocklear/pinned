/* ── NFT VERIFICATION via /api/verify-holdings ── */

export async function verifyHoldings(wallet) {
  try {
    const res = await fetch(`/api/verify-holdings?wallet=${wallet}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.verified || []; // array of collection IDs
  } catch (e) {
    console.warn('Verification failed:', e);
    return [];
  }
}
