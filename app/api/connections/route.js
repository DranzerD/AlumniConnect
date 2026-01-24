import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { cookies } from "next/headers";

// GET /api/connections - Get user connections
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
    const status = searchParams.get("status") || "accepted";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    let statusFilter = "";
    if (status === "pending") {
      statusFilter = "AND c.status = 'pending' AND c.receiver_id = $1";
    } else if (status === "sent") {
      statusFilter = "AND c.status = 'pending' AND c.sender_id = $1";
    } else if (status === "accepted") {
      statusFilter = "AND c.status = 'accepted'";
    }

    // Get connections
    const connectionsResult = await query(
      `SELECT 
        c.id,
        c.status,
        c.created_at,
        c.updated_at,
        CASE 
          WHEN c.sender_id = $1 THEN c.receiver_id 
          ELSE c.sender_id 
        END as connection_user_id,
        u.name,
        u.email,
        u.avatar,
        u.role,
        u.graduation_year,
        u.company,
        u.position,
        u.location
      FROM user_connections c
      JOIN users u ON (
        CASE 
          WHEN c.sender_id = $1 THEN c.receiver_id 
          ELSE c.sender_id 
        END = u.id
      )
      WHERE (c.sender_id = $1 OR c.receiver_id = $1)
        ${statusFilter}
      ORDER BY c.updated_at DESC
      LIMIT $2 OFFSET $3`,
      [decoded.userId, limit, offset],
    );

    // Get total count
    const totalResult = await query(
      `SELECT COUNT(*) as count
       FROM user_connections c
       WHERE (c.sender_id = $1 OR c.receiver_id = $1)
         ${statusFilter}`,
      [decoded.userId],
    );

    const connections = connectionsResult.rows.map((c) => ({
      id: c.id,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      user: {
        id: c.connection_user_id,
        name: c.name,
        email: c.email,
        avatar: c.avatar,
        role: c.role,
        graduationYear: c.graduation_year,
        company: c.company,
        position: c.position,
        location: c.location,
      },
    }));

    return NextResponse.json({
      connections,
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
    console.error("Get connections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 },
    );
  }
}

// POST /api/connections - Send connection request
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

    const { receiverId, message } = await request.json();

    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 },
      );
    }

    if (receiverId === decoded.userId) {
      return NextResponse.json(
        { error: "Cannot connect with yourself" },
        { status: 400 },
      );
    }

    // Check if connection already exists
    const existingResult = await query(
      `SELECT * FROM user_connections 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)`,
      [decoded.userId, receiverId],
    );

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      if (existing.status === "accepted") {
        return NextResponse.json(
          { error: "Already connected" },
          { status: 400 },
        );
      } else if (existing.status === "pending") {
        return NextResponse.json(
          { error: "Connection request already pending" },
          { status: 400 },
        );
      }
    }

    // Create connection request
    const result = await query(
      `INSERT INTO user_connections (sender_id, receiver_id, message, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [decoded.userId, receiverId, message || null],
    );

    // Get sender info for notification
    const senderResult = await query(`SELECT name FROM users WHERE id = $1`, [
      decoded.userId,
    ]);

    // Create notification for receiver
    await query(
      `INSERT INTO notifications (user_id, sender_id, type, title, message, link)
       VALUES ($1, $2, 'connection_request', 'New Connection Request', $3, '/dashboard/connections')`,
      [
        receiverId,
        decoded.userId,
        `${senderResult.rows[0]?.name || "Someone"} wants to connect with you`,
      ],
    );

    return NextResponse.json({
      message: "Connection request sent",
      connection: result.rows[0],
    });
  } catch (error) {
    console.error("Create connection error:", error);
    return NextResponse.json(
      { error: "Failed to send connection request" },
      { status: 500 },
    );
  }
}

// PUT /api/connections - Accept/reject connection
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

    const { connectionId, action } = await request.json();

    if (!connectionId || !action) {
      return NextResponse.json(
        { error: "Connection ID and action are required" },
        { status: 400 },
      );
    }

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'reject'" },
        { status: 400 },
      );
    }

    // Verify the user is the receiver
    const connectionResult = await query(
      `SELECT * FROM user_connections WHERE id = $1 AND receiver_id = $2 AND status = 'pending'`,
      [connectionId, decoded.userId],
    );

    if (connectionResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Connection request not found" },
        { status: 404 },
      );
    }

    const connection = connectionResult.rows[0];

    if (action === "accept") {
      await query(
        `UPDATE user_connections SET status = 'accepted', updated_at = NOW() WHERE id = $1`,
        [connectionId],
      );

      // Get receiver info for notification
      const receiverResult = await query(
        `SELECT name FROM users WHERE id = $1`,
        [decoded.userId],
      );

      // Notify sender
      await query(
        `INSERT INTO notifications (user_id, sender_id, type, title, message, link)
         VALUES ($1, $2, 'connection_accepted', 'Connection Accepted', $3, '/dashboard/connections')`,
        [
          connection.sender_id,
          decoded.userId,
          `${receiverResult.rows[0]?.name || "Someone"} accepted your connection request`,
        ],
      );

      return NextResponse.json({ message: "Connection accepted" });
    } else {
      await query(`DELETE FROM user_connections WHERE id = $1`, [connectionId]);

      return NextResponse.json({ message: "Connection rejected" });
    }
  } catch (error) {
    console.error("Update connection error:", error);
    return NextResponse.json(
      { error: "Failed to update connection" },
      { status: 500 },
    );
  }
}

// DELETE /api/connections - Remove connection
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
    const connectionId = searchParams.get("id");

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 },
      );
    }

    // Verify the user is part of the connection
    const result = await query(
      `DELETE FROM user_connections 
       WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)
       RETURNING *`,
      [connectionId, decoded.userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Connection removed" });
  } catch (error) {
    console.error("Delete connection error:", error);
    return NextResponse.json(
      { error: "Failed to remove connection" },
      { status: 500 },
    );
  }
}
