"use server";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// GET /api/mentorship/[id] - Get mentor details
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT 
        m.*,
        u.name,
        u.email,
        p.company,
        p.job_title,
        p.photo,
        p.linkedin,
        p.bio as profile_bio,
        p.graduation_year,
        (SELECT COUNT(*) FROM mentorship_requests WHERE mentor_id = m.id AND status = 'accepted') as active_mentees,
        (SELECT COUNT(*) FROM mentorship_requests WHERE mentor_id = m.id AND status = 'completed') as completed_sessions,
        (SELECT AVG(rating) FROM mentorship_reviews WHERE mentor_id = m.id) as avg_rating,
        (SELECT COUNT(*) FROM mentorship_reviews WHERE mentor_id = m.id) as review_count
       FROM mentors m
       JOIN users u ON m.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE m.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    // Get reviews
    const reviews = await query(
      `SELECT 
        mr.*,
        u.name as reviewer_name,
        p.photo as reviewer_photo
       FROM mentorship_reviews mr
       JOIN users u ON mr.mentee_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE mr.mentor_id = $1
       ORDER BY mr.created_at DESC
       LIMIT 10`,
      [id],
    );

    return NextResponse.json({
      mentor: result.rows[0],
      reviews: reviews.rows,
    });
  } catch (error) {
    console.error("Error fetching mentor:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor details" },
      { status: 500 },
    );
  }
}

// POST /api/mentorship/[id] - Request mentorship
export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { message, goals, preferredSchedule } = body;

    // Check if mentor exists
    const mentor = await query(
      "SELECT * FROM mentors WHERE id = $1 AND status = $2",
      [id, "active"],
    );

    if (mentor.rows.length === 0) {
      return NextResponse.json(
        { error: "Mentor not found or not accepting requests" },
        { status: 404 },
      );
    }

    // Check if user is requesting themselves
    if (mentor.rows[0].user_id === user.id) {
      return NextResponse.json(
        { error: "Cannot request mentorship from yourself" },
        { status: 400 },
      );
    }

    // Check for existing pending request
    const existing = await query(
      `SELECT id FROM mentorship_requests 
       WHERE mentor_id = $1 AND mentee_id = $2 AND status IN ('pending', 'accepted')`,
      [id, user.id],
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "You already have a pending or active mentorship with this mentor",
        },
        { status: 400 },
      );
    }

    // Check if mentor has capacity
    const currentMentees = await query(
      `SELECT COUNT(*) as count FROM mentorship_requests 
       WHERE mentor_id = $1 AND status = 'accepted'`,
      [id],
    );

    if (parseInt(currentMentees.rows[0].count) >= mentor.rows[0].max_mentees) {
      return NextResponse.json(
        { error: "This mentor is currently at full capacity" },
        { status: 400 },
      );
    }

    // Create request
    const result = await query(
      `INSERT INTO mentorship_requests (
        mentor_id, mentee_id, message, goals, preferred_schedule
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [id, user.id, message, goals, preferredSchedule],
    );

    // Create notification for mentor
    await query(
      `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        mentor.rows[0].user_id,
        "mentorship_request",
        "New Mentorship Request",
        `${user.name} has requested mentorship`,
        result.rows[0].id,
        "mentorship_request",
      ],
    );

    return NextResponse.json(
      {
        message: "Mentorship request sent successfully",
        request: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error requesting mentorship:", error);
    return NextResponse.json(
      { error: "Failed to send mentorship request" },
      { status: 500 },
    );
  }
}

// PUT /api/mentorship/[id] - Update mentorship request status (for mentors)
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, feedback } = body; // action: accept, reject, complete

    // Get the request
    const mentorshipRequest = await query(
      `SELECT mr.*, m.user_id as mentor_user_id
       FROM mentorship_requests mr
       JOIN mentors m ON mr.mentor_id = m.id
       WHERE mr.id = $1`,
      [id],
    );

    if (mentorshipRequest.rows.length === 0) {
      return NextResponse.json(
        { error: "Mentorship request not found" },
        { status: 404 },
      );
    }

    const req = mentorshipRequest.rows[0];

    // Verify user is the mentor
    if (req.mentor_user_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this request" },
        { status: 403 },
      );
    }

    let newStatus;
    let notificationTitle;
    let notificationMessage;

    switch (action) {
      case "accept":
        newStatus = "accepted";
        notificationTitle = "Mentorship Request Accepted";
        notificationMessage = `${user.name} has accepted your mentorship request`;
        break;
      case "reject":
        newStatus = "rejected";
        notificationTitle = "Mentorship Request Declined";
        notificationMessage = `${user.name} has declined your mentorship request`;
        break;
      case "complete":
        newStatus = "completed";
        notificationTitle = "Mentorship Completed";
        notificationMessage = `Your mentorship with ${user.name} has been marked as completed`;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update request
    await query(
      `UPDATE mentorship_requests 
       SET status = $1, feedback = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [newStatus, feedback, id],
    );

    // Notify mentee
    await query(
      `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.mentee_id,
        `mentorship_${action}`,
        notificationTitle,
        notificationMessage,
        id,
        "mentorship_request",
      ],
    );

    return NextResponse.json({
      message: `Mentorship request ${action}ed successfully`,
    });
  } catch (error) {
    console.error("Error updating mentorship request:", error);
    return NextResponse.json(
      { error: "Failed to update mentorship request" },
      { status: 500 },
    );
  }
}
