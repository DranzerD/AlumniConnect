"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useApp } from "./AppContext";

const SocketContext = createContext(null);

/**
 * WebSocket Provider for real-time features
 * Handles connection management, reconnection, and message handling
 */
export function SocketProvider({ children }) {
  const { isAuthenticated, user, addNotification } = useApp();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const listenersRef = useRef(new Map());

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (!isAuthenticated || socketRef.current?.readyState === WebSocket.OPEN)
      return;

    setConnecting(true);

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
    const ws = new WebSocket(`${wsUrl}?userId=${user?.id}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      setConnecting(false);
      reconnectAttemptsRef.current = 0;

      // Send online status
      ws.send(JSON.stringify({ type: "presence", status: "online" }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error("WebSocket message parse error:", error);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected", event.code);
      setConnected(false);
      setConnecting(false);
      socketRef.current = null;

      // Reconnect with exponential backoff
      if (isAuthenticated && event.code !== 1000) {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptsRef.current),
          30000,
        );
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnecting(false);
    };

    socketRef.current = ws;
  }, [isAuthenticated, user?.id]);

  // Handle incoming messages
  const handleMessage = useCallback(
    (message) => {
      switch (message.type) {
        case "notification":
          addNotification(message.payload);
          break;

        case "presence":
          if (message.status === "online") {
            setOnlineUsers((prev) => new Set([...prev, message.userId]));
          } else {
            setOnlineUsers((prev) => {
              const next = new Set(prev);
              next.delete(message.userId);
              return next;
            });
          }
          break;

        case "online-users":
          setOnlineUsers(new Set(message.users));
          break;

        default:
          // Dispatch to custom listeners
          const listeners = listenersRef.current.get(message.type);
          if (listeners) {
            listeners.forEach((callback) => callback(message.payload));
          }
      }
    },
    [addNotification],
  );

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      socketRef.current.close(1000, "User disconnect");
      socketRef.current = null;
    }

    setConnected(false);
    setOnlineUsers(new Set());
  }, []);

  // Send message through WebSocket
  const send = useCallback((type, payload) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
      return true;
    }
    console.warn("WebSocket not connected");
    return false;
  }, []);

  // Subscribe to custom message types
  const subscribe = useCallback((type, callback) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type).add(callback);

    // Return unsubscribe function
    return () => {
      listenersRef.current.get(type)?.delete(callback);
    };
  }, []);

  // Check if user is online
  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers],
  );

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  // Handle visibility change (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        isAuthenticated &&
        !connected
      ) {
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [isAuthenticated, connected, connect]);

  const value = {
    connected,
    connecting,
    onlineUsers: Array.from(onlineUsers),
    onlineCount: onlineUsers.size,
    send,
    subscribe,
    isUserOnline,
    reconnect: connect,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

// Hook for real-time chat
export function useChat(conversationId) {
  const { send, subscribe, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState([]);

  useEffect(() => {
    if (!conversationId) return;

    const unsubMessages = subscribe("chat-message", (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    const unsubTyping = subscribe(
      "chat-typing",
      ({ userId, isTyping, convId }) => {
        if (convId === conversationId) {
          setTyping((prev) => {
            if (isTyping) {
              return prev.includes(userId) ? prev : [...prev, userId];
            }
            return prev.filter((id) => id !== userId);
          });
        }
      },
    );

    return () => {
      unsubMessages();
      unsubTyping();
    };
  }, [conversationId, subscribe]);

  const sendMessage = useCallback(
    (content) => {
      return send("chat-message", { conversationId, content });
    },
    [conversationId, send],
  );

  const sendTyping = useCallback(
    (isTyping) => {
      send("chat-typing", { conversationId, isTyping });
    },
    [conversationId, send],
  );

  return {
    messages,
    typing,
    connected,
    sendMessage,
    sendTyping,
    setMessages,
  };
}

export default SocketContext;
