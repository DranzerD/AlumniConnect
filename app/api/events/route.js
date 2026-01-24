"use server";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

// GET all events with filtering and pagination
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (type) {
      whereClause += " AND type = ?";
      params.push(type);
    }

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    if (search) {
      whereClause += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM events ${whereClause}`;
    const countResult = await db.get(countQuery, params);
    const total = countResult?.total || 0;

    // Get events with pagination
    const eventsQuery = `
      SELECT 
        e.*,
        u.name as organizer_name,
        u.email as organizer_email,
        (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) as attendee_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      ${whereClause}
      ORDER BY e.event_date ASC
      LIMIT ? OFFSET ?
    `;

    const events = await db.all(eventsQuery, [...params, limit, offset]);

    return NextResponse.json({
      events: events || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Events fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// POST create new event
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      event_date,
      start_time,
      end_time,
      location,
      virtual_link,
      max_attendees,
      registration_deadline,
      image_url,
    } = body;

    // Validation
    if (!title || !description || !type || !event_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const insertQuery = `
      INSERT INTO events (
        title, description, type, event_date, start_time, end_time,
        location, virtual_link, max_attendees, registration_deadline,
        image_url, organizer_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', datetime('now'))
    `;

    const result = await db.run(insertQuery, [
      title,
      description,
      type,
      event_date,
      start_time,
      end_time,
      location,
      virtual_link,
      max_attendees,
      registration_deadline,
      image_url,
      session.userId,
    ]);

    return NextResponse.json({
      message: "Event created successfully",
      eventId: result.lastID,
    });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
