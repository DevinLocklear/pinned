module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { password, action, data } = req.body || {};

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (action === 'ping') return res.status(200).json({ ok: true });

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_ANON_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SB_KEY,
    'Authorization': 'Bearer ' + SB_KEY,
    'Prefer': 'return=representation'
  };

  try {
    if (action === 'add_collection') {
      const r = await fetch(SB_URL + '/rest/v1/collections', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      const json = await r.json();
      if (!r.ok) return res.status(400).json({ error: json.message || 'Insert failed' });
      return res.status(200).json({ collection: Array.isArray(json) ? json[0] : json });
    }

    if (action === 'toggle_collection') {
      const r = await fetch(SB_URL + '/rest/v1/collections?id=eq.' + data.id, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ active: data.active })
      });
      if (!r.ok) { const j = await r.json(); return res.status(400).json({ error: j.message }); }
      return res.status(200).json({ ok: true });
    }

    if (action === 'delete_collection') {
      const r = await fetch(SB_URL + '/rest/v1/collections?id=eq.' + data.id, {
        method: 'DELETE',
        headers
      });
      if (!r.ok) { const j = await r.json(); return res.status(400).json({ error: j.message }); }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
