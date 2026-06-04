const CC = {
  'United States':{lat:37.09,lng:-95.71},'USA':{lat:37.09,lng:-95.71},
  'United Kingdom':{lat:51.50,lng:-0.12},'UK':{lat:51.50,lng:-0.12},
  'Canada':{lat:56.13,lng:-106.34},'Australia':{lat:-25.27,lng:133.77},
  'Germany':{lat:51.16,lng:10.45},'France':{lat:46.22,lng:2.21},
  'Japan':{lat:36.20,lng:138.25},'South Korea':{lat:35.90,lng:127.76},
  'Brazil':{lat:-14.23,lng:-51.92},'Mexico':{lat:23.63,lng:-102.55},
  'Netherlands':{lat:52.13,lng:5.29},'Spain':{lat:40.46,lng:-3.74},
  'Italy':{lat:41.87,lng:12.56},'Sweden':{lat:60.12,lng:18.64},
  'Norway':{lat:60.47,lng:8.46},'Denmark':{lat:56.26,lng:9.50},
  'Switzerland':{lat:46.81,lng:8.22},'Poland':{lat:51.91,lng:19.14},
  'Portugal':{lat:39.39,lng:-8.22},'Argentina':{lat:-38.41,lng:-63.61},
  'India':{lat:20.59,lng:78.96},'China':{lat:35.86,lng:104.19},
  'Singapore':{lat:1.35,lng:103.81},'Nigeria':{lat:9.08,lng:8.67},
  'South Africa':{lat:-30.55,lng:22.93},'UAE':{lat:23.42,lng:53.84},
  'Turkey':{lat:38.96,lng:35.24},'Russia':{lat:61.52,lng:105.31},
  'Philippines':{lat:12.87,lng:121.77},'Indonesia':{lat:-0.78,lng:113.92},
  'Thailand':{lat:15.87,lng:100.99},'New Zealand':{lat:-40.90,lng:174.88},
  'Ireland':{lat:53.41,lng:-8.24},'Belgium':{lat:50.50,lng:4.46},
  'Greece':{lat:39.07,lng:21.82},'Israel':{lat:31.04,lng:34.85},
  'Colombia':{lat:4.57,lng:-74.29},'Chile':{lat:-35.67,lng:-71.54},
  'Vietnam':{lat:14.05,lng:108.27},'Malaysia':{lat:4.21,lng:101.97},
  'Pakistan':{lat:30.37,lng:69.34},'Egypt':{lat:26.82,lng:30.80},
  'Saudi Arabia':{lat:23.88,lng:45.08},'Ghana':{lat:7.94,lng:-1.02},
  'Kenya':{lat:-0.02,lng:37.90},'Bangladesh':{lat:23.68,lng:90.35},
};

const SC = {
  'Alabama':{lat:32.80,lng:-86.79},'Alaska':{lat:64.20,lng:-153.39},
  'Arizona':{lat:34.04,lng:-111.09},'Arkansas':{lat:34.79,lng:-92.19},
  'California':{lat:36.77,lng:-119.41},'Colorado':{lat:39.11,lng:-105.35},
  'Connecticut':{lat:41.59,lng:-72.74},'Florida':{lat:27.99,lng:-81.76},
  'Georgia':{lat:32.16,lng:-82.90},'Hawaii':{lat:19.89,lng:-155.58},
  'Idaho':{lat:44.24,lng:-114.47},'Illinois':{lat:40.34,lng:-88.98},
  'Indiana':{lat:40.27,lng:-86.13},'Iowa':{lat:41.87,lng:-93.09},
  'Kansas':{lat:38.52,lng:-96.72},'Kentucky':{lat:37.66,lng:-84.67},
  'Louisiana':{lat:31.16,lng:-91.86},'Maine':{lat:44.69,lng:-69.38},
  'Maryland':{lat:39.04,lng:-76.64},'Massachusetts':{lat:42.23,lng:-71.53},
  'Michigan':{lat:44.31,lng:-85.60},'Minnesota':{lat:46.72,lng:-93.90},
  'Mississippi':{lat:32.74,lng:-89.67},'Missouri':{lat:38.45,lng:-92.28},
  'Montana':{lat:46.87,lng:-110.36},'Nebraska':{lat:41.49,lng:-99.90},
  'Nevada':{lat:38.80,lng:-116.41},'New Hampshire':{lat:43.19,lng:-71.57},
  'New Jersey':{lat:40.05,lng:-74.40},'New Mexico':{lat:34.84,lng:-106.24},
  'New York':{lat:42.16,lng:-74.94},'North Carolina':{lat:35.63,lng:-79.80},
  'Ohio':{lat:40.38,lng:-82.99},'Oklahoma':{lat:35.56,lng:-96.92},
  'Oregon':{lat:43.80,lng:-120.55},'Pennsylvania':{lat:41.20,lng:-77.19},
  'South Carolina':{lat:33.85,lng:-80.94},'Tennessee':{lat:35.74,lng:-86.69},
  'Texas':{lat:31.96,lng:-99.90},'Utah':{lat:39.32,lng:-111.09},
  'Virginia':{lat:37.76,lng:-78.16},'Washington':{lat:47.75,lng:-120.74},
  'Wisconsin':{lat:44.26,lng:-89.61},'Wyoming':{lat:43.07,lng:-107.29},
};

function jitter() { return (Math.random() - 0.5) * 2.5; }

export function geocodeLocal(country, state) {
  const ck = Object.keys(CC).find(k => k.toLowerCase() === country?.toLowerCase());
  if (state) {
    const sk = Object.keys(SC).find(k => k.toLowerCase() === state.toLowerCase());
    if (sk) return { lat: SC[sk].lat + jitter(), lng: SC[sk].lng + jitter() };
  }
  if (ck) return { lat: CC[ck].lat + jitter(), lng: CC[ck].lng + jitter() };
  return null;
}

export async function geocodeNominatim(country, state) {
  const q = [state, country].filter(Boolean).join(', ');
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
    const d = await r.json();
    if (d?.[0]) return { lat: parseFloat(d[0].lat) + jitter(), lng: parseFloat(d[0].lon) + jitter() };
  } catch {}
  return null;
}

export async function geocode(country, state) {
  return geocodeLocal(country, state) || await geocodeNominatim(country, state) || { lat: 0, lng: 0 };
}

export const COUNTRIES = Object.keys(CC).filter(k => k.length > 3);
