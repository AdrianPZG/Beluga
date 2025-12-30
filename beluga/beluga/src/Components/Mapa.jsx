// src/Components/Mapa.jsx
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapView({
  ciudades = [],
  sitios = [],
  segmentos = [],                
  focusCoord,                     
  panCoord,                       
  onMarkerSelect = () => {},      
  onSegmentSelect = () => {},     
  resetToken,                     // resetea mapa cuando sales de "filtro"
}) {
  const mapRef = useRef(null);
  const citiesLayerRef = useRef(L.layerGroup());
  const sitesLayerRef = useRef(L.layerGroup());
  const segmentsLayerRef = useRef(L.layerGroup()); 
  const focusMarkerRef = useRef(null);

  const defaultBounds = [
    [14.5, -118.5], // Suroeste de MX
    [34.4, -86.5],  // Noreste de MX
  ];







  // Crear / destruir mapa 1 vez
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
      center: [25.5, -102.5],
      zoom: 5,
      minZoom: 4,
      maxBounds: defaultBounds,
      maxBoundsViscosity: 1.0,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      zoomControl: false,
      tap: true,
    });
    mapRef.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    citiesLayerRef.current.addTo(map);
    sitesLayerRef.current.addTo(map);
    segmentsLayerRef.current.addTo(map);

    map.fitBounds(defaultBounds);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);








  // iconos de ubicación
  const makePin = (hex = "#2ea8ff") => {
    const svg = `
      <svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
        <defs><filter id="s" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${hex}55"/>
        </filter></defs>
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.52 12.6 24.4 13.13 25.02.47.55 1.27.55 1.74 0C15.4 38.4 28 23.52 28 14 28 6.27 21.73 0 14 0z" fill="${hex}" filter="url(#s)"/>
        <circle cx="14" cy="14" r="6.5" fill="white" opacity="0.9"/>
      </svg>`;
    return L.divIcon({
      className: "",
      html: svg,
      iconSize: [28, 40],
      iconAnchor: [14, 38],
      popupAnchor: [0, -36],
      tooltipAnchor: [0, -22],
    });
  };





  // Colores por estatus
  const statusToColorSite = (it) => {
    const id = (it.idEstatusSitio ?? it.estatus ?? "").toString().toLowerCase();
    if (id === "es-1" || /operativo/.test(id)) return "#22c55e";
    if (id === "es-2" || /proceso/.test(id)) return "#f59e0b";
    if (id === "es-3" || /constru/.test(id)) return "#ef4444";
    return "#22c55e";
  };
  const statusToColorCity = (it) => {
    const id = (it.idEstatusSitio ?? it.estatus ?? "").toString().toLowerCase();
    if (id === "es-1" || /operativo/.test(id)) return "#2ea8ff";
    if (id === "es-2" || /proceso/.test(id)) return "#f59e0b";
    if (id === "es-3" || /constru/.test(id)) return "#ef4444";
    return "#2ea8ff";
  };

  const clearFocusMarker = () => {
    if (focusMarkerRef.current) {
      focusMarkerRef.current.remove();
      focusMarkerRef.current = null;
    }
  };







  // Redibuja ciudades
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    citiesLayerRef.current.clearLayers();
    clearFocusMarker();

    if (!Array.isArray(ciudades) || ciudades.length === 0) return;

    ciudades.forEach((item) => {
      const lat = parseFloat(item.latitud ?? item.latitude ?? item.Latitud ?? item.lat);
      const lng = parseFloat(item.longitud ?? item.longitude ?? item.Longitud ?? item.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const m = L.marker([lat, lng], { icon: makePin(statusToColorCity(item)) })
        .on("click", () => onMarkerSelect(item, "ciudad"))
        .bindTooltip(item.nombre ?? "(sin nombre)", { direction: "top", offset: [0, -24] });

      m.addTo(citiesLayerRef.current);
    });
  }, [ciudades, onMarkerSelect]);


  // Redibuja sitios
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    sitesLayerRef.current.clearLayers();
    clearFocusMarker();

    if (!Array.isArray(sitios) || sitios.length === 0) return;

    sitios.forEach((item) => {
      const lat = parseFloat(item.latitud ?? item.latitude ?? item.Latitud ?? item.lat);
      const lng = parseFloat(item.longitud ?? item.longitude ?? item.Longitud ?? item.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const m = L.marker([lat, lng], { icon: makePin(statusToColorSite(item)) })
        .on("click", () => onMarkerSelect(item, "sitio"))
        .bindTooltip(item.nombreSitio ?? "(sin nombre)", { direction: "top", offset: [0, -24] });

      m.addTo(sitesLayerRef.current);
    });
  }, [sitios, onMarkerSelect]);



  // Redibuja segmentos 
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    segmentsLayerRef.current.clearLayers();
    clearFocusMarker();

    if (!Array.isArray(segmentos) || segmentos.length === 0) return;

    segmentos.forEach((s) => {
      const a = [parseFloat(s.start_lat), parseFloat(s.start_lng)];
      const b = [parseFloat(s.end_lat), parseFloat(s.end_lng)];
      if (!Number.isFinite(a[0]) || !Number.isFinite(a[1]) || !Number.isFinite(b[0]) || !Number.isFinite(b[1]))
        return;

      const poly = L.polyline([a, b], { 
        weight: 4, 
        opacity: 0.9, 
        color: "#b3bd30ff"  
})
    .on("click", () => onSegmentSelect(s))
    .bindTooltip(s.name ?? "(segmento)", { direction: "top" });

poly.addTo(segmentsLayerRef.current);

    });
  }, [segmentos, onSegmentSelect]);







  // Focus puntual
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusCoord) return;
    const { lat, lng } = focusCoord;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    map.setView([lat, lng], Math.max(map.getZoom(), 8), { animate: true });

    clearFocusMarker();
    const fm = L.circleMarker([lat, lng], {
      radius: 10,
      color: "#67e8f9",
      weight: 2,
      fillColor: "#22d3ee",
      fillOpacity: 0.5,
    }).addTo(map);
    focusMarkerRef.current = fm;

    const t = setTimeout(() => {
      clearFocusMarker();
    }, 3000);
    return () => clearTimeout(t);
  }, [focusCoord]);


  
  // Pan (opcional)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !panCoord) return;
    const { lat, lng } = panCoord;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    map.panTo([lat, lng], { animate: true });
  }, [panCoord]);

  
  // Reset
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    citiesLayerRef.current.clearLayers();
    sitesLayerRef.current.clearLayers();
    segmentsLayerRef.current.clearLayers();
    clearFocusMarker();
    map.fitBounds(defaultBounds);
  }, [resetToken]);

  return (
    <div
      id="map"
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
      }}
    />
  );
}

