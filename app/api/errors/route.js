import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

// POST - Log an error
export async function POST(request) {
  try {
    const errorData = await request.json();
    const session = await getSession();

    const logEntry = {
      ...errorData,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      ip: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    };

    await storeErrorLog(logEntry);

    // If critical error, notify admins
    if (errorData.severity === "critical") {
      await notifyAdmins(logEntry);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging failed:", error);
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 });
  }
}

// GET - Retrieve error logs (admin only)
export async function GET(request) {
  try {
    const session = await getSession();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const severity = searchParams.get("severity");
    const resolved = searchParams.get("resolved");

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        el.*,
        u.name as user_name
      FROM error_logs el
      LEFT JOIN users u ON el.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (severity) {
      query += ` AND el.severity = $${paramIndex++}`;
      params.push(severity);
    }

    if (resolved !== null) {
      query += ` AND el.resolved = $${paramIndex++}`;
      params.push(resolved === "true");
    }

    query += ` ORDER BY el.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM error_logs WHERE 1=1";
    const countParams = [];

    if (severity) {
      countQuery += ` AND severity = $1`;
      countParams.push(severity);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      errors: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch error logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch error logs" },
      { status: 500 },
    );
  }
}

// PATCH - Update error log (resolve/unresolve)
export async function PATCH(request) {
  try {
    const session = await getSession();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, resolved, notes } = await request.json();

    await db.query(
      `
      UPDATE error_logs
      SET 
        resolved = $1,
        resolved_by = $2,
        resolved_at = $3,
        notes = COALESCE($4, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `,
      [
        resolved,
        resolved ? session.user.id : null,
        resolved ? new Date() : null,
        notes,
        id,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update error log:", error);
    return NextResponse.json(
      { error: "Failed to update error log" },
      { status: 500 },
    );
  }
}

// Store error log in database
async function storeErrorLog(errorData) {
  // Ensure table exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS error_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      severity VARCHAR(20) DEFAULT 'error',
      message TEXT NOT NULL,
      stack TEXT,
      url TEXT,
      component TEXT,
      context JSONB,
      user_agent TEXT,
      ip_address VARCHAR(45),
      resolved BOOLEAN DEFAULT FALSE,
      resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      resolved_at TIMESTAMP WITH TIME ZONE,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(
    `
    INSERT INTO error_logs (
      user_id, severity, message, stack, url, 
      component, context, user_agent, ip_address
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `,
    [
      errorData.userId,
      errorData.severity || "error",
      errorData.message,
      errorData.stack,
      errorData.url,
      errorData.component,
      JSON.stringify(errorData.context || {}),
      errorData.userAgent,
      errorData.ip,
    ],
  );
}

// Notify admins of critical errors
async function notifyAdmins(errorData) {
  try {
    // Get admin users
    const admins = await db.query(`
      SELECT id, email FROM users WHERE role = 'admin'
    `);

    // Create notifications for each admin
    for (const admin of admins.rows) {
      await db.query(
        `
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES ($1, 'system_alert', 'Critical Error Reported', $2, $3)
      `,
        [
          admin.id,
          `A critical error occurred: ${errorData.message.substring(0, 100)}...`,
          JSON.stringify({
            errorUrl: errorData.url,
            component: errorData.component,
            timestamp: errorData.timestamp,
          }),
        ],
      );
    }
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}
