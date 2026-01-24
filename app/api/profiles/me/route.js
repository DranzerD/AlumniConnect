import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";

const DEMO_PROFILE = {
  full_name: "Demo User",
  graduation_year: 2022,
  degree: "Bachelor of Science",
  department: "Computer Science",
  current_company: "Tech Corp",
  current_role: "Software Developer",
  location: "San Francisco, CA",
  linkedin_url: "",
  github_url: "",
  bio: "Passionate developer building great products.",
  profile_visibility: true,
  email: "demo@example.com",
  role: "student",
};

export async function GET() {
  const DEMO_MODE = process.env.DEMO_MODE === "true";

  if (DEMO_MODE) {
    return NextResponse.json({ profile: DEMO_PROFILE });
  }

  try {
    const session = await requireAuth();

    const result = await query(
      `SELECT 
        p.*,
        u.email,
        u.role
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.id = $1`,
      [session.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: result.rows[0] });
  } catch (error) {
    console.error("Get my profile error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const DEMO_MODE = process.env.DEMO_MODE === "true";

  if (DEMO_MODE) {
    return NextResponse.json({ success: true, message: "Profile updated!" });
  }

  try {
    const session = await requireAuth();
    const data = await request.json();

    const {
      full_name,
      graduation_year,
      degree,
      department,
      current_company,
      current_role,
      location,
      linkedin_url,
      github_url,
      bio,
      profile_visibility,
    } = data;

    // Check if profile exists
    const existingProfile = await query(
      "SELECT user_id FROM profiles WHERE user_id = $1",
      [session.userId]
    );

    if (existingProfile.rows.length === 0) {
      // Create new profile
      await query(
        `INSERT INTO profiles (
          user_id, full_name, graduation_year, degree, department,
          current_company, current_role, location, linkedin_url,
          github_url, bio, profile_visibility
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          session.userId,
          full_name,
          graduation_year,
          degree,
          department,
          current_company,
          current_role,
          location,
          linkedin_url,
          github_url,
          bio,
          profile_visibility ?? true,
        ]
      );
    } else {
      // Update existing profile
      await query(
        `UPDATE profiles SET
          full_name = $1,
          graduation_year = $2,
          degree = $3,
          department = $4,
          current_company = $5,
          current_role = $6,
          location = $7,
          linkedin_url = $8,
          github_url = $9,
          bio = $10,
          profile_visibility = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $12`,
        [
          full_name,
          graduation_year,
          degree,
          department,
          current_company,
          current_role,
          location,
          linkedin_url,
          github_url,
          bio,
          profile_visibility ?? true,
          session.userId,
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
