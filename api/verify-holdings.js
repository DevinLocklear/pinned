const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { wallet } = req.query;

  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    // Get all active collections from Supabase
    const { data: collections, error } = await sb
      .from('collections')
      .select('id, contract_address, chain')
      .eq('active', true);

    if (error) throw error;
    if (!collections?.length) return res.status(200).json({ verified: [] });

    // Check each collection via Alchemy
    const results = await Promise.all(
      collections
        .filter(c => c.contract_address)
        .map(async (col) => {
          try {
            const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_KEY}/isHolderOfCollection?wallet=${wallet}&contractAddress=${col.contract_address}`;
            const r = await fetch(url);
            const d = await r.json();
            return d.isHolderOfCollection ? col.id : null;
          } catch {
            return null;
          }
        })
    );

    const verified = results.filter(Boolean);
    return res.status(200).json({ wallet, verified });

  } catch (e) {
    console.error('verify-holdings error:', e);
    return res.status(500).json({ error: 'Verification failed' });
  }
};
