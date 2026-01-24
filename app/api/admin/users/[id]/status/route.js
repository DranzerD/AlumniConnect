import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { query } from "@/lib/db";

export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    const userId = params.id;
    const { is_active } = await request.json();

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "is_active must be a boolean" },
        { status: 400 }
      );
    }

    await query(
      "UPDATE users SET is_active = $1 WHERE id = $2 AND college_id = $3",
      [is_active, userId, session.collegeId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user status error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
