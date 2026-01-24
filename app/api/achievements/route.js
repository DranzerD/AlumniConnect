import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

// GET - Fetch achievements/spotlights
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // achievement, spotlight, award, promotion
    const featured = searchParams.get("featured") === "true";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE a.status = 'approved'";
    const params = [];
    let paramCount = 0;

    if (type !== "all") {
      paramCount++;
      whereClause += ` AND a.type = $${paramCount}`;
      params.push(type);
    }

    if (featured) {
      whereClause += " AND a.is_featured = true";
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM achievements a ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    // Get achievements
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const result = await query(
      `SELECT 
        a.id,
        a.type,
        a.title,
        a.description,
        a.image,
        a.achievement_date,
        a.company,
        a.is_featured,
        a.like_count,
        a.created_at,
        u.id as user_id,
        u.name as user_name,
        u.avatar as user_avatar,
        u.graduation_year,
        u.job_title,
        u.company as user_company,
        EXISTS(SELECT 1 FROM achievement_likes WHERE achievement_id = a.id AND user_id = $${paramCount + 1}) as is_liked
      FROM achievements a
      JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.is_featured DESC, a.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}`,
      [...params, limit, offset, decoded.id],
    );

    // Get featured spotlight of the month
    const spotlightResult = await query(`
      SELECT 
        a.*,
        u.name as user_name,
        u.avatar as user_avatar,
        u.graduation_year,
        u.job_title,
        u.company as user_company,
        u.bio
      FROM achievements a
      JOIN users u ON a.user_id = u.id
      WHERE a.type = 'spotlight' AND a.is_featured = true AND a.status = 'approved'
      ORDER BY a.created_at DESC
      LIMIT 1
    `);

    return NextResponse.json({
      achievements: result.rows,
      spotlight: spotlightResult.rows[0] || null,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 },
    );
  }
}

// POST - Submit achievement
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const {
      action,
      achievementId,
      type,
      title,
      description,
      image,
      achievementDate,
      company,
    } = await request.json();

    // Like/unlike achievement
    if (action === "like" && achievementId) {
      const existingLike = await query(
        "SELECT id FROM achievement_likes WHERE achievement_id = $1 AND user_id = $2",
        [achievementId, decoded.id],
      );

      if (existingLike.rows.length > 0) {
        await query(
          "DELETE FROM achievement_likes WHERE achievement_id = $1 AND user_id = $2",
          [achievementId, decoded.id],
        );
        await query(
          "UPDATE achievements SET like_count = like_count - 1 WHERE id = $1",
          [achievementId],
        );
        return NextResponse.json({ liked: false });
      } else {
        await query(
          "INSERT INTO achievement_likes (achievement_id, user_id, created_at) VALUES ($1, $2, NOW())",
          [achievementId, decoded.id],
        );
        await query(
          "UPDATE achievements SET like_count = like_count + 1 WHERE id = $1",
          [achievementId],
        );
        return NextResponse.json({ liked: true });
      }
    }

    // Submit new achievement
    if (!type || !title || !description) {
      return NextResponse.json(
        { error: "Type, title, and description are required" },
        { status: 400 },
      );
    }

    const result = await query(
      `INSERT INTO achievements (user_id, type, title, description, image, achievement_date, company, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
       RETURNING id, type, title, description, status`,
      [decoded.id, type, title, description, image, achievementDate, company],
    );

    return NextResponse.json({
      message: "Achievement submitted for review",
      achievement: result.rows[0],
    });
  } catch (error) {
    console.error("Error processing achievement:", error);
    return NextResponse.json(
      { error: "Failed to process achievement" },
      { status: 500 },
    );
  }
}
