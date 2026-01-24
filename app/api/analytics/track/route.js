import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

// POST - Track analytics event
export async function POST(request) {
  try {
    const event = await request.json();
    const session = await getSession();

    // Add user info if available
    const enrichedEvent = {
      ...event,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      receivedAt: new Date().toISOString(),
    };

    // Store event in database
    await storeAnalyticsEvent(enrichedEvent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // Don't fail the request for analytics errors
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

// GET - Get analytics data (admin only)
export async function GET(request) {
  try {
    const session = await getSession();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d";
    const metric = searchParams.get("metric") || "all";

    const analytics = await getAnalyticsData(period, metric);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}

// Store analytics event
async function storeAnalyticsEvent(event) {
  try {
    // Check if analytics_events table exists, create if not
    await db.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(50),
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(50) NOT NULL,
        event_name VARCHAR(100),
        page VARCHAR(255),
        properties JSONB,
        user_agent TEXT,
        ip_address VARCHAR(45),
        referrer TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(
      `
      INSERT INTO analytics_events (
        session_id, user_id, event_type, event_name, page, 
        properties, user_agent, ip_address, referrer
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        event.sessionId,
        event.userId,
        event.type,
        event.name || null,
        event.page || null,
        JSON.stringify(event.properties || {}),
        event.userAgent,
        event.ip,
        event.referrer,
      ],
    );
  } catch (error) {
    console.error("Failed to store analytics event:", error);
    // Don't throw - analytics should fail silently
  }
}

// Get analytics data
async function getAnalyticsData(period, metric) {
  const periodDays = {
    "1d": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };

  const days = periodDays[period] || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const analytics = {};

  // Page views
  if (metric === "all" || metric === "pageViews") {
    const pageViews = await db.query(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at >= $1
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `,
      [startDate],
    );

    analytics.pageViews = pageViews.rows;
  }

  // Top pages
  if (metric === "all" || metric === "topPages") {
    const topPages = await db.query(
      `
      SELECT 
        page,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at >= $1
        AND page IS NOT NULL
      GROUP BY page
      ORDER BY views DESC
      LIMIT 10
    `,
      [startDate],
    );

    analytics.topPages = topPages.rows;
  }

  // User activity
  if (metric === "all" || metric === "userActivity") {
    const userActivity = await db.query(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as active_users
      FROM analytics_events
      WHERE user_id IS NOT NULL
        AND created_at >= $1
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `,
      [startDate],
    );

    analytics.userActivity = userActivity.rows;
  }

  // Events breakdown
  if (metric === "all" || metric === "events") {
    const events = await db.query(
      `
      SELECT 
        event_type,
        event_name,
        COUNT(*) as count
      FROM analytics_events
      WHERE created_at >= $1
      GROUP BY event_type, event_name
      ORDER BY count DESC
      LIMIT 20
    `,
      [startDate],
    );

    analytics.events = events.rows;
  }

  // Summary stats
  if (metric === "all") {
    const summary = await db.query(
      `
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
        COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views
      FROM analytics_events
      WHERE created_at >= $1
    `,
      [startDate],
    );

    analytics.summary = summary.rows[0];
  }

  return analytics;
}
