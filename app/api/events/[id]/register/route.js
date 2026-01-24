"use server";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

// POST register for event
export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;

    // Check if event exists and has capacity
    const event = await db.get(
      `
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id AND status = 'confirmed') as current_attendees
      FROM events e
      WHERE e.id = ?
    `,
      [eventId],
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status === "cancelled") {
      return NextResponse.json(
        { error: "This event has been cancelled" },
        { status: 400 },
      );
    }

    if (event.status === "completed") {
      return NextResponse.json(
        { error: "This event has already ended" },
        { status: 400 },
      );
    }

    // Check registration deadline
    if (
      event.registration_deadline &&
      new Date(event.registration_deadline) < new Date()
    ) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 },
      );
    }

    // Check capacity
    if (event.max_attendees && event.current_attendees >= event.max_attendees) {
      return NextResponse.json(
        { error: "Event is at full capacity" },
        { status: 400 },
      );
    }

    // Check if already registered
    const existing = await db.get(
      "SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?",
      [eventId, session.userId],
    );

    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 400 },
      );
    }

    // Register user
    await db.run(
      `
      INSERT INTO event_attendees (event_id, user_id, status, registered_at)
      VALUES (?, ?, 'confirmed', datetime('now'))
    `,
      [eventId, session.userId],
    );

    return NextResponse.json({
      message: "Successfully registered for event",
      status: "confirmed",
    });
  } catch (error) {
    console.error("Event registration error:", error);
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 },
    );
  }
}

// DELETE unregister from event
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;

    // Check if registered
    const existing = await db.get(
      "SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?",
      [eventId, session.userId],
    );

    if (!existing) {
      return NextResponse.json(
        { error: "You are not registered for this event" },
        { status: 400 },
      );
    }

    // Unregister
    await db.run(
      "DELETE FROM event_attendees WHERE event_id = ? AND user_id = ?",
      [eventId, session.userId],
    );

    return NextResponse.json({
      message: "Successfully unregistered from event",
    });
  } catch (error) {
    console.error("Event unregistration error:", error);
    return NextResponse.json(
      { error: "Failed to unregister from event" },
      { status: 500 },
    );
  }
}
