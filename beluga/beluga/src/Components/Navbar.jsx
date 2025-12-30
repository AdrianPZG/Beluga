import React from 'react';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const NAV_BG = "linear-gradient(90deg, #151b28 80%, #232b3e 100%)";
const BUTTON_BG = "linear-gradient(135deg,#162133,#1f2f4d)";
const BUTTON_BORDER = "#2a3c5e";
const BUTTON_HOVER_BG = "linear-gradient(135deg,#1a2942,#294166)";
const BUTTON_ACTIVE_BG = "linear-gradient(135deg,#1d2f4d,#2d4a78)";
const BORDER_COLOR = "#232e40";
const spring = { type: "spring", stiffness: 420, damping: 22 };

const Navbar = ({
  onToggleChat,
  isChatOpen,
  onToggleFiltro,
  FiltroAbierto,
  onNewChat,
  onOpenHistory,
  userName = "Adrián/Provisional",
  showToggleChatButton,
  onUserClick, // abre el mismo panel que “Perfil”
}) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 650;
  const logoSize = isMobile ? 30 : 40;
  const headerHeight = isMobile ? 54 : 66;
  const titleFontSize = isMobile ? '1.12rem' : '1.28rem';

  const AnimatedButton = ({ children, title, onClick, style = {} }) => (
    <motion.button
      whileHover={{ scale: 1.08, boxShadow: "0 4px 22px rgba(34,86,160,0.18)" }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      title={title}
      onClick={onClick}
      style={{
        background: BUTTON_BG,
        borderRadius: 12,
        border: `1px solid ${BUTTON_BORDER}`,
        padding: '8px 10px',
        marginLeft: 10,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        color: "#cfe6ff",
        fontSize: 21,
        outline: "none",
        transition: "background 0.15s, transform 0.1s, box-shadow 0.15s",
        ...style,
      }}
      onMouseOver={e => e.currentTarget.style.background = BUTTON_HOVER_BG}
      onMouseOut={e => e.currentTarget.style.background = BUTTON_BG}
      onMouseDown={e => e.currentTarget.style.background = BUTTON_ACTIVE_BG}
      onMouseUp={e => e.currentTarget.style.background = BUTTON_HOVER_BG}
    >
      {children}
    </motion.button>
  );

  // MOBILE
  if (isMobile) {
    return (
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
        style={{
          width: "100vw",
          height: headerHeight,
          background: NAV_BG,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px",
          boxSizing: "border-box",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          boxShadow: "0 3px 20px 0 rgba(22, 27, 34, 0.14)",
          borderBottom: `1.5px solid ${BORDER_COLOR}`,
          fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* Logo + título (recarga página) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
             onClick={() => window.location.reload()}>
          <img
            src="/src/assets/images/beluga.png"
            alt="Beluga Logo"
            style={{
              height: logoSize,
              width: logoSize,
              borderRadius: "8px",
              background: "transparent",
              border: "none",
              objectFit: "contain",
            }}
          />
          <span style={{ fontWeight: 800, letterSpacing: "1.4px" }}>BELUGA</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <AnimatedButton title="Historial" onClick={onOpenHistory} style={{ marginLeft: 0, padding: 7 }}>
            <HistoryIcon fontSize="medium" />
          </AnimatedButton>
          <AnimatedButton title="Perfil" onClick={onUserClick} style={{ marginLeft: 6 }}>
            <AccountCircleIcon fontSize="large" />
          </AnimatedButton>
        </div>
      </motion.header>
    );
  }

  // DESKTOP
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 60, damping: 15 }}
      style={{
        width: "100vw",
        height: headerHeight,
        background: NAV_BG,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 36px",
        boxSizing: "border-box",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: "0 3px 20px 0 rgba(22, 27, 34, 0.14)",
        borderBottom: `1.5px solid ${BORDER_COLOR}`,
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* IZQ: Logo + nombre (recarga página) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08 }}
        style={{ display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}
        onClick={() => window.location.reload()}
      >
        <img
          src="/src/assets/images/beluga.png"
          alt="Beluga Logo"
          style={{
            height: logoSize,
            width: logoSize,
            borderRadius: "8px",
            background: "transparent",
            border: "none",
            objectFit: "contain",
          }}
        />
        <span
          style={{
            fontWeight: 700,
            fontSize: titleFontSize,
            letterSpacing: "1.5px",
            color: "#fff",
            textTransform: "uppercase",
            opacity: 0.95,
            marginTop: 1
          }}
        >
          Beluga
        </span>
      </motion.div>

      {/* DER: Acciones y perfil */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.12 }}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <AnimatedButton title="Nuevo chat" onClick={onNewChat}>
          <AddIcon fontSize="medium" />
          <span style={{ marginLeft: 6, fontWeight: 600, fontSize: 15, color: "#cfe6ff", letterSpacing: "1px" }}>Nuevo chat</span>
        </AnimatedButton>

        <AnimatedButton title="Historial" onClick={onOpenHistory}>
          <HistoryIcon fontSize="medium" />
        </AnimatedButton>

        <AnimatedButton title={FiltroAbierto ? "Cerrar filtro" : "Abrir filtro"} onClick={onToggleFiltro}>
          <TuneIcon fontSize="medium" />
        </AnimatedButton>

        {showToggleChatButton && (
          <AnimatedButton title={isChatOpen ? "Ocultar chat" : "Mostrar chat"} onClick={onToggleChat}>
            {isChatOpen ? <KeyboardArrowLeftIcon fontSize="medium" /> : <KeyboardArrowRightIcon fontSize="medium" />}
          </AnimatedButton>
        )}

        <AnimatedButton title="Perfil" onClick={onUserClick} style={{ marginLeft: 18 }}>
          <AccountCircleIcon fontSize="large" />
          <span style={{ marginLeft: 6, fontWeight: 500, fontSize: 15, color: "#e4e8ee", letterSpacing: "1px" }}>{userName}</span>
        </AnimatedButton>
      </motion.div>
    </motion.header>
  );
};

export default Navbar;