export default MapView;






//Mapa anterior, lo guardo por si se rompe esteee//

// // src/Components/Mapa.jsx
// import { useEffect, useRef } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// function MapView({
//   ciudades = [],
//   sitios = [],
//   focusCoord,                 // {lat, lng} para centrar
//   onMarkerSelect = () => {},  // (item, tipo) => void
//   resetToken,                 // cambia para recentrar al estado inicial
// }) {
//   const mapRef = useRef(null);
//   const citiesLayerRef = useRef(L.layerGroup());
//   const sitesLayerRef = useRef(L.layerGroup());
//   const focusMarkerRef = useRef(null);

//   const defaultBounds = [
//     [14.5, -118.5], // Suroeste de MX
//     [34.4, -86.5]   // Noreste de MX
//   ];

//   // ---- Crear / destruir mapa (una sola vez) ----
//   useEffect(() => {
//     if (mapRef.current) return;

//     const map = L.map('map', {
//       center: [25.5, -102.5],
//       zoom: 5,
//       minZoom: 4,
//       maxBounds: defaultBounds,
//       maxBoundsViscosity: 1.0,
//       dragging: true,
//       scrollWheelZoom: true,
//       doubleClickZoom: true,
//       boxZoom: true,
//       keyboard: true,
//       zoomControl: false,
//       tap: true,
//     });
//     mapRef.current = map;

//     L.control.zoom({ position: 'bottomright' }).addTo(map);

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '&copy; OpenStreetMap contributors'
//     }).addTo(map);

//     // Agregamos los LayerGroups al mapa
//     citiesLayerRef.current.addTo(map);
//     sitesLayerRef.current.addTo(map);

//     map.fitBounds(defaultBounds);

//     return () => {
//       map.remove();
//       mapRef.current = null;
//     };
//   }, []);

