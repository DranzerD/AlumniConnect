import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await requireAdmin();
    const data = await request.json();

    const { email, password, role, full_name } = data;

    if (!email || !password || !role || !full_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["student", "alumni", "faculty", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Create user
    const userResult = await query(
      `INSERT INTO users (college_id, email, password_hash, role, must_reset_password)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id`,
      [session.collegeId, email, passwordHash, role]
    );

    const userId = userResult.rows[0].id;

    // Create profile
    await query(
      `INSERT INTO profiles (user_id, full_name)
       VALUES ($1, $2)`,
      [userId, full_name]
    );

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Create user error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await requireAdmin();

    const result = await query(
      `SELECT 
        u.id,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        p.full_name
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.college_id = $1
      ORDER BY u.created_at DESC`,
      [session.collegeId]
    );

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error("Get users error:", error);
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
