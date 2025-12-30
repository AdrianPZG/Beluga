// src/Components/Filtro.jsx
import React from "react";

const TAB_BG = "linear-gradient(135deg,#0f1725 60%, #1e2a44 100%)";
const CARD_BG = "linear-gradient(135deg,#121b2a 60%, #1b2a46 100%)";
const BORDER = "#27354d";
const SOFT_TXT = "#b9cbe4";
const STRONG = "#eaf6ff";

function badgeStyles(kind = "ok") {
  const map = {
    ok: { dot: "#22c55e", bg: "#0f2a1a", text: "#92f2b3", border: "#1e6640" },
    wip: { dot: "#f59e0b", bg: "#2a1f0f", text: "#ffd9a0", border: "#7a4a06" },
    down: { dot: "#ef4444", bg: "#2a1010", text: "#ffb3b3", border: "#7a2020" },
    info: { dot: "#60a5fa", bg: "#0f2138", text: "#bfe0ff", border: "#274a7a" },
  };
  return map[kind] || map.info;
}

function statusKind(item) {
  const id = String(item.idEstatusSitio ?? item.estatus ?? "").toLowerCase();
  if (id === "es-1" || /operativo/.test(id)) return "ok";
  if (id === "es-2" || /proceso/.test(id)) return "wip";
  if (id === "es-3" || /constru/.test(id)) return "down";
  return "ok";
}

