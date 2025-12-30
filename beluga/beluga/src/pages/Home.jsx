// src/pages/Home.jsx
import React, { useRef, useState } from "react";
import Navbar from "../Components/Navbar";
import MapView from "/src/Components/Mapa";
import Chat from "/src/Components/Chat";
import ChatHistory from "/src/Components/ChatHistory";
import { AnimatePresence, motion } from "framer-motion";
import Filtro from "../Components/Filtro";
import useIsMobile from "../hooks/useIsMobile";
import {
  X,
  MessageCircle,
  Plus,
  Pencil,
  Pin,
  PinOff,
  Trash2,
  Search as SearchIcon,
  UserRound,
  ChevronLeft,
} from "lucide-react";
import { getCiudades, getSitios, getSegmentos } from "../lib/api";

const NAVBAR_HEIGHT = 55;
const SIDEBAR_W = 255; // ancho desktop del historial (para centrar toasts)
const CHAT_SIDEBAR_W = 300; // nuevo ancho para el chat lateral

const Home = () => {
  // --- Chat e interfaz
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [lastChatId, setLastChatId] = useState(null);

  const [showSidebar, setShowSidebar] = useState(false); // historial (ahora opcional)
  const [showChatSidebar, setShowChatSidebar] = useState(false); // nuevo estado para chat lateral
  const [showFiltro, setShowFiltro] = useState(false); // filtro

  const [showNoInfo, setShowNoInfo] = useState(false);
  const [showNoMessages, setShowNoMessages] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMobile = useIsMobile(750);

  // --- Datos para filtro/mapa
  const [ciudadesOriginales, setCiudadesOriginales] = useState([]);
  const [sitiosOriginales, setSitiosOriginales] = useState([]);
  const [segmentosOriginales, setSegmentosOriginales] = useState([]);

  const [ciudades, setCiudades] = useState([]);
  const [sitios, setSitios] = useState([]);
  const [segmentos, setSegmentos] = useState([]);

  const [tabFiltro, setTabFiltro] = useState("ciudades");
  const [mostrarCiudades, setMostrarCiudades] = useState(false);
  const [mostrarSitios, setMostrarSitios] = useState(false);
  const [mostrarSegmentos, setMostrarSegmentos] = useState(false);

  const [expandedList, setExpandedList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mapa: zoom/sombreado
  const [focusCoord, setFocusCoord] = useState(null);
  const [panCoord, setPanCoord] = useState(null);
  const [mapResetKey, setMapResetKey] = useState(0);

  // Modal de detalle
  const [seleccion, setSeleccion] = useState(null);

  // Menú contextual + modales internos
  const [ctxMenu, setCtxMenu] = useState(null);
  const [uiModal, setUiModal] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [chatBeforeModal, setChatBeforeModal] = useState(null);

  // Búsqueda tipo Grok
  const [showSearch, setShowSearch] = useState(false);
  const [searchAll, setSearchAll] = useState("");
  const [previewChatId, setPreviewChatId] = useState(null);

  // Guardar contexto del filtro
  const prevFiltroRef = useRef(null);

  // --- Cargar datos
  React.useEffect(() => {
    getCiudades().then((data) => setCiudadesOriginales(Array.isArray(data) ? data : [])).catch(console.error);
    getSitios().then((data) => setSitiosOriginales(Array.isArray(data) ? data : [])).catch(console.error);
    getSegmentos().then((data) => setSegmentosOriginales(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  // ------------------ BANNER estilo “SuperGrok” ------------------
  const [showBanner, setShowBanner] = useState(true);
  const dismissBannerNow = () => setShowBanner(false);
  // ---------------------------------------------------------------

  // Cerrar menú contextual
  React.useEffect(() => {
    if (!showSidebar) setCtxMenu(null);
  }, [showSidebar]);

  React.useEffect(() => {
    const closeOnOutside = () => {
      if (ctxMenu) {
        setCtxMenu(null);
        if (chatBeforeModal) {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentChatId(chatBeforeModal);
            setIsTransitioning(false);
            setChatBeforeModal(null);
          }, 8);
        }
      }
    };
    const closeOnScroll = () => ctxMenu && closeOnOutside();
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnOutside);
    window.addEventListener("click", closeOnOutside);
    return () => {
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnOutside);
      window.removeEventListener("click", closeOnOutside);
    };
  }, [ctxMenu, chatBeforeModal]);

  // --- Acciones Chat
  const handleNewChat = () => {
    if (showFiltro) setShowFiltro(false);
    setIsTransitioning(true);
    const newChat = {
      id: Date.now(),
      nombre: `Chat ${chats.length + 1}`,
      mensajes: [],
      fecha: new Date(),
      isPinned: false,
    };
    setChats((prev) => [newChat, ...prev]);
    setTimeout(() => {
      setCurrentChatId(newChat.id);
      setLastChatId(newChat.id);
      setShowChatSidebar(true); // Abrir chat lateral al crear nuevo chat
      setIsTransitioning(false);
    }, 6);
  };

  const handleSend = (text) => {
    if (!text.trim() || !currentChatId) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, mensajes: [...chat.mensajes, { sender: "user", text, at: Date.now() }], fecha: new Date() }
          : chat
      )
    );
  };

  const handleSelectChat = (id) => {
    if (id === currentChatId) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentChatId(id);
      setLastChatId(id);
      setShowChatSidebar(true); // Mostrar chat lateral al seleccionarlo
      setIsTransitioning(false);
    }, 8);
  };

  const handleOpenHistory = () => {
    if (chats.length === 0) {
      setShowNoMessages(true);
      setTimeout(() => setShowNoMessages(false), 2100);
      return;
    }
    setShowSidebar((prev) => !prev);
    setShowChatSidebar(false); // Cerrar chat al abrir historial
  };

  const handleToggleChat = () => {
    if (currentChatId) {
      setLastChatId(currentChatId);
      setCurrentChatId(null);
      setShowChatSidebar(false);
      setIsTransitioning(false);
    } else if (lastChatId) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentChatId(lastChatId);
        setShowChatSidebar(true);
        setIsTransitioning(false);
      }, 90);
    }
  };

  // --- Filtro
  const toggleTab = (t) => {
    setTabFiltro(t);
    if (t === "ciudades") {
      setMostrarCiudades(true);
      setMostrarSitios(false);
      setMostrarSegmentos(false);
      setExpandedList("ciudades");
      setCiudades(ciudadesOriginales);
      setSitios([]);
      setSegmentos([]);
    } else if (t === "sitios") {
      setMostrarSitios(true);
      setMostrarCiudades(false);
      setMostrarSegmentos(false);
      setExpandedList("sitios");
      setSitios(sitiosOriginales);
      setCiudades([]);
      setSegmentos([]);
    } else {
      setMostrarSegmentos(true);
      setMostrarCiudades(false);
      setMostrarSitios(false);
      setExpandedList("segmentos");
      setSegmentos(segmentosOriginales);
      setCiudades([]);
      setSitios([]);
    }
    setSearchQuery("");
    setFocusCoord(null);
    setPanCoord(null);
    setSeleccion(null);
  };

  const handleToggleFiltro = () => {
    const next = !showFiltro;
    setShowFiltro(next);
    if (next) {
      setCurrentChatId(null);
      setShowSidebar(false);
      setShowChatSidebar(false);
      setExpandedList(null);
      setMostrarCiudades(false);
      setMostrarSitios(false);
      setMostrarSegmentos(false);
      setSearchQuery("");
    } else {
      setMostrarCiudades(false);
      setMostrarSitios(false);
      setMostrarSegmentos(false);
      setExpandedList(null);
      setCiudades([]);
      setSitios([]);
      setSegmentos([]);
      setMapResetKey((k) => k + 1);
    }
  };

  const handleSelectFromList = (item, tipo) => {
    const lat = parseFloat(item.latitud ?? item.latitude ?? item.Latitud ?? item.lat);
    const lng = parseFloat(item.longitud ?? item.longitude ?? item.Longitud ?? item.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    if (tipo === "ciudad") {
      setMostrarCiudades(true);
      setMostrarSitios(false);
      setMostrarSegmentos(false);
      setCiudades([item]);
      setSitios([]);
      setSegmentos([]);
    } else if (tipo === "sitio") {
      setMostrarSitios(true);
      setMostrarCiudades(false);
      setMostrarSegmentos(false);
      setSitios([item]);
      setCiudades([]);
      setSegmentos([]);
    } else {
      setMostrarSegmentos(true);
      setMostrarCiudades(false);
      setMostrarSitios(false);
      setSegmentos([item]);
      setCiudades([]);
      setSitios([]);
    }
    setPanCoord({ lat, lng });
    setFocusCoord(null);
  };

  const restoreAllOfCurrentTab = () => {
    if (tabFiltro === "ciudades") {
      setCiudades(ciudadesOriginales);
      setMostrarCiudades(true);
      setMostrarSitios(false);
      setMostrarSegmentos(false);
    } else if (tabFiltro === "sitios") {
      setSitios(sitiosOriginales);
      setMostrarSitios(true);
      setMostrarCiudades(false);
      setMostrarSegmentos(false);
    } else {
      setSegmentos(segmentosOriginales);
      setMostrarSegmentos(true);
      setMostrarCiudades(false);
      setMostrarSitios(false);
    }
    setPanCoord(null);
    setFocusCoord(null);
  };

  const handleMarkerSelect = (item, tipo) => {
    prevFiltroRef.current = {
      tab: tabFiltro,
      ciudades,
      sitios,
      segmentos,
      mostrarCiudades,
      mostrarSitios,
      mostrarSegmentos,
      expandedList,
      searchQuery,
    };

    setSeleccion({ ...item, __tipo: tipo });
    setShowFiltro(false);
    setExpandedList(null);
    setPanCoord(null);

    const lat = parseFloat(item.latitud ?? item.latitude ?? item.Latitud ?? item.lat);
    const lng = parseFloat(item.longitud ?? item.longitude ?? item.Longitud ?? item.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setFocusCoord({ lat, lng });
    }
  };

  const closeModal = () => {
    setSeleccion(null);
    setFocusCoord(null);
    setMapResetKey((k) => k + 1);

    const prev = prevFiltroRef.current;
    if (prev) {
      setTabFiltro(prev.tab);
      setCiudades(prev.ciudades);
      setSitios(prev.sitios);
      setSegmentos(prev.segmentos);
      setMostrarCiudades(prev.mostrarCiudades);
      setMostrarSitios(prev.mostrarSitios);
      setMostrarSegmentos(prev.mostrarSegmentos);
      setExpandedList(prev.expandedList);
      setSearchQuery(prev.searchQuery);
      setShowFiltro(true);
    } else {
      setShowFiltro(true);
      setExpandedList(null);
      setSearchQuery("");
    }
  };






 
  const userName = "Adrián/Provisional";
  const currentChat = chats.find((c) => c.id === currentChatId);

  const handleChatSwipe = (e) => {
    if (!isMobile) return;
    let startY = 0, endY = 0;
    const onTouchStart = (e) => (startY = e.touches[0].clientY);
    const onTouchMove = (e) => (endY = e.touches[0].clientY);
    const onTouchEnd = () => {
      if (startY && endY && endY - startY > 80) {
        setCurrentChatId(null);
        setShowChatSidebar(false);
        setIsTransitioning(false);
      }
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
  };

  const modalStatusKind = (item) => {
    const id = String(item.idEstatusSitio ?? item.estatus ?? "").toLowerCase();
    if (id === "es-1" || /operativo/.test(id)) return "ok";
    if (id === "es-2" || /proceso/.test(id)) return "wip";
    if (id === "es-3" || /constru/.test(id)) return "down";
    return "ok";
  };
  const modalBadge = (kind) => {
    if (kind === "ok") return { text: "Operativo", color: "#22c55e", bg: "#0d2a19", br: "#1d6a3f" };
    if (kind === "wip") return { text: "En proceso", color: "#f59e0b", bg: "#2a1f0f", br: "#7a4a06" };
    return { text: "En construcción", color: "#ef4444", bg: "#2a1010", br: "#7a2020" };
  };

  const menuBtn = {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    color: "#cfe6ff",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 600,
  };
  const miniBtn = {
    background: "#172238",
    border: "1px solid #2d3e5f",
    color: "#cfe6ff",
    borderRadius: 10,
    padding: "9px 14px",
    cursor: "pointer",
    transition: "transform .08s ease, filter .12s ease",
  };
  const solidBlue = {
    background: "#11243c",
    border: "1px solid #2b65a0",
    color: "#e8f5ff",
  };
  const solidRed = {
    background: "#3a1b1b",
    border: "1px solid #7a2020",
    color: "#ffb9b9",
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (currentChatId) {
          setChatBeforeModal(currentChatId);
          setCurrentChatId(null);
        }
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        if (chatBeforeModal) {
          setCurrentChatId(chatBeforeModal);
          setChatBeforeModal(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentChatId, chatBeforeModal]);

  const filteredChats =
    searchAll.trim() === ""
      ? chats
      : chats.filter(
          (c) =>
            c.nombre.toLowerCase().includes(searchAll.toLowerCase()) ||
            c.mensajes.some((m) => String(m.text || "").toLowerCase().includes(searchAll.toLowerCase()))
        );

  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.fecha - a.fecha;
  });

  const avatarCircle = (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "999px",
        background: "linear-gradient(135deg,#132036,#1b2c4a)",
        border: "1px solid #2a4170",
        display: "grid",
        placeItems: "center",
        color: "#9ad1f6",
        flexShrink: 0,
      }}
    >
      <UserRound size={18} />
    </div>
  );

  const highlight = (text, q) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <>
        {before}
        <mark
          style={{
            background: "#234a7a",
            color: "#dff2ff",
            padding: "0 2px",
            borderRadius: 3,
          }}
        >
          {match}
        </mark>
        {after}
      </>
    );
  };

  return (
    <AnimatePresence>
      <style>{`
        @keyframes floatDots { 
          0% { background-position: 0 0, 0 0; } 
          100% { background-position: 200px 60px, -160px -60px; } 
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      <motion.div
        key="main-fade"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#121212",
        }}
      >
        {/* Mapa al fondo */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1,
            pointerEvents: "auto",
          }}
        >
          <MapView
            ciudades={mostrarCiudades ? ciudades : []}
            sitios={mostrarSitios ? sitios : []}
            segmentos={mostrarSegmentos ? segmentos : []}
            focusCoord={focusCoord}
            panCoord={panCoord}
            resetToken={mapResetKey}
            onMarkerSelect={handleMarkerSelect}
          />
        </div>

        {/* Blur detrás del chat cuando está abierto */}
        <AnimatePresence>
          {currentChat && showChatSidebar && (
            <motion.div
              key="map-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.82 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                top: NAVBAR_HEIGHT,
                left: 0,
                width: CHAT_SIDEBAR_W,
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                zIndex: 5,
                background: "rgba(12,22,38,0.25)",
                backdropFilter: "blur(11px)",
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        {/* Navbar */}
        <div
          style={{
            position: "fixed",
            width: "100vw",
            top: 0,
            left: 0,
            zIndex: 20,
            height: NAVBAR_HEIGHT,
            pointerEvents: "auto",
          }}
        >
          <Navbar
            onToggleChat={handleToggleChat}
            isChatOpen={!!currentChatId}
            onToggleFiltro={handleToggleFiltro}
            FiltroAbierto={showFiltro}
            onNewChat={handleNewChat}
            onOpenHistory={handleOpenHistory}
            userName={userName}
            showToggleChatButton={!!(currentChatId || lastChatId)}
            isMobile={isMobile}
            onOpenSidebar={() => setShowSidebar(true)}
          />
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100vw",
            height: "100vh",
            display: "flex",
            marginTop: NAVBAR_HEIGHT,
            pointerEvents: "none",
          }}
        >
          {/* SIDEBAR CHAT */}
          <AnimatePresence>
            {showChatSidebar && currentChat && (
              <motion.div
                key="chat-sidebar"
                initial={{ x: -CHAT_SIDEBAR_W, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -CHAT_SIDEBAR_W, opacity: 0 }}
                transition={{ duration: 0.18, type: "spring", stiffness: 70 }}
                style={{
                  position: "fixed",
                  top: NAVBAR_HEIGHT,
                  left: 0,
                  width: isMobile ? "87vw" : CHAT_SIDEBAR_W,
                  height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                  background: "linear-gradient(140deg, rgba(16,26,42,0.97) 70%, rgba(28,56,92,0.92) 100%)",
                  borderRight: isMobile ? "none" : "1px solid #233b5c",
                  boxShadow: isMobile ? "4px 0 30px rgba(0,0,0,0.24)" : "4px 0 18px rgba(0,0,0,0.21)",
                  overflowY: "auto",
                  zIndex: 1100,
                  padding: isMobile ? "26px 14px 18px 14px" : "14px 10px 10px 10px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  pointerEvents: "auto",
                }}
              >
                {/* Capa de “lucecitas” */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(2px 2px at 16% 32%, rgba(255,255,255,0.18) 50%, transparent 51%), radial-gradient(1.6px 1.6px at 82% 70%, rgba(255,255,255,0.15) 50%, transparent 51%)",
                    backgroundRepeat: "repeat",
                    backgroundSize: "220px 80px, 180px 70px",
                    animation: "floatDots 16s linear infinite",
                    opacity: 0.35,
                    pointerEvents: "none",
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    right: -40,
                    bottom: -60,
                    width: 280,
                    height: 220,
                    background:
                      "radial-gradient(100% 100% at 0% 0%, rgba(88,118,164,0.14) 0%, rgba(15,23,37,0) 70%)",
                    filter: "blur(8px)",
                    pointerEvents: "none",
                  }}
                />

                {/* Flecha para ocultar chat */}
                <button
                  onClick={() => {
                    setCurrentChatId(null);
                    setShowChatSidebar(false);
                  }}
                  title="Ocultar chat"
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 6,
                    background: "rgba(20,34,58,0.55)",
                    border: "1px solid #2a3b55",
                    color: "#cbd5e1",
                    borderRadius: 10,
                    padding: "6px 8px",
                    cursor: "pointer",
                  }}
                >
                  ←
                </button>

                {isMobile && (
                  <button
                    onClick={() => {
                      setCurrentChatId(null);
                      setShowChatSidebar(false);
                    }}
                    style={{
                      position: "absolute",
                      top: 11,
                      right: 11,
                      zIndex: 5,
                      background: "none",
                      border: "none",
                      color: "#cbd5e1",
                      fontSize: 28,
                      cursor: "pointer",
                    }}
                    title="Cerrar chat"
                  >
                    <X size={24} />
                  </button>
                )}

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: isMobile ? "19px 8px 82px 8px" : "30px 18px 90px 18px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <ChatHistory messages={currentChat.mensajes} messageStyle={{ maxWidth: "80%" }} />
                </div>

                {/* Input para escribir */}
                <div
                  style={{
                    position: "absolute",
                    bottom: isMobile ? 11 : 18,
                    left: 0,
                    width: "94%",
                    padding: isMobile ? "0 8px" : "0 20px",
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: isMobile ? 6 : 18,
                      right: isMobile ? 6 : 18,
                      bottom: isMobile ? 6 : 8,
                      height: 70,
                      borderRadius: 14,
                      background:
                        "radial-gradient(80% 120% at 50% 100%, rgba(52,84,132,0.22) 0%, rgba(20,29,46,0.0) 72%)",
                      filter: "blur(10px)",
                      pointerEvents: "none",
                    }}
                  />
                  <Chat onSend={handleSend} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIDEBAR HISTORIAL (opcional) */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                key="sidebar"
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ duration: 0.18, type: "spring", stiffness: 70 }}
                style={{
                  position: "fixed",
                  top: NAVBAR_HEIGHT,
                  left: 0,
                  width: isMobile ? "87vw" : SIDEBAR_W,
                  height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                  background: "rgba(14,18,28,0.98)",
                  borderRight: isMobile ? "none" : "1px solid #233044",
                  boxShadow: isMobile
                    ? "4px 0 30px rgba(0,0,0,0.24)"
                    : "4px 0 18px rgba(0,0,0,0.21)",
                  overflowY: "auto",
                  zIndex: 1100,
                  padding: isMobile ? "26px 14px 18px 14px" : "14px 10px 10px 10px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  pointerEvents: "auto",
                  gap: 12,
                }}
              >
                {/* Buscar */}
                <div style={{ height: 6 }} />
                <button
                  onClick={() => {
                    if (currentChatId) {
                      setChatBeforeModal(currentChatId);
                      setCurrentChatId(null);
                    }
                    setShowSearch(true);
                  }}
                  style={{
                    width: "100%",
                    background: "#0f1725",
                    border: "1px solid #263655",
                    color: "#c8d4e6",
                    padding: "10px 12px",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    marginTop: 6,
                  }}
                  title="Buscar chats (Ctrl+K)"
                >
                  <SearchIcon size={18} />
                  Buscar (Ctrl+K)
                </button>

                {/* Historial de Chats */}
                <h3
                  style={{
                    color: "#b7c9e6",
                    fontWeight: 800,
                    fontSize: isMobile ? 16 : 15,
                    letterSpacing: ".4px",
                    marginTop: 12,
                  }}
                >
                  Historial de Chats
                </h3>

                {chats.length === 0 && (
                  <div style={{ color: "#fff", opacity: 0.65, fontSize: 16, marginTop: 6 }}>
                    No hay chats aún
                  </div>
                )}

                {(() => {
                  const filtered = sortedChats;
                  const pinned = filtered.filter((c) => c.isPinned);
                  const regular = filtered.filter((c) => !c.isPinned);

                  const Item = (chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: isMobile ? "11px 9px" : "9px 10px",
                        marginBottom: 8,
                        background: currentChatId === chat.id ? "#192940" : "transparent",
                        color: currentChatId === chat.id ? "#d8e3f3" : "#dfe8f6",
                        borderRadius: 10,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.15s, color 0.12s",
                        fontSize: isMobile ? 16 : 15,
                        border: "1px solid rgba(45,62,95,0.55)",
                      }}
                    >
                      <div style={{ flexShrink: 0, display: "grid", placeItems: "center" }}>
                        <MessageCircle
                          size={18}
                          style={{ color: currentChatId === chat.id ? "#c7d4e8" : "#9ab0cc" }}
                        />
                      </div>

                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "48%",
                        }}
                      >
                        {chat.nombre}
                      </span>

                      {chat.isPinned && (
                        <Pin size={16} style={{ marginLeft: 2, color: "#9fb0c9", opacity: 0.95 }} />
                      )}

                      <div
                        style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <span style={{ fontSize: 11, color: "#b9c6d6" }}>
                          {new Date(chat.fecha).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {/* Menú 3 puntitos */}
                        <button
                          title="Opciones"
                          onClick={(e) => {
                            e.stopPropagation();
                            const r = e.currentTarget.getBoundingClientRect();
                            if (currentChatId) {
                              setChatBeforeModal(currentChatId);
                              setCurrentChatId(null);
                            }
                            setCtxMenu({
                              chatId: chat.id,
                              x: r.right + 42,
                              y: r.top + window.scrollY + 8,
                            });
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#c3d1e5",
                            fontSize: 18,
                            cursor: "pointer",
                            padding: 2,
                          }}
                        >
                          ⋮
                        </button>
                      </div>
                    </div>
                  );

                  return (
                    <>
                      {pinned.length > 0 && (
                        <>
                          <div
                            style={{
                              color: "#95a6c2",
                              fontSize: 12,
                              margin: "8px 2px 6px",
                              fontWeight: 700,
                            }}
                          >
                            Anclado
                          </div>
                          {pinned.map(Item)}
                          <div
                            style={{
                              color: "#95a6c2",
                              fontSize: 12,
                              margin: "10px 2px 6px",
                              fontWeight: 700,
                            }}
                          >
                            Recientes
                          </div>
                        </>
                      )}
                      {regular.map(Item)}
                    </>
                  );
                })()}

                {/* Footer del sidebar */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 8,
                    borderTop: "1px solid #1f2b40",
                    position: "sticky",
                    bottom: 0,
                    background: "rgba(14,18,28,0.98)",
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 2px" }}>
                    <button
                      onClick={() => {
                        setChatBeforeModal(currentChatId || null);
                        if (currentChatId) setCurrentChatId(null);
                        setUiModal({ type: "profile" });
                      }}
                      title="Perfil"
                      style={{
                        background: "linear-gradient(135deg,#151f2f,#21324f)",
                        border: "1px solid #2a3f63",
                        color: "#cfd9ea",
                        borderRadius: 999,
                        padding: 8,
                        width: 36,
                        height: 36,
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <UserRound size={18} />
                    </button>
                    <div style={{ flex: 1 }} />
                    <button
                      title="Ocultar historial"
                      onClick={() => setShowSidebar(false)}
                      style={{
                        background: "linear-gradient(135deg,#151f2f,#21324f)",
                        border: "1px solid #2a3f63",
                        color: "#cfd9ea",
                        borderRadius: 999,
                        padding: 8,
                        width: 36,
                        height: 36,
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CONTENEDOR CENTRO (Mapa como foco principal) */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 0,
              height: "100vh",
              position: "relative",
              marginLeft: showChatSidebar ? CHAT_SIDEBAR_W : 0,
              marginRight: showFiltro ? 350 : 0,
              pointerEvents: "none",
            }}
          >
            {/* Espacio vacío para mantener el enfoque en el mapa */}
          </div>

          {/* PANEL FILTRO */}
          <AnimatePresence>
            {showFiltro && (
              <motion.div
                key="filtro-panel"
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 70 }}
                style={{
                  position: "fixed",
                  top: NAVBAR_HEIGHT,
                  right: 0,
                  width: isMobile ? "88vw" : 350,
                  height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                  backgroundColor: "#0b1220",
                  borderLeft: "1px solid #27354d",
                  boxShadow: "-4px 0 18px rgba(0,0,0,0.21)",
                  overflowY: "auto",
                  zIndex: 1200,
                  padding: isMobile ? "16px 11px" : "16px",
                  boxSizing: "border-box",
                  pointerEvents: "auto",
                }}
              >
                <Filtro
                  tab={tabFiltro}
                  onTabChange={toggleTab}
                  ciudades={ciudadesOriginales}
                  sitios={sitiosOriginales}
                  segmentos={segmentosOriginales}
                  mostrarCiudades={mostrarCiudades}
                  setMostrarCiudades={setMostrarCiudades}
                  mostrarSitios={mostrarSitios}
                  setMostrarSitios={setMostrarSitios}
                  mostrarSegmentos={mostrarSegmentos}
                  setMostrarSegmentos={setMostrarSegmentos}
                  onSelectItem={handleSelectFromList}
                  expandedList={expandedList}
                  setExpandedList={setExpandedList}
                  onClose={handleToggleFiltro}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onRestoreAll={restoreAllOfCurrentTab}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menú contextual */}
        {ctxMenu && (
          <div
            style={{
              position: "fixed",
              left: ctxMenu.x,
              top: ctxMenu.y,
              zIndex: 3000,
              background: "linear-gradient(135deg,#172033,#22324f)",
              border: "1px solid #2d3e5f",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(10,15,25,0.35)",
              padding: 8,
              width: 190,
            }}
            onMouseLeave={() => setCtxMenu(null)}
          >
            <button
              onClick={() => {
                setCtxMenu(null);
                setUiModal({ type: "rename", chatId: ctxMenu.chatId });
                setRenameValue(chats.find((x) => x.id === ctxMenu.chatId)?.nombre ?? "");
              }}
              style={menuBtn}
            >
              <Pencil size={16} />
              Renombrar
            </button>

            {(() => {
              const c = chats.find((x) => x.id === ctxMenu.chatId);
              const isPinned = !!c?.isPinned;
              return (
                <button
                  onClick={() => {
                    setCtxMenu(null);
                    setChats((prev) =>
                      prev.map((x) => (x.id === ctxMenu.chatId ? { ...x, isPinned: !x.isPinned } : x))
                    );
                  }}
                  style={menuBtn}
                >
                  {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  {isPinned ? "Desanclar" : "Anclar"}
                </button>
              );
            })()}

            <button
              onClick={() => {
                setCtxMenu(null);
                setUiModal({ type: "delete", chatId: ctxMenu.chatId });
              }}
              style={{ ...menuBtn, color: "#ffb0b0" }}
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        )}

        {/* Modales propios */}
        {uiModal && (
          <>
            <div
              onClick={() => {
                setUiModal(null);
                if (chatBeforeModal) {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentChatId(chatBeforeModal);
                    setIsTransitioning(false);
                    setChatBeforeModal(null);
                  }, 12);
                }
              }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 3100,
                backdropFilter: "blur(6px)",
                background: "rgba(12,18,30,0.35)",
              }}
            />
            <div
              style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                zIndex: 3110,
                width: "min(560px, 92vw)",
                background: "linear-gradient(135deg,#132036,#1b2c4a)",
                border: "1px solid #2a4170",
                borderRadius: 14,
                boxShadow: "0 16px 48px rgba(8,16,30,0.45)",
                padding: 16,
                color: "#eaf6ff",
              }}
            >
              {uiModal.type === "rename" && (
                <>
                  <div style={{ fontWeight: 800, marginBottom: 12 }}>Cambiar nombre del chat</div>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #2c3f5f",
                      background: "#0e1626",
                      color: "#e6f2ff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    placeholder="Nuevo nombre…"
                  />
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
                    <button
                      onClick={() => {
                        setUiModal(null);
                        if (chatBeforeModal) {
                          setIsTransitioning(true);
                          setTimeout(() => {
                            setCurrentChatId(chatBeforeModal);
                            setIsTransitioning(false);
                            setChatBeforeModal(null);
                          }, 12);
                        }
                      }}
                      style={miniBtn}
                      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const v = (renameValue || "").trim();
                        if (!v) return;
                        setChats((prev) =>
                          prev.map((c) => (c.id === uiModal.chatId ? { ...c, nombre: v } : c))
                        );
                        setUiModal(null);
                        if (chatBeforeModal) {
                          setIsTransitioning(true);
                          setTimeout(() => {
                            setCurrentChatId(chatBeforeModal);
                            setIsTransitioning(false);
                            setChatBeforeModal(null);
                          }, 12);
                        }
                      }}
                      style={{ ...miniBtn, ...solidBlue }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = "brightness(1.12)";
                        e.currentTarget.style.transform = "scale(1.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = "none";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      Guardar
                    </button>
                  </div>
                </>
              )}

              {uiModal.type === "delete" && (
                <>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>Eliminar chat</div>
                  <div style={{ opacity: 0.85 }}>¿Seguro que deseas eliminar este chat?</div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
                    <button
                      onClick={() => {
                        setUiModal(null);
                        if (chatBeforeModal) {
                          setIsTransitioning(true);
                          setTimeout(() => {
                            setCurrentChatId(chatBeforeModal);
                            setIsTransitioning(false);
                            setChatBeforeModal(null);
                          }, 12);
                        }
                      }}
                      style={miniBtn}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setChats((prev) => prev.filter((c) => c.id !== uiModal.chatId));
                        if (currentChatId === uiModal.chatId) setCurrentChatId(null);
                        setUiModal(null);
                        if (chatBeforeModal) {
                          if (chatBeforeModal !== uiModal.chatId) {
                            setIsTransitioning(true);
                            setTimeout(() => {
                              setCurrentChatId(chatBeforeModal);
                              setIsTransitioning(false);
                            }, 12);
                          }
                          setChatBeforeModal(null);
                        }
                      }}
                      style={{ ...miniBtn, ...solidRed }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = "brightness(1.12)";
                        e.currentTarget.style.transform = "scale(1.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = "none";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}

              {uiModal.type === "profile" && (
                <>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Perfil</div>
                  <div style={{ opacity: 0.9 }}>Sección de perfil (próximamente).</div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
                    <button
                      onClick={() => {
                        setUiModal(null);
                        if (chatBeforeModal) {
                          setIsTransitioning(true);
                          setTimeout(() => {
                            setCurrentChatId(chatBeforeModal);
                            setIsTransitioning(false);
                            setChatBeforeModal(null);
                          }, 12);
                        }
                      }}
                      style={{ ...miniBtn, ...solidBlue }}
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* FAB Nuevo Chat (Mobile) */}
        <AnimatePresence>
          {isMobile && !currentChat && !showSidebar && !showFiltro && (
            <motion.button
              key="fab-newchat-bar"
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 55 }}
              transition={{ type: "spring", stiffness: 160, damping: 14 }}
              onClick={handleNewChat}
              style={{
                position: "fixed",
                left: "50%",
                bottom: 17,
                transform: "translateX(-50%)",
                zIndex: 2100,
                background: "linear-gradient(95deg, #173b57 70%, #24d0f6 100%)",
                color: "#f1feff",
                border: "none",
                borderRadius: "13px",
                boxShadow: "0 2px 22px rgba(32,100,180,0.11)",
                fontWeight: 700,
                fontSize: 17,
                padding: "13px 0",
                width: "77vw",
                maxWidth: 350,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}
              title="Nuevo chat"
            >
              <Plus size={22} style={{ marginRight: 3 }} /> Nuevo chat
            </motion.button>
          )}
        </AnimatePresence>

        {/* BANNER BIENVENIDA */}
        <AnimatePresence>
          {chats.length === 0 && showBanner && !currentChat && !showSidebar && !showFiltro && (
            <motion.div
              key="welcome-banner-pro"
              initial={{ opacity: 0, y: -24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.45, type: "spring", stiffness: 60 }}
              onClick={dismissBannerNow}
              style={{
                position: "fixed",
                bottom: isMobile ? "12vh" : "72px",
                left: "40px",
                maxWidth: 360,
                minWidth: 240,
                borderRadius: 16,
                padding: "16px 18px 18px 18px",
                color: "#dbe7f5",
                fontWeight: 600,
                zIndex: 2220,
                fontSize: "1.02rem",
                letterSpacing: "1.02px",
                pointerEvents: "auto",
                userSelect: "none",
                border: "1.2px solid #2b3f5e",
                background: "linear-gradient(112deg, #141b2b 70%, #20304b 100%)",
                boxShadow: "0 10px 30px rgba(10,18,36,0.4)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
                  transform: "translateX(-100%)",
                  animation: "shimmer 6s linear infinite",
                  pointerEvents: "none",
                }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(2.2px 2.2px at 20% 30%, rgba(255,255,255,0.28) 50%, transparent 51%), radial-gradient(1.8px 1.8px at 70% 60%, rgba(255,255,255,0.22) 50%, transparent 51%)",
                  backgroundRepeat: "repeat",
                  backgroundSize: "200px 60px, 160px 60px",
                  animation: "floatDots 12s linear infinite",
                  opacity: 0.6,
                  pointerEvents: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    background:
                      "radial-gradient(circle at 30% 30%, #2a3c5a 0%, #1a253a 60%, #141b2b 100%)",
                    border: "1px solid #2b3f5e",
                  }}
                />
                <div>
                  <b style={{ color: "#cfe2ff", fontWeight: 800 }}>Beluga</b>
                  <div style={{ color: "#a9bdd6", fontWeight: 500, marginTop: 2 }}>
                    Crea un chat nuevo para comenzar
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#b5c7de",
                  opacity: 0.9,
                }}
              ></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL DETALLE */}
        <AnimatePresence>
          {seleccion && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={closeModal}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 2100,
                  backdropFilter: "blur(6px)",
                  background: "rgba(12,18,30,0.35)",
                }}
              />
              <motion.div
                key="detail-card"
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "fixed",
                  zIndex: 2101,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%,-50%)",
                  width: "min(880px, 92vw)",
                  borderRadius: 18,
                  background:
                    "linear-gradient(135deg, rgba(22,35,58,0.98) 65%, rgba(35,65,110,0.92) 100%)",
                  color: "#eaf6ff",
                  border: "1px solid #284a74",
                  boxShadow: "0 16px 50px rgba(8,16,30,0.5)",
                  padding: 18,
                }}
              >
                <button
                  onClick={closeModal}
                  title="Cerrar"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 12,
                    background: "transparent",
                    border: "none",
                    color: "#cfe8ff",
                    fontSize: 22,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>

                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: ".3px" }}>
                  {seleccion.__tipo === "ciudad"
                    ? seleccion.nombre ?? "(sin nombre)"
                    : seleccion.__tipo === "sitio"
                    ? seleccion.nombreSitio ?? "(sin nombre)"
                    : seleccion.name ?? seleccion.nombre ?? "(sin nombre)"}
                  <span style={{ fontSize: 13, marginLeft: 8, opacity: 0.8 }}>
                    ({seleccion.__tipo})
                  </span>
                </div>

                {seleccion.descripcion && (
                  <div style={{ marginTop: 8, opacity: 0.9 }}>{seleccion.descripcion}</div>
                )}

                <div style={{ marginTop: 10, color: "#bfe0ff" }}>
                  Lat:{" "}
                  <b>
                    {seleccion.latitud ??
                      seleccion.latitude ??
                      seleccion.Latitud ??
                      seleccion.lat}
                  </b>{" "}
                  · Lng:{" "}
                  <b>
                    {seleccion.longitud ??
                      seleccion.longitude ??
                      seleccion.Longitud ??
                      seleccion.lng}
                  </b>
                </div>

                {(() => {
                  const k = modalStatusKind(seleccion);
                  const b = modalBadge(k);
                  return (
                    <div
                      style={{
                        marginTop: 14,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: `1px solid ${b.br}`,
                        background: b.bg,
                        color: b.color,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 99,
                          background: b.color,
                          boxShadow: `0 0 10px ${b.color}`,
                        }}
                      />
                      {b.text}
                    </div>
                  );
                })()}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* TOAST – solo “No tienes chats” */}
        <AnimatePresence>
          {showNoMessages && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              style={{
                position: "fixed",
                top: "18vh",
                left: isMobile ? "48%" : showSidebar ? `calc(50% - ${SIDEBAR_W / 1.6}px)` : "46%",
                transform: "translateX(-50%)",
                background: "linear-gradient(120deg,#1a2436 85%, #263f63 100%)",
                color: "#eaf0fb",
                padding: "19px 44px",
                borderRadius: "17px",
                boxShadow: "0 4px 26px rgba(36,84,180,0.17)",
                zIndex: 2500,
                fontSize: "1.12rem",
                letterSpacing: "1.03px",
                fontWeight: 500,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                gap: 13,
              }}
            >
              <MessageCircle size={18} color="#9fb3d6" />
              No tienes chats
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay de BÚSQUEDA */}
        <AnimatePresence>
          {showSearch && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  setShowSearch(false);
                  if (chatBeforeModal) {
                    setCurrentChatId(chatBeforeModal);
                    setChatBeforeModal(null);
                  }
                }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 3300,
                  backdropFilter: "blur(4px)",
                  background: "rgba(8,12,20,0.55)",
                }}
              />
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 3310,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
                onClick={() => {
                  setShowSearch(false);
                  if (chatBeforeModal) {
                    setCurrentChatId(chatBeforeModal);
                    setChatBeforeModal(null);
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    width: "min(980px, 92vw)",
                    maxHeight: "78vh",
                    overflow: "hidden",
                    background: "linear-gradient(135deg,#101826,#17253e)",
                    border: "1px solid #263e64",
                    borderRadius: 16,
                    boxShadow: "0 14px 40px rgba(8,16,30,0.5)",
                    padding: 14,
                    color: "#eaf6ff",
                    pointerEvents: "auto",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <SearchIcon size={18} />
                    <input
                      autoFocus
                      placeholder="Buscar chats o mensajes…"
                      value={searchAll}
                      onChange={(e) => setSearchAll(e.target.value)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        color: "#eaf6ff",
                        outline: "none",
                        fontSize: 16,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40% 1fr",
                      gap: 12,
                      maxHeight: "calc(78vh - 50px)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #233a5a",
                        borderRadius: 12,
                        padding: 8,
                        overflowY: "auto",
                        background: "linear-gradient(135deg,#0f1725,#182744)",
                      }}
                    >
                      {sortedChats.length === 0 ? (
                        <div style={{ opacity: 0.8, padding: 10 }}>Sin resultados.</div>
                      ) : (
                        sortedChats.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => setPreviewChatId(c.id)}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 10,
                              border: `1px solid ${previewChatId === c.id ? "#2a4f7a" : "#223659"}`,
                              background:
                                previewChatId === c.id
                                  ? "linear-gradient(135deg,#152238,#233e65)"
                                  : "transparent",
                              marginBottom: 8,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <MessageCircle size={16} style={{ color: "#9ab0cc" }} />
                            <div style={{ fontWeight: 700, flex: 1 }}>{c.nombre}</div>
                            {c.isPinned && <Pin size={16} style={{ color: "#9fb0c9" }} />}
                          </div>
                        ))
                      )}
                    </div>

                    <div
                      style={{
                        border: "1px solid #233a5a",
                        borderRadius: 12,
                        padding: 12,
                        background: "linear-gradient(135deg,#0d1628,#152743)",
                        overflowY: "auto",
                      }}
                    >
                      {(() => {
                        const sel =
                          chats.find((c) => c.id === previewChatId) || sortedChats[0] || null;
                        if (!sel) return <div style={{ opacity: 0.8 }}>Sin selección.</div>;
                        const q = (searchAll || "").trim();
                        const firstHit =
                          q &&
                          sel.mensajes.find((m) =>
                            String(m.text || "").toLowerCase().includes(q.toLowerCase())
                          );
                        const text =
                          (firstHit && firstHit.text) ||
                          (sel.mensajes[sel.mensajes.length - 1]?.text || "");
                        return (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 8,
                              }}
                            >
                              <MessageCircle size={18} style={{ color: "#c3d1e5" }} />
                              <div style={{ fontWeight: 800 }}>{sel.nombre}</div>
                              <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
                                {new Date(sel.fecha).toLocaleString()}
                              </div>
                            </div>

                            <div
                              style={{
                                padding: 12,
                                borderRadius: 10,
                                border: "1px solid #2a3f63",
                                background: "#0f1b2e",
                                marginBottom: 10,
                                minHeight: 80,
                                lineHeight: 1.35,
                              }}
                            >
                              {highlight(text || "Sin mensajes aún.", q)}
                            </div>

                            <button
                              onClick={() => {
                                setShowSearch(false);
                                handleSelectChat(sel.id);
                                setPreviewChatId(null);
                                setSearchAll("");
                              }}
                              style={{
                                padding: "9px 13px",
                                borderRadius: 10,
                                border: "1px solid #2a3f63",
                                background: "linear-gradient(135deg,#142030,#1f3554)",
                                color: "#c9ddff",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              Abrir chat
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default Home;
