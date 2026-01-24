"use server";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

// GET mentorship programs and mentors
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'mentors', 'programs', 'my-connections'
    const expertise = searchParams.get("expertise");
    const availability = searchParams.get("availability");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const offset = (page - 1) * limit;

    if (type === "mentors") {
      // Get available mentors
      let whereClause = "WHERE m.is_available = 1";
      const params = [];

      if (expertise) {
        whereClause += " AND m.expertise LIKE ?";
        params.push(`%${expertise}%`);
      }

      const mentors = await db.all(
        `
        SELECT 
          m.*,
          u.name, u.email,
          p.avatar, p.title, p.company, p.bio, p.linkedin_url,
          (SELECT COUNT(*) FROM mentorship_connections WHERE mentor_id = m.id AND status = 'active') as active_mentees,
          (SELECT AVG(rating) FROM mentorship_reviews WHERE mentor_id = m.id) as avg_rating,
          (SELECT COUNT(*) FROM mentorship_reviews WHERE mentor_id = m.id) as review_count
        FROM mentors m
        JOIN users u ON m.user_id = u.id
        LEFT JOIN profiles p ON u.id = p.user_id
        ${whereClause}
        ORDER BY avg_rating DESC NULLS LAST, active_mentees DESC
        LIMIT ? OFFSET ?
      `,
        [...params, limit, offset],
      );

      const countResult = await db.get(
        `SELECT COUNT(*) as total FROM mentors m ${whereClause}`,
        params,
      );

      return NextResponse.json({
        mentors,
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      });
    }

    if (type === "programs") {
      // Get mentorship programs
      const programs = await db.all(
        `
        SELECT 
          mp.*,
          u.name as coordinator_name,
          (SELECT COUNT(*) FROM mentorship_program_enrollments WHERE program_id = mp.id) as enrollment_count
        FROM mentorship_programs mp
        LEFT JOIN users u ON mp.coordinator_id = u.id
        WHERE mp.status = 'active'
        ORDER BY mp.start_date ASC
        LIMIT ? OFFSET ?
      `,
        [limit, offset],
      );

      return NextResponse.json({ programs });
    }

    if (type === "my-connections") {
      // Get user's mentorship connections (as mentor or mentee)
      const asMentor = await db.all(
        `
        SELECT 
          mc.*,
          u.name as mentee_name, u.email as mentee_email,
          p.avatar as mentee_avatar, p.title as mentee_title, p.company as mentee_company
        FROM mentorship_connections mc
        JOIN users u ON mc.mentee_id = u.id
        LEFT JOIN profiles p ON u.id = p.user_id
        JOIN mentors m ON mc.mentor_id = m.id
        WHERE m.user_id = ?
        ORDER BY mc.created_at DESC
      `,
        [session.userId],
      );

      const asMentee = await db.all(
        `
        SELECT 
          mc.*,
          u.name as mentor_name, u.email as mentor_email,
          p.avatar as mentor_avatar, p.title as mentor_title, p.company as mentor_company,
          m.expertise
        FROM mentorship_connections mc
        JOIN mentors m ON mc.mentor_id = m.id
        JOIN users u ON m.user_id = u.id
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE mc.mentee_id = ?
        ORDER BY mc.created_at DESC
      `,
        [session.userId],
      );

      return NextResponse.json({
        asMentor,
        asMentee,
      });
    }

    // Default: return overview
    const stats = await db.get(`
      SELECT
        (SELECT COUNT(*) FROM mentors WHERE is_available = 1) as available_mentors,
        (SELECT COUNT(*) FROM mentorship_connections WHERE status = 'active') as active_connections,
        (SELECT COUNT(*) FROM mentorship_programs WHERE status = 'active') as active_programs
    `);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Mentorship fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentorship data" },
      { status: 500 },
    );
  }
}

// POST create mentorship request
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mentor_id, message, goals, preferred_frequency } = body;

    if (!mentor_id) {
      return NextResponse.json(
        { error: "Mentor ID is required" },
        { status: 400 },
      );
    }

    // Check if mentor exists and is available
    const mentor = await db.get(
      "SELECT * FROM mentors WHERE id = ? AND is_available = 1",
      [mentor_id],
    );

    if (!mentor) {
      return NextResponse.json(
        { error: "Mentor not found or unavailable" },
        { status: 404 },
      );
    }

    // Check if user is not the mentor
    if (mentor.user_id === session.userId) {
      return NextResponse.json(
        { error: "You cannot request mentorship from yourself" },
        { status: 400 },
      );
    }

    // Check for existing pending/active connection
    const existing = await db.get(
      `
      SELECT * FROM mentorship_connections 
      WHERE mentor_id = ? AND mentee_id = ? AND status IN ('pending', 'active')
    `,
      [mentor_id, session.userId],
    );

    if (existing) {
      return NextResponse.json(
        {
          error:
            "You already have a pending or active connection with this mentor",
        },
        { status: 400 },
      );
    }

    // Create mentorship request
    await db.run(
      `
      INSERT INTO mentorship_connections (
        mentor_id, mentee_id, message, goals, preferred_frequency, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))
    `,
      [mentor_id, session.userId, message, goals, preferred_frequency],
    );

    return NextResponse.json({
      message: "Mentorship request sent successfully",
    });
  } catch (error) {
    console.error("Mentorship request error:", error);
    return NextResponse.json(
      { error: "Failed to send mentorship request" },
      { status: 500 },
    );
  }
}
