import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";

const DEMO_JOBS = [
  {
    id: 1,
    role_title: "Senior Frontend Developer",
    company_name: "Tech Inc",
    job_type: "full-time",
    location: "Remote",
    description: "Build amazing UIs with React",
    requirements: "React, TypeScript",
    apply_link: "#",
  },
  {
    id: 2,
    role_title: "Data Science Intern",
    company_name: "AI Labs",
    job_type: "internship",
    location: "Boston",
    description: "Work on ML projects",
    requirements: "Python, ML",
    apply_link: "#",
  },
  {
    id: 3,
    role_title: "Product Manager",
    company_name: "Startup",
    job_type: "full-time",
    location: "SF",
    description: "Lead product development",
    requirements: "3+ years PM",
    apply_link: "#",
  },
  {
    id: 4,
    role_title: "Backend Engineer",
    company_name: "Cloud Co",
    job_type: "full-time",
    location: "Seattle",
    description: "Build scalable APIs",
    requirements: "Node.js, AWS",
    apply_link: "#",
  },
  {
    id: 5,
    role_title: "UX Design Intern",
    company_name: "Design Studio",
    job_type: "internship",
    location: "Remote",
    description: "Design great experiences",
    requirements: "Figma, Portfolio",
    apply_link: "#",
  },
  {
    id: 6,
    role_title: "DevOps Engineer",
    company_name: "Infrastructure Pro",
    job_type: "full-time",
    location: "Austin",
    description: "Manage CI/CD pipelines",
    requirements: "Kubernetes, AWS",
    apply_link: "#",
  },
];

export async function GET(request) {
  const DEMO_MODE = process.env.DEMO_MODE === "true";

  if (DEMO_MODE) {
    const { searchParams } = new URL(request.url);
    const jobType = searchParams.get("type");

    let filtered = [...DEMO_JOBS];
    if (jobType) filtered = filtered.filter((j) => j.job_type === jobType);

    return NextResponse.json({ jobs: filtered });
  }

  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const jobType = searchParams.get("type");
    const status = searchParams.get("status") || "open";

    let queryText = `
      SELECT 
        j.*,
        p.full_name as posted_by_name
      FROM jobs j
      LEFT JOIN profiles p ON j.posted_by_user_id = p.user_id
      WHERE j.college_id = $1
        AND j.status = $2
    `;
    const params = [session.collegeId, status];
    let paramCount = 2;

    if (jobType) {
      paramCount++;
      queryText += ` AND j.job_type = $${paramCount}`;
      params.push(jobType);
    }

    queryText += " ORDER BY j.created_at DESC";

    const result = await query(queryText, params);

    return NextResponse.json({ jobs: result.rows });
  } catch (error) {
    console.error("Get jobs error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await requireAuth();

    // Only alumni and admin can post jobs
    if (!["alumni", "admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Only alumni and admins can post jobs" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const {
      company_name,
      role_title,
      job_type,
      location,
      description,
      requirements,
      apply_link,
    } = data;

    if (
      !company_name ||
      !role_title ||
      !job_type ||
      !description ||
      !apply_link
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["internship", "full-time"].includes(job_type)) {
      return NextResponse.json({ error: "Invalid job type" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO jobs (
        college_id, posted_by_user_id, company_name, role_title,
        job_type, location, description, requirements, apply_link
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        session.collegeId,
        session.userId,
        company_name,
        role_title,
        job_type,
        location,
        description,
        requirements || "",
        apply_link,
      ]
    );

    return NextResponse.json({
      success: true,
      jobId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Create job error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
