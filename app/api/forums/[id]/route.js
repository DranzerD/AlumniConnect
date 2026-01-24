import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

// GET - Fetch single discussion with replies
export async function GET(request, { params }) {
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

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    // Increment view count
    await query(
      "UPDATE discussions SET view_count = view_count + 1 WHERE id = $1",
      [id],
    );

    // Get discussion
    const discussionResult = await query(
      `SELECT 
        d.*,
        u.id as author_id,
        u.name as author_name,
        u.avatar as author_avatar,
        u.company as author_company,
        u.job_title as author_job_title,
        u.graduation_year as author_grad_year,
        (SELECT COUNT(*) FROM discussion_likes WHERE discussion_id = d.id) as like_count,
        EXISTS(SELECT 1 FROM discussion_likes WHERE discussion_id = d.id AND user_id = $2) as is_liked,
        EXISTS(SELECT 1 FROM discussion_bookmarks WHERE discussion_id = d.id AND user_id = $2) as is_bookmarked
      FROM discussions d
      JOIN users u ON d.author_id = u.id
      WHERE d.id = $1 AND d.deleted_at IS NULL`,
      [id, decoded.id],
    );

    if (discussionResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 },
      );
    }

    // Get replies count
    const countResult = await query(
      "SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = $1 AND deleted_at IS NULL",
      [id],
    );
    const totalReplies = parseInt(countResult.rows[0].count);

    // Get replies
    const repliesResult = await query(
      `SELECT 
        r.id,
        r.content,
        r.is_accepted,
        r.created_at,
        r.updated_at,
        u.id as author_id,
        u.name as author_name,
        u.avatar as author_avatar,
        u.graduation_year as author_grad_year,
        (SELECT COUNT(*) FROM reply_likes WHERE reply_id = r.id) as like_count,
        EXISTS(SELECT 1 FROM reply_likes WHERE reply_id = r.id AND user_id = $2) as is_liked
      FROM discussion_replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.discussion_id = $1 AND r.deleted_at IS NULL
      ORDER BY r.is_accepted DESC, r.created_at ASC
      LIMIT $3 OFFSET $4`,
      [id, decoded.id, limit, offset],
    );

    return NextResponse.json({
      discussion: discussionResult.rows[0],
      replies: repliesResult.rows,
      pagination: {
        page,
        limit,
        total: totalReplies,
        pages: Math.ceil(totalReplies / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching discussion:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussion" },
      { status: 500 },
    );
  }
}

// POST - Add reply to discussion
export async function POST(request, { params }) {
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

    const { id } = params;
    const { content, parentId } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Reply content is required" },
        { status: 400 },
      );
    }

    // Check if discussion exists
    const discussion = await query(
      "SELECT id, author_id FROM discussions WHERE id = $1 AND deleted_at IS NULL",
      [id],
    );

    if (discussion.rows.length === 0) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 },
      );
    }

    // Create reply
    const result = await query(
      `INSERT INTO discussion_replies (discussion_id, user_id, content, parent_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, content, created_at`,
      [id, decoded.id, content, parentId || null],
    );

    // Update reply count
    await query(
      "UPDATE discussions SET reply_count = reply_count + 1, updated_at = NOW() WHERE id = $1",
      [id],
    );

    // Create notification for discussion author
    if (discussion.rows[0].author_id !== decoded.id) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type, created_at)
         VALUES ($1, 'discussion_reply', 'New reply to your discussion', $2, $3, 'discussion', NOW())`,
        [
          discussion.rows[0].author_id,
          `Someone replied to your discussion`,
          id,
        ],
      );
    }

    return NextResponse.json({
      message: "Reply added successfully",
      reply: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    return NextResponse.json({ error: "Failed to add reply" }, { status: 500 });
  }
}

// PUT - Like/bookmark or mark reply as accepted
export async function PUT(request, { params }) {
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

    const { id } = params;
    const { action, replyId } = await request.json();

    if (action === "like") {
      // Toggle like on discussion
      const existingLike = await query(
        "SELECT id FROM discussion_likes WHERE discussion_id = $1 AND user_id = $2",
        [id, decoded.id],
      );

      if (existingLike.rows.length > 0) {
        await query(
          "DELETE FROM discussion_likes WHERE discussion_id = $1 AND user_id = $2",
          [id, decoded.id],
        );
        return NextResponse.json({ message: "Like removed", liked: false });
      } else {
        await query(
          "INSERT INTO discussion_likes (discussion_id, user_id, created_at) VALUES ($1, $2, NOW())",
          [id, decoded.id],
        );
        return NextResponse.json({ message: "Liked", liked: true });
      }
    }

    if (action === "bookmark") {
      // Toggle bookmark
      const existingBookmark = await query(
        "SELECT id FROM discussion_bookmarks WHERE discussion_id = $1 AND user_id = $2",
        [id, decoded.id],
      );

      if (existingBookmark.rows.length > 0) {
        await query(
          "DELETE FROM discussion_bookmarks WHERE discussion_id = $1 AND user_id = $2",
          [id, decoded.id],
        );
        return NextResponse.json({
          message: "Bookmark removed",
          bookmarked: false,
        });
      } else {
        await query(
          "INSERT INTO discussion_bookmarks (discussion_id, user_id, created_at) VALUES ($1, $2, NOW())",
          [id, decoded.id],
        );
        return NextResponse.json({ message: "Bookmarked", bookmarked: true });
      }
    }

    if (action === "accept_reply" && replyId) {
      // Check if user is discussion author
      const discussion = await query(
        "SELECT author_id FROM discussions WHERE id = $1",
        [id],
      );

      if (discussion.rows[0].author_id !== decoded.id) {
        return NextResponse.json(
          { error: "Only the discussion author can accept answers" },
          { status: 403 },
        );
      }

      // Mark reply as accepted and mark discussion as solved
      await query(
        "UPDATE discussion_replies SET is_accepted = false WHERE discussion_id = $1",
        [id],
      );
      await query(
        "UPDATE discussion_replies SET is_accepted = true WHERE id = $1",
        [replyId],
      );
      await query("UPDATE discussions SET is_solved = true WHERE id = $1", [
        id,
      ]);

      return NextResponse.json({ message: "Answer accepted" });
    }

    if (action === "like_reply" && replyId) {
      const existingLike = await query(
        "SELECT id FROM reply_likes WHERE reply_id = $1 AND user_id = $2",
        [replyId, decoded.id],
      );

      if (existingLike.rows.length > 0) {
        await query(
          "DELETE FROM reply_likes WHERE reply_id = $1 AND user_id = $2",
          [replyId, decoded.id],
        );
        return NextResponse.json({ message: "Like removed", liked: false });
      } else {
        await query(
          "INSERT INTO reply_likes (reply_id, user_id, created_at) VALUES ($1, $2, NOW())",
          [replyId, decoded.id],
        );
        return NextResponse.json({ message: "Liked", liked: true });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating discussion:", error);
    return NextResponse.json(
      { error: "Failed to update discussion" },
      { status: 500 },
    );
  }
}
