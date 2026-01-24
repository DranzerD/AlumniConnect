"use server";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

// GET single event with details
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;

    const event = await db.get(
      `
      SELECT 
        e.*,
        u.name as organizer_name,
        u.email as organizer_email,
        p.company as organizer_company,
        p.avatar as organizer_avatar
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE e.id = ?
    `,
      [eventId],
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get attendees
    const attendees = await db.all(
      `
      SELECT 
        u.id, u.name, u.email,
        p.avatar, p.title, p.company,
        ea.registered_at, ea.status
      FROM event_attendees ea
      JOIN users u ON ea.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE ea.event_id = ?
      ORDER BY ea.registered_at DESC
    `,
      [eventId],
    );

    // Check if current user is registered
    const isRegistered = attendees.some((a) => a.id === session.userId);

    return NextResponse.json({
      event: {
        ...event,
        attendees,
        attendee_count: attendees.length,
        is_registered: isRegistered,
        is_organizer: event.organizer_id === session.userId,
      },
    });
  } catch (error) {
    console.error("Event fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 },
    );
  }
}

// PUT update event
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;
    const body = await request.json();

    // Check if user is the organizer or admin
    const event = await db.get("SELECT organizer_id FROM events WHERE id = ?", [
      eventId,
    ]);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizer_id !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
      status,
    } = body;

    await db.run(
      `
      UPDATE events SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        event_date = COALESCE(?, event_date),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        location = COALESCE(?, location),
        virtual_link = COALESCE(?, virtual_link),
        max_attendees = COALESCE(?, max_attendees),
        registration_deadline = COALESCE(?, registration_deadline),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = ?
    `,
      [
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
        status,
        eventId,
      ],
    );

    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Event update error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

// DELETE event
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;

    // Check if user is the organizer or admin
    const event = await db.get("SELECT organizer_id FROM events WHERE id = ?", [
      eventId,
    ]);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizer_id !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete attendees first
    await db.run("DELETE FROM event_attendees WHERE event_id = ?", [eventId]);

    // Delete event
    await db.run("DELETE FROM events WHERE id = ?", [eventId]);

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Event delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
