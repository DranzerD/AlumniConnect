import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

// GET - Fetch forums/discussions
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
    const sort = searchParams.get("sort") || "latest";
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE d.deleted_at IS NULL";
    const params = [];
    let paramCount = 0;

    if (category && category !== "all") {
      paramCount++;
      whereClause += ` AND d.category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (d.title ILIKE $${paramCount} OR d.content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    let orderBy = "d.created_at DESC";
    if (sort === "popular") {
      orderBy = "d.reply_count DESC, d.view_count DESC";
    } else if (sort === "unanswered") {
      orderBy = "d.reply_count ASC, d.created_at DESC";
      whereClause += " AND d.reply_count = 0";
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM discussions d ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    // Get discussions
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const result = await query(
      `SELECT 
        d.id,
        d.title,
        d.content,
        d.category,
        d.tags,
        d.view_count,
        d.reply_count,
        d.is_pinned,
        d.is_solved,
        d.created_at,
        d.updated_at,
        u.id as author_id,
        u.name as author_name,
        u.avatar as author_avatar,
        u.graduation_year as author_grad_year,
        (SELECT json_agg(json_build_object(
          'id', r.id,
          'content', LEFT(r.content, 100),
          'author_name', ru.name,
          'created_at', r.created_at
        ) ORDER BY r.created_at DESC)
        FROM discussion_replies r
        JOIN users ru ON r.user_id = ru.id
        WHERE r.discussion_id = d.id
        LIMIT 3) as recent_replies
      FROM discussions d
      JOIN users u ON d.author_id = u.id
      ${whereClause}
      ORDER BY d.is_pinned DESC, ${orderBy}
      LIMIT $${limitParam} OFFSET $${offsetParam}`,
      [...params, limit, offset],
    );

    // Get categories with counts
    const categoriesResult = await query(`
      SELECT category, COUNT(*) as count
      FROM discussions
      WHERE deleted_at IS NULL
      GROUP BY category
      ORDER BY count DESC
    `);

    return NextResponse.json({
      discussions: result.rows,
      categories: categoriesResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
      { status: 500 },
    );
  }
}

// POST - Create new discussion
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

    const { title, content, category, tags } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 },
      );
    }

    const result = await query(
      `INSERT INTO discussions (title, content, category, tags, author_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, title, content, category, tags, created_at`,
      [title, content, category, tags || [], decoded.id],
    );

    return NextResponse.json({
      message: "Discussion created successfully",
      discussion: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating discussion:", error);
    return NextResponse.json(
      { error: "Failed to create discussion" },
      { status: 500 },
    );
  }
}

// PUT - Update discussion
export async function PUT(request) {
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

    const { id, title, content, category, tags, is_solved } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Discussion ID is required" },
        { status: 400 },
      );
    }

    // Check ownership
    const discussion = await query(
      "SELECT author_id FROM discussions WHERE id = $1",
      [id],
    );

    if (discussion.rows.length === 0) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 },
      );
    }

    if (
      discussion.rows[0].author_id !== decoded.id &&
      decoded.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Not authorized to edit this discussion" },
        { status: 403 },
      );
    }

    const updates = [];
    const values = [];
    let paramCount = 0;

    if (title !== undefined) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      values.push(title);
    }
    if (content !== undefined) {
      paramCount++;
      updates.push(`content = $${paramCount}`);
      values.push(content);
    }
    if (category !== undefined) {
      paramCount++;
      updates.push(`category = $${paramCount}`);
      values.push(category);
    }
    if (tags !== undefined) {
      paramCount++;
      updates.push(`tags = $${paramCount}`);
      values.push(tags);
    }
    if (is_solved !== undefined) {
      paramCount++;
      updates.push(`is_solved = $${paramCount}`);
      values.push(is_solved);
    }

    paramCount++;
    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE discussions SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    return NextResponse.json({
      message: "Discussion updated successfully",
      discussion: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating discussion:", error);
    return NextResponse.json(
      { error: "Failed to update discussion" },
      { status: 500 },
    );
  }
}

// DELETE - Delete discussion
export async function DELETE(request) {
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Discussion ID is required" },
        { status: 400 },
      );
    }

    // Check ownership
    const discussion = await query(
      "SELECT author_id FROM discussions WHERE id = $1",
      [id],
    );

    if (discussion.rows.length === 0) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 },
      );
    }

    if (
      discussion.rows[0].author_id !== decoded.id &&
      decoded.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Not authorized to delete this discussion" },
        { status: 403 },
      );
    }

    // Soft delete
    await query("UPDATE discussions SET deleted_at = NOW() WHERE id = $1", [
      id,
    ]);

    return NextResponse.json({
      message: "Discussion deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting discussion:", error);
    return NextResponse.json(
      { error: "Failed to delete discussion" },
      { status: 500 },
    );
  }
}
