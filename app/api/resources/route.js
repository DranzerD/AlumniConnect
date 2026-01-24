import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

// GET - Fetch resources
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
    const category = searchParams.get("category");
    const type = searchParams.get("type"); // document, video, link, template, course
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE r.status = 'published'";
    const params = [];
    let paramCount = 0;

    if (category && category !== "all") {
      paramCount++;
      whereClause += ` AND r.category = $${paramCount}`;
      params.push(category);
    }

    if (type) {
      paramCount++;
      whereClause += ` AND r.type = $${paramCount}`;
      params.push(type);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (r.title ILIKE $${paramCount} OR r.description ILIKE $${paramCount} OR r.tags::text ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM resources r ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    // Get resources
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const result = await query(
      `SELECT 
        r.id,
        r.title,
        r.description,
        r.type,
        r.category,
        r.url,
        r.thumbnail,
        r.tags,
        r.download_count,
        r.view_count,
        r.is_featured,
        r.created_at,
        u.id as author_id,
        u.name as author_name,
        u.avatar as author_avatar,
        (SELECT COUNT(*) FROM resource_bookmarks WHERE resource_id = r.id) as bookmark_count,
        EXISTS(SELECT 1 FROM resource_bookmarks WHERE resource_id = r.id AND user_id = $${paramCount + 1}) as is_bookmarked
      FROM resources r
      LEFT JOIN users u ON r.author_id = u.id
      ${whereClause}
      ORDER BY r.is_featured DESC, r.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}`,
      [...params, limit, offset, decoded.id],
    );

    // Get categories with counts
    const categoriesResult = await query(`
      SELECT category, COUNT(*) as count
      FROM resources
      WHERE status = 'published'
      GROUP BY category
      ORDER BY count DESC
    `);

    return NextResponse.json({
      resources: result.rows,
      categories: categoriesResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 },
    );
  }
}

// POST - Submit resource or bookmark
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

    const body = await request.json();
    const { action, resourceId } = body;

    // Bookmark/unbookmark
    if (action === "bookmark" && resourceId) {
      const existingBookmark = await query(
        "SELECT id FROM resource_bookmarks WHERE resource_id = $1 AND user_id = $2",
        [resourceId, decoded.id],
      );

      if (existingBookmark.rows.length > 0) {
        await query(
          "DELETE FROM resource_bookmarks WHERE resource_id = $1 AND user_id = $2",
          [resourceId, decoded.id],
        );
        return NextResponse.json({ bookmarked: false });
      } else {
        await query(
          "INSERT INTO resource_bookmarks (resource_id, user_id, created_at) VALUES ($1, $2, NOW())",
          [resourceId, decoded.id],
        );
        return NextResponse.json({ bookmarked: true });
      }
    }

    // Track download
    if (action === "download" && resourceId) {
      await query(
        "UPDATE resources SET download_count = download_count + 1 WHERE id = $1",
        [resourceId],
      );
      return NextResponse.json({ success: true });
    }

    // Track view
    if (action === "view" && resourceId) {
      await query(
        "UPDATE resources SET view_count = view_count + 1 WHERE id = $1",
        [resourceId],
      );
      return NextResponse.json({ success: true });
    }

    // Submit new resource
    const { title, description, type, category, url, thumbnail, tags } = body;

    if (!title || !type || !category || !url) {
      return NextResponse.json(
        { error: "Title, type, category, and URL are required" },
        { status: 400 },
      );
    }

    const result = await query(
      `INSERT INTO resources (title, description, type, category, url, thumbnail, tags, author_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())
       RETURNING id, title, status`,
      [
        title,
        description,
        type,
        category,
        url,
        thumbnail,
        tags || [],
        decoded.id,
      ],
    );

    return NextResponse.json({
      message: "Resource submitted for review",
      resource: result.rows[0],
    });
  } catch (error) {
    console.error("Error processing resource:", error);
    return NextResponse.json(
      { error: "Failed to process resource" },
      { status: 500 },
    );
  }
}
