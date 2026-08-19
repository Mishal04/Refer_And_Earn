import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Layout from "../components/Layout";
import NetworkVisualSmall from "../components/NetworkVisualSmall";

const SOCKET_URL = "http://localhost:5000";

// Fallback known admin ID if not provided by env or conversations
const DEFAULT_ADMIN_ID = import.meta.env.VITE_ADMIN_ID || "6a8422bb51523f553fac193f";
const DEFAULT_ADMIN_NAME = "Admin Support (Saraa Ahmed)";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
};

// ─── Conversation List Item ───────────────────────────────────────────────────

const ConversationItem = ({ conv, isActive, onClick }) => {
  const hasUnread = conv.unread > 0;
  const initials = conv.name
    ? conv.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className="w-full text-left px-3.5 py-3 rounded-xl transition-all relative overflow-hidden"
      style={{
        backgroundColor: isActive ? "var(--color-primary)" : "transparent",
        border: isActive ? "none" : "1.5px solid transparent",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm"
          style={{
            backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "#D9A441",
            color: "#ffffff",
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-1">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: isActive ? "#fff" : "var(--color-text)" }}
            >
              {conv.name}
            </p>
            {conv.lastMessageAt && (
              <span
                className="text-xs flex-shrink-0"
                style={{ color: isActive ? "rgba(255,255,255,0.65)" : "var(--color-muted)" }}
              >
                {formatDate(conv.lastMessageAt)}
              </span>
            )}
          </div>
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: isActive ? "rgba(255,255,255,0.75)" : "var(--color-muted)" }}
          >
            {conv.lastMessage || "Start a conversation"}
          </p>
        </div>
        {hasUnread && !isActive && (
          <span
            className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: "#D9A441" }}
          >
            {conv.unread}
          </span>
        )}
      </div>
    </motion.button>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({ msg, isMine }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.18 }}
    className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2.5`}
  >
    <div
      className="max-w-[78%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
      style={
        isMine
          ? {
              backgroundColor: "var(--color-primary)",
              color: "#fff",
              borderBottomRightRadius: "4px",
            }
          : {
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              border: "1.5px solid var(--color-border)",
              borderBottomLeftRadius: "4px",
            }
      }
    >
      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
      <p
        className="text-[10px] mt-1 text-right"
        style={{ color: isMine ? "rgba(255,255,255,0.6)" : "var(--color-muted)" }}
      >
        {formatTime(msg.createdAt)}
      </p>
    </div>
  </motion.div>
);

// ─── New Message Modal ────────────────────────────────────────────────────────

const NewMessageModal = ({ isOpen, onClose, onSelectUser, currentUserRole }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (currentUserRole === "admin") {
      setLoading(true);
      // Fetch users from admin-accessible endpoints (leads & withdrawals & top referrers)
      Promise.allSettled([
        api.get("/leads"),
        api.get("/withdrawals"),
        api.get("/analytics/top-referrers"),
      ])
        .then(([leadsRes, withRes, topRes]) => {
          const userMap = new Map();

          if (leadsRes.status === "fulfilled" && Array.isArray(leadsRes.value.data)) {
            leadsRes.value.data.forEach((lead) => {
              if (lead.referredBy && lead.referredBy._id) {
                userMap.set(lead.referredBy._id, {
                  _id: lead.referredBy._id,
                  name: lead.referredBy.name,
                  email: lead.referredBy.email,
                  referralCode: lead.referredBy.referralCode,
                });
              }
            });
          }

          if (withRes.status === "fulfilled" && Array.isArray(withRes.value.data)) {
            withRes.value.data.forEach((w) => {
              if (w.user && w.user._id) {
                userMap.set(w.user._id, {
                  _id: w.user._id,
                  name: w.user.name,
                  email: w.user.email,
                });
              }
            });
          }

          if (topRes.status === "fulfilled" && Array.isArray(topRes.value.data)) {
            topRes.value.data.forEach((top) => {
              if (top.userId) {
                userMap.set(top.userId, {
                  _id: top.userId,
                  name: top.name,
                  email: top.email,
                });
              }
            });
          }

          setContacts(Array.from(userMap.values()));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      // Referrer user: Admin support option
      setContacts([
        {
          _id: DEFAULT_ADMIN_ID,
          name: DEFAULT_ADMIN_NAME,
          email: "admin@referandearn.com",
          role: "Administrator",
          isSupport: true,
        },
      ]);
    }
  }, [isOpen, currentUserRole]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl z-10"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg" style={{ color: "var(--color-text)" }}>
              {currentUserRole === "admin" ? "Message a Referrer" : "Contact Admin Support"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-muted)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {currentUserRole === "admin" && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search referrer by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
          )}

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="space-y-2 py-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="animate-pulse h-14 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }} />
                ))}
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {currentUserRole === "admin"
                    ? "No referrers found yet."
                    : "No admin contact available."}
                </p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const initials = (contact.name || "User")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <motion.button
                    key={contact._id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      onSelectUser(contact);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3.5 p-3 rounded-xl text-left transition-colors"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      border: "1.5px solid var(--color-border)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: contact.isSupport ? "var(--color-primary)" : "#D9A441" }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
                          {contact.name}
                        </p>
                        {contact.isSupport && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Support
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--color-muted)" }}>
                        {contact.email}
                      </p>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-muted)" }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </motion.button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Chat Window Component ────────────────────────────────────────────────────

const ChatWindow = ({ convUser, myId, socket, isConnected, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const convUserId = convUser?.userId || convUser?._id;
  const convName = convUser?.name || "Chat";

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch conversation history
  useEffect(() => {
    if (!convUserId) return;
    setLoading(true);
    setMessages([]);
    api
      .get(`/messages/${convUserId}`)
      .then((res) => {
        setMessages(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching chat history:", err);
      })
      .finally(() => setLoading(false));
  }, [convUserId]);

  // Listen for socket messages for this active chat
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      const msgSender = msg.sender?._id || msg.sender;
      const msgReceiver = msg.receiver?._id || msg.receiver;

      const isForThisChat =
        (msgSender === myId && msgReceiver === convUserId) ||
        (msgSender === convUserId && msgReceiver === myId);

      if (isForThisChat) {
        setMessages((prev) => {
          // Check if already present by _id or matched optimistic message
          const exists = prev.some(
            (m) =>
              m._id === msg._id ||
              (m.isOptimistic && m.text === msg.text && m.sender === msgSender)
          );
          if (exists) {
            // Replace optimistic with real message if needed
            return prev.map((m) =>
              m.isOptimistic && m.text === msg.text ? msg : m
            );
          }
          return [...prev, msg];
        });
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [socket, convUserId, myId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !socket || !convUserId) return;

    // Optimistic addition
    const optimistic = {
      _id: `opt-${Date.now()}`,
      sender: myId,
      receiver: convUserId,
      text: trimmed,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    inputRef.current?.focus();

    socket.emit("sendMessage", {
      senderId: myId,
      receiverId: convUserId,
      text: trimmed,
    });
  };

  const handleIcebreaker = (promptText) => {
    setText(promptText);
    inputRef.current?.focus();
  };

  const initials = convName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{
          borderBottom: "1.5px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden mr-1 p-1 rounded-lg"
              style={{ color: "var(--color-muted)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {convName}
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-400"}`}
              />
              <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>
                {isConnected ? "Active connection" : "Reconnecting…"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        {loading ? (
          <div className="flex flex-col gap-3 py-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`animate-pulse rounded-2xl h-12 ${
                  i % 2 === 0 ? "w-2/3" : "w-1/2 self-end ml-auto"
                }`}
                style={{ backgroundColor: "var(--color-border)" }}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-10 px-4 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
              style={{ backgroundColor: "rgba(217,164,65,0.15)" }}
            >
              👋
            </div>
            <div>
              <h4 className="font-display font-bold text-base mb-1" style={{ color: "var(--color-text)" }}>
                Say hello to {convName}!
              </h4>
              <p className="text-xs max-w-sm" style={{ color: "var(--color-muted)" }}>
                Send a message below to start this live conversation. Real-time updates are enabled.
              </p>
            </div>

            {/* Suggested icebreakers */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mt-2">
              <button
                onClick={() => handleIcebreaker("Hello! I have a question regarding my referral payout.")}
                className="text-xs px-3 py-1.5 rounded-full border transition-all hover:bg-white"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  backgroundColor: "rgba(255,255,255,0.6)",
                }}
              >
                💬 Ask about payouts
              </button>
              <button
                onClick={() => handleIcebreaker("Hi! Can you check the review status of my recent lead?")}
                className="text-xs px-3 py-1.5 rounded-full border transition-all hover:bg-white"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  backgroundColor: "rgba(255,255,255,0.6)",
                }}
              >
                🔍 Check lead status
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const msgSender = msg.sender?._id || msg.sender;
              return (
                <MessageBubble
                  key={msg._id}
                  msg={msg}
                  isMine={msgSender === myId}
                />
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
        style={{
          borderTop: "1.5px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Message ${convName}…`}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
          style={{
            border: "1.5px solid var(--color-border)",
            backgroundColor: "var(--color-bg)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </motion.button>
      </form>
    </div>
  );
};

// ─── Main Messages Page ───────────────────────────────────────────────────────

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // Setup Socket.io connection
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      if (user?._id) {
        socket.emit("join", user._id);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Global listener to update conversation list previews in real time
    socket.on("receiveMessage", (msg) => {
      const msgSender = msg.sender?._id || msg.sender;
      const msgReceiver = msg.receiver?._id || msg.receiver;
      const otherUserId = msgSender === user?._id ? msgReceiver : msgSender;

      setConversations((prev) => {
        const index = prev.findIndex((c) => c.userId === otherUserId);
        if (index !== -1) {
          const updated = { ...prev[index] };
          updated.lastMessage = msg.text;
          updated.lastMessageAt = msg.createdAt;
          if (msgSender !== user?._id && activeConv?.userId !== otherUserId) {
            updated.unread = (updated.unread || 0) + 1;
          }
          const rest = prev.filter((_, i) => i !== index);
          return [updated, ...rest];
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, activeConv?.userId]);

  // Load conversations from backend
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/messages/conversations");
      if (Array.isArray(res.data)) {
        const parsed = res.data.map((item) => ({
          userId: item.user?._id || item.userId || item._id,
          name: item.user?.name || item.name || "User",
          email: item.user?.email || item.email,
          lastMessage: item.lastMessage || "",
          lastMessageAt: item.lastMessageTime || item.lastMessageAt || item.createdAt,
          unread: 0,
        }));
        setConversations(parsed);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setConvsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectConv = (conv) => {
    // Reset unread count for this conversation
    setConversations((prev) =>
      prev.map((c) => (c.userId === conv.userId ? { ...c, unread: 0 } : c))
    );
    setActiveConv(conv);
    setShowChat(true);
  };

  const handleStartNewChat = (selectedUser) => {
    const newConv = {
      userId: selectedUser._id,
      name: selectedUser.name,
      email: selectedUser.email,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      unread: 0,
    };

    // Prepend if not already in conversation list
    setConversations((prev) => {
      const exists = prev.find((c) => c.userId === selectedUser._id);
      if (exists) return prev;
      return [newConv, ...prev];
    });

    setActiveConv(newConv);
    setShowChat(true);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col overflow-hidden">
        {/* Two-Column Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left: Conversations List ───────────────────────────────────── */}
          <div
            className={`${
              showChat ? "hidden md:flex" : "flex"
            } flex-col w-full md:w-80 flex-shrink-0`}
            style={{
              borderRight: "1.5px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3.5 flex items-center justify-between flex-shrink-0"
              style={{ borderBottom: "1.5px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
                  Messages
                </h2>
                <span
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-400"}`}
                  title={isConnected ? "Socket Connected" : "Connecting..."}
                />
              </div>

              {/* + New Message Button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New</span>
              </motion.button>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto p-2.5">
              {convsLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse h-16 rounded-xl"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <NetworkVisualSmall className="w-20 h-20 mb-3" />
                  <h4 className="font-display font-semibold text-sm mb-1" style={{ color: "var(--color-text)" }}>
                    No conversations yet
                  </h4>
                  <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>
                    {user?.role === "admin"
                      ? "Start a chat with any referrer from your network."
                      : "Directly message Admin support for questions or guidance."}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>{user?.role === "admin" ? "Message Referrer" : "Message Admin"}</span>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv, i) => (
                    <motion.div
                      key={conv.userId || i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <ConversationItem
                        conv={conv}
                        isActive={activeConv?.userId === conv.userId}
                        onClick={() => handleSelectConv(conv)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Active Chat Window ─────────────────────────────────── */}
          <div
            className={`${
              showChat ? "flex" : "hidden md:flex"
            } flex-col flex-1 overflow-hidden`}
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <AnimatePresence mode="wait">
              {activeConv ? (
                <motion.div
                  key={activeConv.userId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col h-full"
                >
                  <ChatWindow
                    convUser={activeConv}
                    myId={user?._id}
                    socket={socketRef.current}
                    isConnected={isConnected}
                    onBack={() => setShowChat(false)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center"
                >
                  <NetworkVisualSmall className="w-32 h-32" />
                  <h3 className="font-display font-semibold text-lg" style={{ color: "var(--color-text)" }}>
                    Live Direct Messaging
                  </h3>
                  <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    Select an ongoing conversation or start a new message to chat in real time.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    <span>{user?.role === "admin" ? "Start New Chat" : "Contact Admin"}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectUser={handleStartNewChat}
        currentUserRole={user?.role}
      />
    </Layout>
  );
};

export default Messages;
