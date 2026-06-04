module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: 'No wallet' });

  const SB_URL      = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ALK         = process.env.ALCHEMY_API_KEY;

  if (!SB_URL || !SERVICE_KEY || !ALK) {
    return res.status(500).json({
      error: 'Missing env vars: ' + [
        !SB_URL       && 'SUPABASE_URL',
        !SERVICE_KEY  && 'SUPABASE_SERVICE_KEY',
        !ALK          && 'ALCHEMY_API_KEY'
      ].filter(Boolean).join(', ')
    });
  }

  try {
    const colRes = await fetch(
      SB_URL + '/rest/v1/collections?active=eq.true&select=id,name,contract_address',
      { headers: { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY } }
    );
    const cols = await colRes.json();

    if (!Array.isArray(cols) || !cols.length) {
      return res.status(200).json({ verified: [], debug: 'No active collections in DB' });
    }

    const results = await Promise.all(
      cols.filter(c => c.contract_address).map(async c => {
        try {
          const r = await fetch(
            `https://eth-mainnet.g.alchemy.com/nft/v3/${ALK}/isHolderOfCollection?wallet=${wallet}&contractAddress=${c.contract_address}`
          );
          const d = await r.json();
          return d.isHolderOfCollection ? c.id : null;
        } catch(e) { return null; }
      })
    );

    return res.status(200).json({ verified: results.filter(Boolean) });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
