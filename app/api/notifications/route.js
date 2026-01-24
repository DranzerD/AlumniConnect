import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { cookies } from "next/headers";

// GET /api/notifications - Get user notifications
export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const unreadOnly = searchParams.get("unread") === "true";
    const offset = (page - 1) * limit;

    let whereClause = "WHERE n.user_id = $1";
    const params = [decoded.userId];
    let paramIndex = 2;

    if (unreadOnly) {
      whereClause += ` AND n.read = false`;
    }

    // Get notifications
    const notificationsResult = await query(
      `SELECT 
        n.id,
        n.type,
        n.title,
        n.message,
        n.link,
        n.read,
        n.created_at,
        n.metadata,
        u.name as sender_name,
        u.avatar as sender_avatar
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    // Get unread count
    const unreadResult = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false`,
      [decoded.userId],
    );

    // Get total count
    const totalResult = await query(
      `SELECT COUNT(*) as count FROM notifications ${whereClause}`,
      params,
    );

    const notifications = notificationsResult.rows.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      read: n.read,
      createdAt: n.created_at,
      metadata: n.metadata,
      sender: n.sender_name
        ? { name: n.sender_name, avatar: n.sender_avatar }
        : null,
    }));

    return NextResponse.json({
      notifications,
      unreadCount: parseInt(unreadResult.rows[0]?.count || 0),
      pagination: {
        page,
        limit,
        total: parseInt(totalResult.rows[0]?.count || 0),
        totalPages: Math.ceil(
          parseInt(totalResult.rows[0]?.count || 0) / limit,
        ),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

// POST /api/notifications - Create a notification (internal use)
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { userId, type, title, message, link, metadata } =
      await request.json();

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const validTypes = [
      "connection_request",
      "connection_accepted",
      "message",
      "job_application",
      "job_posted",
      "event_invitation",
      "event_reminder",
      "mentorship_request",
      "mentorship_accepted",
      "story_like",
      "story_comment",
      "system",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid notification type" },
        { status: 400 },
      );
    }

    const result = await query(
      `INSERT INTO notifications (user_id, sender_id, type, title, message, link, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        decoded.userId,
        type,
        title,
        message,
        link || null,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );

    return NextResponse.json({
      message: "Notification created",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { ids, markAll } = await request.json();

    if (markAll) {
      // Mark all notifications as read
      await query(`UPDATE notifications SET read = true WHERE user_id = $1`, [
        decoded.userId,
      ]);
    } else if (ids && Array.isArray(ids) && ids.length > 0) {
      // Mark specific notifications as read
      const placeholders = ids.map((_, i) => `$${i + 2}`).join(", ");
      await query(
        `UPDATE notifications SET read = true WHERE user_id = $1 AND id IN (${placeholders})`,
        [decoded.userId, ...ids],
      );
    } else {
      return NextResponse.json(
        { error: "No notification IDs provided" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      await query(`DELETE FROM notifications WHERE user_id = $1`, [
        decoded.userId,
      ]);
    } else if (id) {
      await query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [
        id,
        decoded.userId,
      ]);
    } else {
      return NextResponse.json(
        { error: "No notification ID provided" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Notification(s) deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 },
    );
  }
}