//   // ---- Utilidades de iconos (pins) ----
//   const makePin = (hex = '#2ea8ff') => {
//     // Pin con gotita usando divIcon (ligero y personalizable)
//     const svg = `
//       <svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
//             <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${hex}55"/>
//           </filter>
//         </defs>
//         <path d="M14 0C6.27 0 0 6.27 0 14c0 9.52 12.6 24.4 13.13 25.02.47.55 1.27.55 1.74 0C15.4 38.4 28 23.52 28 14 28 6.27 21.73 0 14 0z" fill="${hex}" filter="url(#s)"/>
//         <circle cx="14" cy="14" r="6.5" fill="white" opacity="0.9"/>
//       </svg>
//     `;
//     return L.divIcon({
//       className: '',
//       html: svg,
//       iconSize: [28, 40],
//       iconAnchor: [14, 38],
//       popupAnchor: [0, -36],
//       tooltipAnchor: [0, -22]
//     });
//   };

//   const statusToColor = (it) => {
//     const id = (it.idEstatusSitio ?? it.estatus ?? '').toString().toLowerCase();
//     if (id === 'es-1' || /operativo/i.test(it.estatus)) return '#22c55e'; // verde
//     if (id === 'es-2' || /proceso/i.test(it.estatus)) return '#f59e0b';   // naranja
//     if (id === 'es-3' || /constru/i.test(it.estatus)) return '#ef4444';   // rojo
//     return '#22c55e'; // por defecto, verde
//   };

//   // ---- Redibuja CIUDADES cuando cambia la lista ----
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map) return;

//     // limpiar capa
//     citiesLayerRef.current.clearLayers();

//     // si viene vacío, no dibujamos nada (queda limpio)
//     if (!Array.isArray(ciudades) || ciudades.length === 0) return;

//     // crear marcadores
//     ciudades.forEach((item) => {
//       const lat = parseFloat(item.latitud ?? item.latitude ?? item.Latitud ?? item.lat);
//       const lng = parseFloat(item.longitud ?? item.longitude ?? item.Longitud ?? item.lng);
//       if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

//       const nombre = item.nombre ?? '(sin nombre)';

//       const m = L.marker([lat, lng], { icon: makePin('#2ea8ff') }) // azul
//         .on('click', () => onMarkerSelect(item, 'ciudad'))
//         .bindTooltip(nombre, { direction: 'top', offset: [0, -24] });

//       m.addTo(citiesLayerRef.current);
//     });
//   }, [ciudades, onMarkerSelect]);

//   // ---- Redibuja SITIOS cuando cambia la lista ----
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map) return;

//     sitesLayerRef.current.clearLayers();

//     if (!Array.isArray(sitios) || sitios.length === 0) return;

//     sitios.forEach((item) => {
//       const lat = parseFloat(item.latitud ?? item.latitude ?? item.Latitud ?? item.lat);
//       const lng = parseFloat(item.longitud ?? item.longitude ?? item.Longitud ?? item.lng);
//       if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

//       const nombre = item.nombreSitio ?? '(sin nombre)';
//       const color = statusToColor(item);

//       const m = L.marker([lat, lng], { icon: makePin(color) })
//         .on('click', () => onMarkerSelect(item, 'sitio'))
//         .bindTooltip(nombre, { direction: 'top', offset: [0, -24] });

//       m.addTo(sitesLayerRef.current);
//     });
//   }, [sitios, onMarkerSelect]);

//   // ---- Enfocar un punto concreto (focusCoord) ----
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map || !focusCoord) return;
//     const { lat, lng } = focusCoord;
//     if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

//     // Centra suavemente
//     map.setView([lat, lng], Math.max(map.getZoom(), 8), { animate: true });

//     // marcador de enfoque (temporal)
//     if (focusMarkerRef.current) {
//       focusMarkerRef.current.remove();
//       focusMarkerRef.current = null;
//     }
//     const fm = L.circleMarker([lat, lng], {
//       radius: 10,
//       color: '#67e8f9',
//       weight: 2,
//       fillColor: '#22d3ee',
//       fillOpacity: 0.5
//     }).addTo(map);
//     focusMarkerRef.current = fm;

//     // desaparecer enfoque después de unos segundos
//     const t = setTimeout(() => {
//       if (focusMarkerRef.current) {
//         focusMarkerRef.current.remove();
//         focusMarkerRef.current = null;
//       }
//     }, 3000);
//     return () => clearTimeout(t);
//   }, [focusCoord]);

//   // ---- Reset al estado inicial cuando cambie resetToken ----
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map) return;
//     map.fitBounds(defaultBounds);
//   }, [resetToken]);

//   return (
//     <div
//       id="map"
//       style={{
//         width: "100vw",
//         height: "100vh",
//         position: "absolute",
//         top: 0,
//         left: 0,
//         zIndex: 1
//       }}
//     />
//   );
// }

// export default MapView;
