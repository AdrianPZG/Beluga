const API = ''; 

export async function getCiudades() {
  const res = await fetch(`${API}/api/ciudades`);
  if (!res.ok) throw new Error('Error /api/ciudades');
  return res.json(); // array
}

export async function getSitios(ciudadId = '') {
  const url = new URL('/api/sitios', window.location.origin);
  if (ciudadId) url.searchParams.set('ciudadId', ciudadId);
  const res = await fetch(url.pathname + url.search);
  if (!res.ok) throw new Error('Error /api/sitios');
  return res.json(); // array
}


export async function getSegmentos() {
  const res = await fetch(`${API}/api/segmentos`);
  if (!res.ok) throw new Error('Error /api/segmentos');
  return res.json();
}