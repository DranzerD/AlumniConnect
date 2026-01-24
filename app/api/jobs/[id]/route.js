import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";

export async function PUT(request, { params }) {
  try {
    const session = await requireAuth();
    const jobId = params.id;
    const data = await request.json();

    // Verify ownership or admin
    const jobCheck = await query(
      "SELECT posted_by_user_id FROM jobs WHERE id = $1 AND college_id = $2",
      [jobId, session.collegeId]
    );

    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const isOwner = jobCheck.rows[0].posted_by_user_id === session.userId;
    const isAdmin = session.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to update this job" },
        { status: 403 }
      );
    }

    const {
      company_name,
      role_title,
      job_type,
      location,
      description,
      apply_link,
      status,
    } = data;

    await query(
      `UPDATE jobs SET
        company_name = COALESCE($1, company_name),
        role_title = COALESCE($2, role_title),
        job_type = COALESCE($3, job_type),
        location = COALESCE($4, location),
        description = COALESCE($5, description),
        apply_link = COALESCE($6, apply_link),
        status = COALESCE($7, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8`,
      [
        company_name,
        role_title,
        job_type,
        location,
        description,
        apply_link,
        status,
        jobId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update job error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth();
    const jobId = params.id;

    // Verify ownership or admin
    const jobCheck = await query(
      "SELECT posted_by_user_id FROM jobs WHERE id = $1 AND college_id = $2",
      [jobId, session.collegeId]
    );

    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const isOwner = jobCheck.rows[0].posted_by_user_id === session.userId;
    const isAdmin = session.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to delete this job" },
        { status: 403 }
      );
    }

    await query("DELETE FROM jobs WHERE id = $1", [jobId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete job error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
