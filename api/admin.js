module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { password, action, data } = req.body || {};

  const SB_URL      = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // service_role key — bypasses RLS
  const ADMIN       = process.env.ADMIN_PASSWORD;

  if (!SB_URL || !SERVICE_KEY || !ADMIN) {
    return res.status(500).json({
      error: 'Missing env vars: ' + [
        !SB_URL       && 'SUPABASE_URL',
        !SERVICE_KEY  && 'SUPABASE_SERVICE_KEY',
        !ADMIN        && 'ADMIN_PASSWORD'
      ].filter(Boolean).join(', ')
    });
  }

  if (password !== ADMIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (action === 'ping') return res.status(200).json({ ok: true });

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY,
    'Prefer': 'return=representation'
  };

  try {
    if (action === 'add_collection') {
      const r = await fetch(SB_URL + '/rest/v1/collections', {
        method: 'POST', headers, body: JSON.stringify(data)
      });
      const json = await r.json();
      if (!r.ok) return res.status(400).json({ error: json.message || JSON.stringify(json) });
      return res.status(200).json({ collection: Array.isArray(json) ? json[0] : json });
    }

    if (action === 'toggle_collection') {
      const r = await fetch(SB_URL + '/rest/v1/collections?id=eq.' + data.id, {
        method: 'PATCH', headers, body: JSON.stringify({ active: data.active })
      });
      if (!r.ok) { const j = await r.json(); return res.status(400).json({ error: j.message || JSON.stringify(j) }); }
      return res.status(200).json({ ok: true });
    }

    if (action === 'delete_collection') {
      const r = await fetch(SB_URL + '/rest/v1/collections?id=eq.' + data.id, {
        method: 'DELETE', headers
      });
      if (!r.ok) { const j = await r.json(); return res.status(400).json({ error: j.message || JSON.stringify(j) }); }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
