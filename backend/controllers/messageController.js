import { useState, useEffect, useRef } from "react";
import {
  Container,
  Form,
  Button,
  InputGroup,
  Badge,
  Spinner,
} from "react-bootstrap";
import API from "../../utils/Api";

const RECEIVER_ID = 2;
const RECEIVER_NAME = "Alice";

const ChatWindow = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await API.get(`/messages/${RECEIVER_ID}`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const { data } = await API.post("/messages/send", {
        receiverId: RECEIVER_ID,
        message: text.trim(),
      });
      setMessages((prev) => [...prev, data]);
      setText("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column flex-grow-1" style={{ height: "100vh" }}>
      {/* Chat Header */}
      <Container
        fluid
        className="p-3 border-bottom bg-white d-flex align-items-center gap-2"
      >
        <div
          className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
          style={{ width: 38, height: 38, flexShrink: 0 }}
        >
          {RECEIVER_NAME.charAt(0)}
        </div>
        <div>
          <div className="fw-semibold">{RECEIVER_NAME}</div>
          <Badge bg="success" style={{ fontSize: 10 }}>
            Online
          </Badge>
        </div>
      </Container>

      {/* Messages Area */}
      <Container
        fluid
        className="flex-grow-1 overflow-auto p-3"
        style={{ background: "#f0f2f5" }}
      >
        {messages.length === 0 && (
          <div className="text-center text-muted mt-5">
            No messages yet. Say hello!
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <div
              key={msg.id ?? i}
              className={`d-flex mb-2 ${isMine ? "justify-content-end" : "justify-content-start"}`}
            >
              <div
                className="px-3 py-2 rounded-3 shadow-sm"
                style={{
                  maxWidth: "60%",
                  background: isMine ? "#0d6efd" : "white",
                  color: isMine ? "white" : "black",
                }}
              >
                <div style={{ fontSize: 14 }}>{msg.message}</div>
                <div style={{ fontSize: 11, opacity: 0.7, textAlign: "right" }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </Container>

      {/* Input Box */}
      <Container fluid className="p-3 border-top bg-white">
        <Form onSubmit={sendMessage}>
          <InputGroup>
            <Form.Control
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoComplete="off"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!text.trim() || loading}
            >
              {loading ? <Spinner size="sm" /> : "Send"}
            </Button>
          </InputGroup>
        </Form>
      </Container>
    </div>
  );
};

export default ChatWindow;
