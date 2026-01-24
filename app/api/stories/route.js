"use server";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

// GET success stories
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const offset = (page - 1) * limit;

    let whereClause = "WHERE s.status = 'published'";
    const params = [];

    if (category) {
      whereClause += " AND s.category = ?";
      params.push(category);
    }

    if (featured === "true") {
      whereClause += " AND s.is_featured = 1";
    }

    const stories = await db.all(
      `
      SELECT 
        s.*,
        u.name as author_name,
        p.avatar as author_avatar,
        p.title as author_title,
        p.company as author_company,
        p.graduation_year,
        (SELECT COUNT(*) FROM story_likes WHERE story_id = s.id) as like_count,
        (SELECT COUNT(*) FROM story_comments WHERE story_id = s.id) as comment_count,
        EXISTS(SELECT 1 FROM story_likes WHERE story_id = s.id AND user_id = ?) as is_liked
      FROM success_stories s
      JOIN users u ON s.author_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      ${whereClause}
      ORDER BY s.is_featured DESC, s.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [session.userId, ...params, limit, offset],
    );

    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM success_stories s ${whereClause}`,
      params,
    );

    // Get categories for filtering
    const categories = await db.all(`
      SELECT DISTINCT category FROM success_stories WHERE status = 'published'
    `);

    return NextResponse.json({
      stories,
      categories: categories.map((c) => c.category),
      pagination: {
        page,
        limit,
        total: countResult?.total || 0,
        totalPages: Math.ceil((countResult?.total || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Stories fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 },
    );
  }
}

// POST create a new story
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      category,
      cover_image,
      tags,
      status = "draft",
    } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 },
      );
    }

    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: "Title must be between 5 and 200 characters" },
        { status: 400 },
      );
    }

    if (content.length < 100) {
      return NextResponse.json(
        { error: "Content must be at least 100 characters" },
        { status: 400 },
      );
    }

    // Generate slug
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now();

    // Auto-generate excerpt if not provided
    const storyExcerpt =
      excerpt || content.replace(/<[^>]*>/g, "").substring(0, 200) + "...";

    const result = await db.run(
      `
      INSERT INTO success_stories (
        author_id, title, slug, content, excerpt, category, 
        cover_image, tags, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
      [
        session.userId,
        title,
        slug,
        content,
        storyExcerpt,
        category,
        cover_image,
        JSON.stringify(tags || []),
        status,
      ],
    );

    return NextResponse.json({
      message: "Story created successfully",
      storyId: result.lastID,
      slug,
    });
  } catch (error) {
    console.error("Story creation error:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 },
    );
  }
}
