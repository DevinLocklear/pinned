const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: 'No wallet' });
  try {
    const { data: cols } = await sb.from('collections').select('id,contract_address').eq('active', true);
    if (!cols?.length) return res.status(200).json({ verified: [] });
    const key = process.env.ALCHEMY_API_KEY;
    const results = await Promise.all(cols.filter(c => c.contract_address).map(async c => {
      try {
        const r = await fetch(`https://eth-mainnet.g.alchemy.com/nft/v3/${key}/isHolderOfCollection?wallet=${wallet}&contractAddress=${c.contract_address}`);
        const d = await r.json();
        return d.isHolderOfCollection ? c.id : null;
      } catch { return null; }
    }));
    return res.status(200).json({ verified: results.filter(Boolean) });
  } catch(e) { return res.status(500).json({ error: e.message }); }
};
