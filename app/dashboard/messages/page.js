"use client";

import { useState, useEffect } from "react";
import styles from "./messages.module.css";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  const sampleConversations = [
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        avatar: "SJ",
        role: "Product Manager at Google",
        online: true,
      },
      messages: [
        {
          id: 1,
          text: "Hi! I saw you're interested in product management.",
          sender: "them",
          time: "10:30 AM",
        },
        {
          id: 2,
          text: "Yes! I'm looking to transition from engineering to PM.",
          sender: "me",
          time: "10:32 AM",
        },
        {
          id: 3,
          text: "That's great! I made the same transition 3 years ago. Happy to share my experience.",
          sender: "them",
          time: "10:35 AM",
        },
        {
          id: 4,
          text: "Would love to hear about it! When would be a good time to chat?",
          sender: "me",
          time: "10:40 AM",
        },
        {
          id: 5,
          text: "How about this Friday at 4 PM? We can do a video call.",
          sender: "them",
          time: "10:42 AM",
        },
      ],
      lastMessage: "How about this Friday at 4 PM?",
      time: "10:42 AM",
      unread: 2,
    },
    {
      id: 2,
      user: {
        name: "Michael Chen",
        avatar: "MC",
        role: "Engineering Lead at Meta",
        online: false,
      },
      messages: [
        {
          id: 1,
          text: "Thanks for connecting! I noticed you graduated from the same batch.",
          sender: "them",
          time: "Yesterday",
        },
        {
          id: 2,
          text: "Yes, class of 2019! Great to connect with a fellow alumnus.",
          sender: "me",
          time: "Yesterday",
        },
        {
          id: 3,
          text: "How's your experience been at Meta?",
          sender: "me",
          time: "Yesterday",
        },
      ],
      lastMessage: "How's your experience been at Meta?",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: 3,
      user: {
        name: "Emily Watson",
        avatar: "EW",
        role: "Senior Data Scientist at Netflix",
        online: true,
      },
      messages: [
        {
          id: 1,
          text: "I'd love to learn more about your work in ML!",
          sender: "me",
          time: "2 days ago",
        },
        {
          id: 2,
          text: "Sure! We use a lot of interesting techniques for recommendations.",
          sender: "them",
          time: "2 days ago",
        },
      ],
      lastMessage: "We use a lot of interesting techniques...",
      time: "2 days ago",
      unread: 0,
    },
    {
      id: 4,
      user: {
        name: "David Park",
        avatar: "DP",
        role: "Founder at TechStart",
        online: false,
      },
      messages: [
        {
          id: 1,
          text: "Congratulations on the new job!",
          sender: "them",
          time: "1 week ago",
        },
        {
          id: 2,
          text: "Thank you so much! Your advice really helped.",
          sender: "me",
          time: "1 week ago",
        },
      ],
      lastMessage: "Thank you so much! Your advice really helped.",
      time: "1 week ago",
      unread: 0,
    },
  ];

  const suggestedContacts = [
    {
      id: 1,
      name: "Alex Rivera",
      role: "Software Engineer at Apple",
      avatar: "AR",
    },
    { id: 2, name: "Jessica Kim", role: "UX Designer at Airbnb", avatar: "JK" },
    {
      id: 3,
      name: "Ryan Miller",
      role: "Data Engineer at Spotify",
      avatar: "RM",
    },
  ];

  useEffect(() => {
    setConversations(sampleConversations);
    if (sampleConversations.length > 0) {
      setSelectedConversation(sampleConversations[0]);
    }
  }, []);

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedConversations = conversations.map((conv) =>
      conv.id === selectedConversation.id
        ? {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: message,
            time: "Just now",
          }
        : conv,
    );

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
    });
    setMessage("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Messages</h2>
          <button
            className={styles.newMessageBtn}
            onClick={() => setShowNewMessageModal(true)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <div className={styles.searchBox}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.conversationList}>
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              className={`${styles.conversationItem} ${
                selectedConversation?.id === conv.id ? styles.active : ""
              }`}
              onClick={() => setSelectedConversation(conv)}
            >
              <div className={styles.avatarWrapper}>
                <div className={styles.avatar}>{conv.user.avatar}</div>
                {conv.user.online && (
                  <span className={styles.onlineIndicator} />
                )}
              </div>
              <div className={styles.conversationInfo}>
                <div className={styles.conversationTop}>
                  <span className={styles.userName}>{conv.user.name}</span>
                  <span className={styles.time}>{conv.time}</span>
                </div>
                <div className={styles.conversationBottom}>
                  <span className={styles.lastMessage}>{conv.lastMessage}</span>
                  {conv.unread > 0 && (
                    <span className={styles.unreadBadge}>{conv.unread}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chatArea}>
        {selectedConversation ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatUserInfo}>
                <div className={styles.avatarWrapper}>
                  <div className={styles.avatar}>
                    {selectedConversation.user.avatar}
                  </div>
                  {selectedConversation.user.online && (
                    <span className={styles.onlineIndicator} />
                  )}
                </div>
                <div>
                  <h3>{selectedConversation.user.name}</h3>
                  <p className={styles.userRole}>
                    {selectedConversation.user.role}
                  </p>
                </div>
              </div>
              <div className={styles.chatActions}>
                <button className={styles.actionBtn} title="Video call">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </button>
                <button className={styles.actionBtn} title="Voice call">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </button>
                <button className={styles.actionBtn} title="More options">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.messageList}>
              {selectedConversation.messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${
                    msg.sender === "me" ? styles.sent : styles.received
                  }`}
                >
                  <div className={styles.messageBubble}>
                    <p>{msg.text}</p>
                    <span className={styles.messageTime}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form className={styles.messageInput} onSubmit={handleSendMessage}>
              <button type="button" className={styles.attachBtn}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="button" className={styles.emojiBtn}>
                😊
              </button>
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!message.trim()}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the sidebar to start messaging</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        title="New Message"
        size="small"
      >
        <div className={styles.newMessageContent}>
          <div className={styles.searchBox}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search alumni..." />
          </div>

          <div className={styles.suggestedSection}>
            <h4>Suggested</h4>
            <div className={styles.suggestedList}>
              {suggestedContacts.map((contact) => (
                <button key={contact.id} className={styles.suggestedItem}>
                  <div className={styles.avatar}>{contact.avatar}</div>
                  <div className={styles.suggestedInfo}>
                    <span className={styles.suggestedName}>{contact.name}</span>
                    <span className={styles.suggestedRole}>{contact.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
