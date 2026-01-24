"use server";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

// GET conversations or messages
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation");

    if (conversationId) {
      // Get messages for specific conversation
      const messages = await db.all(
        `
        SELECT 
          m.*,
          u.name as sender_name,
          p.avatar as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
      `,
        [conversationId],
      );

      // Mark messages as read
      await db.run(
        `
        UPDATE messages 
        SET read_at = datetime('now')
        WHERE conversation_id = ? AND recipient_id = ? AND read_at IS NULL
      `,
        [conversationId, session.userId],
      );

      return NextResponse.json({ messages });
    }

    // Get all conversations
    const conversations = await db.all(
      `
      SELECT 
        c.*,
        CASE 
          WHEN c.user1_id = ? THEN u2.name 
          ELSE u1.name 
        END as other_user_name,
        CASE 
          WHEN c.user1_id = ? THEN p2.avatar 
          ELSE p1.avatar 
        END as other_user_avatar,
        CASE 
          WHEN c.user1_id = ? THEN p2.title 
          ELSE p1.title 
        END as other_user_title,
        CASE 
          WHEN c.user1_id = ? THEN p2.company 
          ELSE p1.company 
        END as other_user_company,
        CASE 
          WHEN c.user1_id = ? THEN u2.id 
          ELSE u1.id 
        END as other_user_id,
        (
          SELECT content FROM messages 
          WHERE conversation_id = c.id 
          ORDER BY created_at DESC LIMIT 1
        ) as last_message,
        (
          SELECT created_at FROM messages 
          WHERE conversation_id = c.id 
          ORDER BY created_at DESC LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) FROM messages 
          WHERE conversation_id = c.id 
          AND recipient_id = ? 
          AND read_at IS NULL
        ) as unread_count
      FROM conversations c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN profiles p1 ON u1.id = p1.user_id
      LEFT JOIN profiles p2 ON u2.id = p2.user_id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY last_message_time DESC
    `,
      [
        session.userId,
        session.userId,
        session.userId,
        session.userId,
        session.userId,
        session.userId,
        session.userId,
        session.userId,
      ],
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

// POST send a new message
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipient_id, content, conversation_id } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    let convId = conversation_id;

    // If no conversation exists, create one
    if (!convId && recipient_id) {
      // Check if recipient exists
      const recipient = await db.get("SELECT id FROM users WHERE id = ?", [
        recipient_id,
      ]);

      if (!recipient) {
        return NextResponse.json(
          { error: "Recipient not found" },
          { status: 404 },
        );
      }

      // Check for existing conversation
      const existing = await db.get(
        `
        SELECT id FROM conversations 
        WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
      `,
        [session.userId, recipient_id, recipient_id, session.userId],
      );

      if (existing) {
        convId = existing.id;
      } else {
        // Create new conversation
        const result = await db.run(
          `
          INSERT INTO conversations (user1_id, user2_id, created_at)
          VALUES (?, ?, datetime('now'))
        `,
          [session.userId, recipient_id],
        );
        convId = result.lastID;
      }
    }

    if (!convId) {
      return NextResponse.json(
        { error: "Conversation ID or recipient ID is required" },
        { status: 400 },
      );
    }

    // Verify user is part of conversation
    const conv = await db.get(
      `SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)`,
      [convId, session.userId, session.userId],
    );

    if (!conv) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Determine recipient
    const recipientId =
      conv.user1_id === session.userId ? conv.user2_id : conv.user1_id;

    // Insert message
    const result = await db.run(
      `
      INSERT INTO messages (conversation_id, sender_id, recipient_id, content, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `,
      [convId, session.userId, recipientId, content.trim()],
    );

    return NextResponse.json({
      message: {
        id: result.lastID,
        conversation_id: convId,
        sender_id: session.userId,
        recipient_id: recipientId,
        content: content.trim(),
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
