const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { password, action, data } = req.body || {};

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (action === 'ping') return res.status(200).json({ ok: true });

  if (action === 'add_collection') {
    const { data: col, error } = await sb.from('collections').insert(data).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ collection: col });
  }

  if (action === 'toggle_collection') {
    const { error } = await sb.from('collections').update({ active: data.active }).eq('id', data.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (action === 'delete_collection') {
    const { error } = await sb.from('collections').delete().eq('id', data.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
};
