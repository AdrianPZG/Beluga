import '../assets/styles/ChatHistory.css';
import ScrollToBottom from 'react-scroll-to-bottom';

const ChatHistory = ({ messages }) => {
  return (
    <div className="chat-box">
      <ScrollToBottom className="chat-scroll">
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                background: msg.sender === "user"
                  ? "rgba(27,38,59,0.95)"
                  : "rgba(27,38,59,0.80)",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: "16px",
                maxWidth: "80%",
                wordWrap: "break-word",
                fontSize: "0.95rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </ScrollToBottom>
    </div>
  );
};

export default ChatHistory;
