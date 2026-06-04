module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: 'No wallet' });

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_ANON_KEY;
  const ALK    = process.env.ALCHEMY_API_KEY;

  if (!SB_URL || !SB_KEY || !ALK) {
    return res.status(500).json({
      error: 'Missing env vars: ' + [
        !SB_URL && 'SUPABASE_URL',
        !SB_KEY && 'SUPABASE_ANON_KEY',
        !ALK    && 'ALCHEMY_API_KEY'
      ].filter(Boolean).join(', ')
    });
  }

  try {
    // Fetch active collections
    const colRes = await fetch(
      SB_URL + '/rest/v1/collections?active=eq.true&select=id,name,contract_address',
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }
    );
    const cols = await colRes.json();
    console.log('Collections found:', JSON.stringify(cols));

    if (!Array.isArray(cols) || !cols.length) {
      return res.status(200).json({ verified: [], debug: 'No active collections in DB' });
    }

    const results = await Promise.all(
      cols.filter(c => c.contract_address).map(async c => {
        try {
          const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALK}/isHolderOfCollection?wallet=${wallet}&contractAddress=${c.contract_address}`;
          const r = await fetch(url);
          const d = await r.json();
          console.log(`${c.name} (${c.contract_address}): isHolder=${d.isHolderOfCollection}, status=${r.status}`);
          return d.isHolderOfCollection ? c.id : null;
        } catch(e) {
          console.log(`${c.name} check failed:`, e.message);
          return null;
        }
      })
    );

    const verified = results.filter(Boolean);
    console.log('Verified IDs:', verified);
    return res.status(200).json({ verified });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