const Filtro = ({
  // pestañas
  tab = "ciudades", // 'ciudades' | 'sitios' | 'segmentos'
  onTabChange = () => {},

  // datos originales (orden DB)
  ciudades = [],
  sitios = [],
  segmentos = [],

  // toggles de capas
  mostrarCiudades = true,
  setMostrarCiudades = () => {},
  mostrarSitios = false,
  setMostrarSitios = () => {},
  mostrarSegmentos = false,
  setMostrarSegmentos = () => {},

  // callbacks
  onSelectItem = () => {}, // (item, 'ciudad'|'sitio'|'segmento')
  onClose = () => {},

  // control de panel de lista expandido
  expandedList = null, // null | 'ciudades' | 'sitios' | 'segmentos'
  setExpandedList = () => {},

  // búsqueda
  searchQuery = "",
  setSearchQuery = () => {},

  // (opcional) restaurar todos los pines del tab actual
  onRestoreAll, // () => void
}) => {
  const activeCiudades = expandedList === "ciudades";
  const activeSitios = expandedList === "sitios";
  const activeSegmentos = expandedList === "segmentos";

  const [hoverTab, setHoverTab] = React.useState(null); // 'ciudades'|'sitios'|'segmentos'|null

  const tabCount =
    tab === "ciudades" ? ciudades.length : tab === "sitios" ? sitios.length : segmentos.length;

  // filtra por nombre sin alterar el orden original (sólo UI)
  const filterList = (arr, tipo) => {
    if (!searchQuery.trim()) return arr;
    const q = searchQuery.trim().toLowerCase();
    if (tipo === "ciudad") {
      return arr.filter((x) => String(x.nombre ?? "").toLowerCase().includes(q));
    }
    if (tipo === "sitio") {
      return arr.filter((x) => String(x.nombreSitio ?? "").toLowerCase().includes(q));
    }
    // segmento
    return arr.filter((x) => String(x.name ?? "").toLowerCase().includes(q));
  };

  const listToShow = React.useMemo(() => {
    if (expandedList === "ciudades") return filterList(ciudades, "ciudad");
    if (expandedList === "sitios") return filterList(sitios, "sitio");
    if (expandedList === "segmentos") return filterList(segmentos, "segmento");
    return [];
  }, [expandedList, ciudades, sitios, segmentos, searchQuery]);

  const resetToInitial = () => {
    setExpandedList(null);
    setMostrarCiudades(false);
    setMostrarSitios(false);
    setMostrarSegmentos(false);
    setSearchQuery("");
  };



//Estilos primera vista
  const renderHeader = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 12,
      }}
    >
      {/* Tab: Ciudad base */}
      <button
        onMouseEnter={() => setHoverTab("ciudades")}
        onMouseLeave={() => setHoverTab(null)}
        onClick={() => {
          if (activeCiudades) {
            resetToInitial();
          } else {
            onTabChange("ciudades");
            setExpandedList("ciudades");
          }
        }}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: `1px solid ${activeCiudades ? "#2f6fb3" : BORDER}`,
          background:
            activeCiudades || hoverTab === "ciudades"
              ? "linear-gradient(135deg,#102033,#1d375d)"
              : TAB_BG,
          color: STRONG,
          fontWeight: 700,
          letterSpacing: ".4px",
          cursor: "pointer",
          boxShadow: activeCiudades ? "0 6px 18px rgba(48,120,200,0.22)" : "none",
        }}
        title="Ver Ciudad base"
      >
        Ciudad base <span style={{ opacity: 0.8 }}>({ciudades.length})</span>
      </button>

      {/* Tab: Sitios */}
      <button
        onMouseEnter={() => setHoverTab("sitios")}
        onMouseLeave={() => setHoverTab(null)}
        onClick={() => {
          if (activeSitios) {
            resetToInitial();
          } else {
            onTabChange("sitios");
            setExpandedList("sitios");
          }
        }}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: `1px solid ${activeSitios ? "#2fb336ff" : BORDER}`,
          background:
            activeSitios || hoverTab === "sitios"
              ? "linear-gradient(135deg,#0d2a1b,#165736)"
              : TAB_BG,
          color: STRONG,
          fontWeight: 700,
          letterSpacing: ".4px",
          cursor: "pointer",
          boxShadow: activeSitios ? "0 6px 18px rgba(48, 200, 61, 0.22)" : "none",
        }}
        title="Ver Sitios"
      >
        Sitios <span style={{ opacity: 0.8 }}>({sitios.length})</span>
      </button>

      {/* Tab: Segmentos */}
      <button
        onMouseEnter={() => setHoverTab("segmentos")}
        onMouseLeave={() => setHoverTab(null)}
        onClick={() => {
          if (activeSegmentos) {
            resetToInitial();
          } else {
            onTabChange("segmentos");
            setExpandedList("segmentos");
          }
        }}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: `1px solid ${activeSegmentos ? "#b3bd30ff" : BORDER}`,
          background:
            activeSegmentos || hoverTab === "segmentos"
              ? "linear-gradient(135deg,#282a0d, #b3bd30ff)"
              : TAB_BG,
          color: STRONG,
          fontWeight: 700,
          letterSpacing: ".4px",
          cursor: "pointer",
          boxShadow: activeSegmentos ? "0 6px 18px rgba(197, 200, 48, 0.22)" : "none",
        }}
        title="Ver Segmentos"
      >
        Segmentos <span style={{ opacity: 0.8 }}>({segmentos.length})</span>
      </button>

      <div style={{ flex: 1 }} />

      {/* Cerrar */}
      <button
        onClick={onClose}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg,#2a1414,#6d2323)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg,#2a1414,#6d2323)";
        }}
        style={{
          padding: "9px 13px",
          borderRadius: 10,
          border: `1px solid ${"#bd3030ff"}`,
          background: "linear-gradient(135deg,#2a1414,#6d2323)",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Cerrar
      </button>
    </div>
  );





//Estilos al expandir la lista (hacer click vaya)
  const renderToggles = () =>
    expandedList && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          color: SOFT_TXT,
          fontSize: 14,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            opacity: expandedList === "ciudades" ? 1 : 0.6,
          }}
        >
          <input
            type="checkbox"
            checked={mostrarCiudades}
            onChange={(e) => setMostrarCiudades(e.target.checked)}
            disabled={expandedList !== "ciudades"}
          />
          Ver ciudades
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            opacity: expandedList === "sitios" ? 1 : 0.6,
          }}
        >
          <input
            type="checkbox"
            checked={mostrarSitios}
            onChange={(e) => setMostrarSitios(e.target.checked)}
            disabled={expandedList !== "sitios"}
          />
          Ver sitios
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            opacity: expandedList === "segmentos" ? 1 : 0.6,
          }}
        >
          <input
            type="checkbox"
            checked={mostrarSegmentos}
            onChange={(e) => setMostrarSegmentos(e.target.checked)}
            disabled={expandedList !== "segmentos"}
          />
          Ver segmentos
        </label>
      </div>
    );






