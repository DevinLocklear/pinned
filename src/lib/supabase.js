import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── PROFILES ── */
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`*, wallet_collections(collection_id, collections(id,name,color,logo_url))`);
  if (error) throw error;
  return data;
}

export async function getProfileByWallet(wallet) {
  const { data } = await supabase
    .from('profiles')
    .select(`*, wallet_collections(collection_id, collections(id,name,color,logo_url))`)
    .eq('wallet_address', wallet.toLowerCase())
    .maybeSingle();
  return data;
}

export async function getProfileByUsername(username) {
  const { data } = await supabase
    .from('profiles')
    .select(`*, wallet_collections(collection_id, collections(id,name,color,logo_url))`)
    .eq('username', username)
    .maybeSingle();
  return data;
}

export async function upsertProfile(profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'wallet_address' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ── COLLECTIONS ── */
export async function getActiveCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('active', true)
    .order('added_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getAllCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('added_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addCollection(collectionData) {
  const { data, error } = await supabase
    .from('collections')
    .insert(collectionData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleCollection(id, active) {
  const { error } = await supabase
    .from('collections')
    .update({ active })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCollection(id) {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/* ── WALLET COLLECTIONS (verified holdings) ── */
export async function saveVerifiedCollections(wallet, collectionIds) {
  // Remove old entries for this wallet
  await supabase
    .from('wallet_collections')
    .delete()
    .eq('wallet_address', wallet.toLowerCase());

  if (!collectionIds.length) return;

  const rows = collectionIds.map(id => ({
    wallet_address: wallet.toLowerCase(),
    collection_id: id,
  }));

  const { error } = await supabase
    .from('wallet_collections')
    .insert(rows);
  if (error) throw error;
}

/* ── STATS ── */
export async function getStats() {
  const [profileRes, collRes] = await Promise.all([
    supabase.from('profiles').select('id, location_country', { count: 'exact' }),
    supabase.from('collections').select('id').eq('active', true),
  ]);
  const profiles = profileRes.data || [];
  const countries = new Set(profiles.map(p => p.location_country).filter(Boolean));
  return {
    holders: profileRes.count || 0,
    countries: countries.size,
    collections: collRes.data?.length || 0,
  };
}

/* ── AVATAR UPLOAD ── */
export async function uploadAvatar(wallet, file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const filename = `${wallet.toLowerCase()}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filename, file, { cacheControl: '3600', upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(filename);
  return data.publicUrl;
}
