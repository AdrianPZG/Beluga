import React from 'react';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// Animación de deslizado en el NavBar
const navbarAnimation = {
  transition: 'all 0.45s cubic-bezier(.86,0,.07,1)',
  transform: 'translateY(0)',
  opacity: 1,
};

const Navbar = ({ onToggleChat, isChatOpen, onToggleFiltro, FiltroAbierto }) => {
  const logoSize = 48;

  // Responsive: si window < 600px
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
  const headerHeight = isMobile ? 60 : 70;
  const headerPadding = isMobile ? '0 16px' : '0 32px';
  const titleFontSize = isMobile ? '1.2rem' : '1.5rem';

  return (
    <header
      style={{
        width: "100vw",
        height: headerHeight,
        background: "linear-gradient(90deg, #0d1b2a, #1b263b)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: headerPadding,
        boxSizing: "border-box",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        ...navbarAnimation,
      }}
    >
      <button
        onClick={onToggleChat}
        style={{
          position: "absolute",
          left: isMobile ? 12 : 32,
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          transition: "background 0.3s, transform 0.2s",
        }}
        title={isChatOpen ? "Ocultar chat" : "Mostrar chat"}
        onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
        onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        onMouseDown={e => e.currentTarget.style.transform = "translateY(-50%) scale(0.95)"}
        onMouseUp={e => e.currentTarget.style.transform = "translateY(-50%)"}
      >
        {isChatOpen ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
      </button>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center"
        }}
      >
        <img
          src="/src/assets/images/beluga.png"
          style={{
            height: `${logoSize}px`,
            width: `${logoSize}px`,
            marginRight: "14px",
            objectFit: "contain"
          }}
        />
        <span
          style={{
            fontSize: titleFontSize,
            fontWeight: 600,
            fontFamily: "'Inter', 'Cinzel', serif",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            height: `${logoSize}px`,
            letterSpacing: "1px"
          }}
        >
          Beluga
        </span>
      </div>

      <button
        onClick={onToggleFiltro}
        style={{
          position: "absolute",
          right: isMobile ? 12 : 32,
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(226, 150, 150, 0.08)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "8px ",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          transition: "background 0.3s, transform 0.2s",
        }}
        title={FiltroAbierto ? "Cerrar filtro" : "Abrir filtro"}
        onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
        onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        onMouseDown={e => e.currentTarget.style.transform = "translateY(-50%) scale(0.95)"}
        onMouseUp={e => e.currentTarget.style.transform = "translateY(-50%)"}
      >
        {FiltroAbierto ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
      </button>
    </header>
  );
};

export default Navbar;
