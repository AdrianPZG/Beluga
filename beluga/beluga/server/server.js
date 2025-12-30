// server/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Crear pool de conexiones 
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Pool CHATBOT (segmentos)
const poolChatbot = mysql.createPool({
  host: process.env.CHATBOT_DB_HOST,
  port: process.env.CHATBOT_DB_PORT,
  user: process.env.CHATBOT_DB_USER,
  password: process.env.CHATBOT_DB_PASSWORD,
  database: process.env.CHATBOT_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Ruta para obtener todas las ciudadesBase
app.get('/api/ciudades', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ciudadBase LIMIT 500');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener ciudades:', err);
    res.status(500).json({ error: 'Error al obtener ciudades' });
  }
});


// Ruta para obtener todos los sitios o filtrados por ciudadId
app.get('/api/sitios', async (req, res) => {
  const { ciudadId = null } = req.query;
  try {
    let rows;
    if (ciudadId) {
      [rows] = await pool.query(
        'SELECT * FROM sitio WHERE ciudad_id = ? LIMIT 500',
        [ciudadId]
      );
    } else {
      [rows] = await pool.query('SELECT * FROM sitio LIMIT 500');
    }
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener sitios:', err);
    res.status(500).json({ error: 'Error al obtener sitios' });
  }
});

// ========= Helpers para normalizar y resolver coordenadas =========
function normalizeLatLng(row) {
  const lat = row?.latitud ?? row?.latitude ?? row?.Latitud ?? row?.lat ?? null;
  const lng = row?.longitud ?? row?.longitude ?? row?.Longitud ?? row?.lng ?? null;
  return {
    lat: lat != null ? parseFloat(lat) : null,
    lng: lng != null ? parseFloat(lng) : null,
  };
}

async function lookupCiudad(nombre) {
  // exacto
  let [rows] = await pool.query(
    'SELECT * FROM ciudadBase WHERE nombre = ? LIMIT 1',
    [nombre]
  );
  if (rows[0]) {
    const { lat, lng } = normalizeLatLng(rows[0]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng, fuente: 'ciudad' };
  }
  // flexible
  [rows] = await pool.query(
    'SELECT * FROM ciudadBase WHERE nombre LIKE CONCAT("%", ?, "%") ORDER BY nombre ASC LIMIT 1',
    [nombre]
  );
  if (rows[0]) {
    const { lat, lng } = normalizeLatLng(rows[0]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng, fuente: 'ciudad' };
  }
  return null;
}

async function lookupSitio(nombre) {
  // exacto
  let [rows] = await pool.query(
    'SELECT * FROM sitio WHERE nombreSitio = ? LIMIT 1',
    [nombre]
  );
  if (rows[0]) {
    const { lat, lng } = normalizeLatLng(rows[0]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng, fuente: 'sitio' };
  }
  // flexible
  [rows] = await pool.query(
    'SELECT * FROM sitio WHERE nombreSitio LIKE CONCAT("%", ?, "%") ORDER BY nombreSitio ASC LIMIT 1',
    [nombre]
  );
  if (rows[0]) {
    const { lat, lng } = normalizeLatLng(rows[0]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng, fuente: 'sitio' };
  }
  return null;
}

async function resolvePoint(nombre) {
  if (!nombre) return null;
  // 1) intenta como ciudad
  const asCity = await lookupCiudad(nombre);
  if (asCity) return asCity;
  // 2) intenta como sitio
  const asSite = await lookupSitio(nombre);
  if (asSite) return asSite;
  return null;
}

// ========= Ruta de segmentos =========
// Lee app_segment.id, app_segment.name (formato "Origen - Destino")
// parte el name y resuelve coordenadas buscando en {ciudadBase|sitio}
app.get('/api/segmentos', async (_req, res) => {
  try {
    // 1) Trae segmentos de la DB "chatbot"
    const [segmentos] = await poolChatbot.query(`
      SELECT id, name
      FROM app_segment
      LIMIT 500
    `);

    // 2) Resuelve coordenadas para cada segmento
    const out = await Promise.all(
      segmentos.map(async (seg) => {
        const segId = seg.id;
        const raw = String(seg.name || '');
        // Partimos por " - " (considera trims por si hay espacios extra)
        const [aNameRaw, bNameRaw] = raw.split(' - ');
        const aName = (aNameRaw || '').trim();
        const bName = (bNameRaw || '').trim();

        const A = await resolvePoint(aName);
        const B = await resolvePoint(bName);

        return {
          id: segId,
          name: raw,
          start_name: aName || null,
          end_name: bName || null,
          start_lat: A?.lat ?? null,
          start_lng: A?.lng ?? null,
          end_lat: B?.lat ?? null,
          end_lng: B?.lng ?? null,
          start_source: A?.fuente ?? null, // 'ciudad' | 'sitio'
          end_source: B?.fuente ?? null,   // 'ciudad' | 'sitio'
          resolved:
            Number.isFinite(A?.lat) && Number.isFinite(A?.lng) &&
            Number.isFinite(B?.lat) && Number.isFinite(B?.lng),
        };
      })
    );

    res.json(out);
  } catch (err) {
    console.error('Error al obtener segmentos:', err);
    res.status(500).json({ error: 'Error al obtener segmentos' });
  }
});


const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Ya quedó!!! Perfectísimooo, bro!!! Servidor corriendo en http://localhost:${port}`);
});
