"use server";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/companies/[company] - Get company details with alumni
export async function GET(request, { params }) {
  try {
    const company = decodeURIComponent(params.company);

    // Get company alumni
    const alumni = await query(
      `SELECT 
        u.id,
        u.name,
        p.job_title,
        p.graduation_year,
        p.city,
        p.photo,
        p.linkedin
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.company = $1 AND u.status = 'approved'
       ORDER BY p.graduation_year DESC`,
      [company],
    );

    if (alumni.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get job distribution
    const jobDistribution = await query(
      `SELECT 
        p.job_title,
        COUNT(*) as count
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.company = $1 AND u.status = 'approved' AND p.job_title IS NOT NULL
       GROUP BY p.job_title
       ORDER BY count DESC`,
      [company],
    );

    // Get location distribution
    const locationDistribution = await query(
      `SELECT 
        p.city,
        COUNT(*) as count
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.company = $1 AND u.status = 'approved' AND p.city IS NOT NULL
       GROUP BY p.city
       ORDER BY count DESC`,
      [company],
    );

    // Get year distribution
    const yearDistribution = await query(
      `SELECT 
        p.graduation_year,
        COUNT(*) as count
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.company = $1 AND u.status = 'approved' AND p.graduation_year IS NOT NULL
       GROUP BY p.graduation_year
       ORDER BY p.graduation_year DESC`,
      [company],
    );

    // Get related jobs
    const jobs = await query(
      `SELECT * FROM jobs 
       WHERE company ILIKE $1 AND status = 'active'
       ORDER BY created_at DESC
       LIMIT 5`,
      [`%${company}%`],
    );

    // Get industry
    const industryResult = await query(
      `SELECT industry FROM profiles WHERE company = $1 AND industry IS NOT NULL LIMIT 1`,
      [company],
    );

    return NextResponse.json({
      company: {
        name: company,
        industry: industryResult.rows[0]?.industry,
        alumniCount: alumni.rows.length,
        jobDistribution: jobDistribution.rows,
        locationDistribution: locationDistribution.rows,
        yearDistribution: yearDistribution.rows,
      },
      alumni: alumni.rows,
      jobs: jobs.rows,
    });
  } catch (error) {
    console.error("Error fetching company details:", error);
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 },
    );
  }
}