//Estlos del "submenú" de ciudades, sitios y segmentos
  const renderActions = () =>
    expandedList && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setExpandedList(null)}
          style={{
            padding: "8px 12px",
            borderRadius: 9,
            border: `1px solid ${BORDER}`,
            background: "linear-gradient(135deg,#161f2e,#213149)",
            color: "#c9ddff",
            cursor: "pointer",
            fontWeight: 600,
          }}
          title="Ocultar el listado"
        >
          Ocultar lista
        </button>

        <button
          onClick={() => {
            if (searchQuery.trim() && onRestoreAll) onRestoreAll();
          }}
          disabled={!searchQuery.trim()}
          style={{
            padding: "8px 12px",
            borderRadius: 9,
            border: `1px solid ${BORDER}`,
            background: searchQuery.trim()
              ? "linear-gradient(135deg,#142030,#1f3554)"
              : "linear-gradient(135deg,#141a28,#1b263d)",
            color: searchQuery.trim() ? "#bfe7ff" : "#7a94b2",
            cursor: searchQuery.trim() ? "pointer" : "not-allowed",
            fontWeight: 600,
          }}
          title="Restaurar todos los marcadores del tipo seleccionado"
        >
          Mostrar todas
        </button>

        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Buscar en ${
            expandedList === "ciudades" ? "Ciudad base" : expandedList === "sitios" ? "Sitios" : "Segmentos"
          }...`}
          style={{
            flex: 1,
            minWidth: 180,
            maxWidth: "100%",
            padding: "9px 12px",
            borderRadius: 10,
            border: `1px solid ${BORDER}`,
            background: "#0f1725",
            color: "#e6f0ff",
            outline: "none",
          }}
        />
      </div>
    );







//Estilos de las tarjetitas de la lista
  const renderPlaceholder = () => (
    <div
      style={{
        marginTop: 8,
        padding: "18px 16px",
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: "linear-gradient(135deg,#0f1624 60%, #1b2a44 100%)",
        color: "#cfe4ff",
        textAlign: "center",
        fontWeight: 600,
      }}
    >
      Selecciona <span style={{ color: "#8fd1ff" }}>Ciudad base</span>,{" "}
      <span style={{ color: "#8fd1ff" }}>Sitios</span> o{" "}
      <span style={{ color: "#8fd1ff" }}>Segmentos</span> para ver el listado.
    </div>
  );



  const renderItem = (item, tipo) => {
    // Tarjeta de segmento
    if (tipo === "segmento") {
      const title = item.name ?? "(segmento)";
      const a = item.start_name ?? "inicio";
      const b = item.end_name ?? "fin";
      return (
        <div
          key={item.id}
          onClick={() => onSelectItem(item, "segmento")}
          title="Centrar y mostrar en el mapa"
          style={{
            border: `1px solid ${BORDER}`,
            background: CARD_BG,
            borderRadius: 14,
            padding: "14px",
            color: STRONG,
            marginBottom: 12,
            cursor: "pointer",
            boxShadow: "0 6px 24px rgba(10,14,30,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontWeight: 800, letterSpacing: ".3px", fontSize: 17 }}>{title}</div>
            <span
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 9px",
                borderRadius: 999,
                border: "1px solid #2a6a3a",
                background: "#0f2414",
                color: "#a9f5be",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Segmento
            </span>
          </div>

          <div style={{ color: SOFT_TXT, marginTop: 6, fontSize: 14, lineHeight: 1.35 }}>
            {a} → {b}
          </div>

          <div style={{ marginTop: 8, color: "#8fbaf0", fontSize: 13 }}>
            A: <span style={{ color: "#bfe0ff" }}>{item.start_lat}</span> ·{" "}
            <span style={{ color: "#bfe0ff" }}>{item.start_lng}</span> &nbsp;|&nbsp; B:{" "}
            <span style={{ color: "#bfe0ff" }}>{item.end_lat}</span> ·{" "}
            <span style={{ color: "#bfe0ff" }}>{item.end_lng}</span>
          </div>
        </div>
      );
    }

    
    // Tarjeta de ciudad/sitio reutilizables
    const nombre =
      tipo === "ciudad" ? item.nombre ?? "(sin nombre)" : item.nombreSitio ?? "(sin nombre)";
    const lat = item.latitud ?? item.latitude ?? item.Latitud ?? item.lat;
    const lng = item.longitud ?? item.longitude ?? item.Longitud ?? item.lng;
    const dhl = item.DHL ?? item.descripcion ?? "";
    const sKind = statusKind(item);
    const s = badgeStyles(sKind);
    const badgeText =
      sKind === "ok" ? "Operativo" : sKind === "wip" ? "En proceso" : "En construcción";

    return (
      <div
        key={(tipo === "ciudad" ? item.idCiudadBase : item.idSitio) ?? nombre}
        onClick={() => onSelectItem(item, tipo)}
        title="Centrar y mostrar en el mapa"
        style={{
          border: `1px solid ${BORDER}`,
          background: CARD_BG,
          borderRadius: 14,
          padding: "14px 14px 12px 14px",
          color: STRONG,
          marginBottom: 12,
          cursor: "pointer",
          boxShadow: "0 6px 24px rgba(10,14,30,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 800, letterSpacing: ".3px", fontSize: 17 }}>{nombre}</div>
          <span
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 9px",
              borderRadius: 999,
              border: `1px solid ${s.border}`,
              background: s.bg,
              color: s.text,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: s.dot,
                boxShadow: `0 0 10px ${s.dot}`,
              }}
            />
            {badgeText}
          </span>
        </div>

        {dhl && (
          <div style={{ color: SOFT_TXT, marginTop: 6, fontSize: 14, lineHeight: 1.35 }}>{dhl}</div>
        )}

        <div style={{ marginTop: 8, color: "#8fbaf0", fontSize: 13 }}>
          Lat: <span style={{ color: "#bfe0ff" }}>{lat}</span> · Lng:{" "}
          <span style={{ color: "#bfe0ff" }}>{lng}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        background: "#0b1220",
        borderLeft: `1px solid ${BORDER}`,
        boxShadow: "-4px 0 18px rgba(0,0,0,0.21)",
        padding: 16,
        color: "#fff",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {renderHeader()}
      {renderToggles()}
      {renderActions()}

      <div
        style={{
          marginBottom: 10,
          color: SOFT_TXT,
          fontSize: 13,
          opacity: 0.9,
        }}
      >
        {tab === "ciudades" ? "Ciudad base" : tab === "sitios" ? "Sitios" : "Segmentos"} disponibles:{" "}
        <b style={{ color: "#d6ebff" }}>{tabCount}</b>
      </div>

      {!expandedList ? (
        renderPlaceholder()
      ) : (
        <div style={{ marginTop: 8 }}>
          {listToShow.length === 0 ? (
            <div
              style={{
                padding: "14px 12px",
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                background: "linear-gradient(135deg,#0f1624 60%, #1b2a44 100%)",
                color: "#cfe4ff",
                textAlign: "center",
              }}
            >
              {searchQuery ? "No hay resultados para tu búsqueda." : "Sin elementos."}
            </div>
          ) : (
            listToShow.map((item) =>
              renderItem(
                item,
                expandedList === "ciudades" ? "ciudad" : expandedList === "sitios" ? "sitio" : "segmento"
              )
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Filtro;
