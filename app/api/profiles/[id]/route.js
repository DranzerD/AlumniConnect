import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const session = await requireAuth();
    const profileId = params.id;

    const result = await query(
      `SELECT 
        p.*,
        u.email,
        u.role
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1 
        AND u.college_id = $2
        AND u.is_active = true`,
      [profileId, session.collegeId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: result.rows[0] });
  } catch (error) {
    console.error("Get profile error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
