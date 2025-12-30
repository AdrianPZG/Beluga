import React, { useState, useRef, useEffect } from "react";

const MAX_HEIGHT = 124; // aprox 5 líneas de texto

const Chat = ({ onSend }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  // Ajusta la altura del textarea, pero nunca mayor al máximo
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "44px";
      el.style.overflowY = "hidden";
      if (el.scrollHeight <= MAX_HEIGHT) {
        el.style.height = el.scrollHeight + "px";
      } else {
        el.style.height = MAX_HEIGHT + "px";
        el.style.overflowY = "auto";
      }
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <form
      style={{
        width: "calc(100% - 20px)", 
        margin: "0 auto 12px auto",
        display: "flex",
        alignItems: "flex-end",
        background: "rgba(13,27,42,0.96)",
        borderRadius: "16px",
        boxShadow: "0 2px 18px #0d1b2a55",
        border: "1.1px solid #1b263b",
        padding: "12px",
        gap: "10px",
        fontFamily: "'Inter', 'Roboto', sans-serif"
      }}
      onSubmit={e => { e.preventDefault(); handleSend(); }}
      autoComplete="off"
    >
      <textarea
        ref={textareaRef}
        value={input}
        placeholder="Escribe tu mensaje..."
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: "1.1rem",
          fontFamily: "'Inter', 'Roboto', sans-serif",
          background: "transparent",
          color: "#f1f1f1",
          padding: "12px 14px",
          borderRadius: "11px",
          minHeight: "44px",
          maxHeight: MAX_HEIGHT + "px",
          resize: "none",
          boxSizing: "border-box",
          letterSpacing: ".01em",
          overflowY: "auto",
          transition: "box-shadow 0.15s, background 0.2s"
        }}
        autoComplete="off"
      />

      <button
        type="submit"
        style={{
          background: "#e3e5e9ff",
          border: "none",
          outline: "none",
          height: "44px",
          minWidth: "44px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 1px 6px #18224133",
          transition: "background 0.14s, transform 0.11s",
        }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        aria-label="Enviar"
        disabled={input.trim().length === 0}
      >
        <img
          src="src/assets/images/enviar.png"
          alt="Enviar"
          style={{
            width: "21px",
            height: "21px",
            objectFit: "contain",
            filter: input.trim().length > 0 ? "invert(1)" : "invert(0.6)",
            opacity: input.trim().length > 0 ? 1 : 0.5,
            transition: "filter 0.45s, opacity 0.15s",
          }}
        />
      </button>
    </form>
  );
};

export default Chat;
