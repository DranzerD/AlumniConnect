"use server";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/companies - Get companies with alumni
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry") || "";
    const sortBy = searchParams.get("sortBy") || "alumni_count";

    const offset = (page - 1) * limit;

    let whereConditions = ["p.company IS NOT NULL", "u.status = $1"];
    let params = ["approved"];
    let paramIndex = 2;

    if (search) {
      whereConditions.push(`p.company ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (industry) {
      whereConditions.push(`p.industry = $${paramIndex}`);
      params.push(industry);
      paramIndex++;
    }

    const whereClause = whereConditions.join(" AND ");

    // Get companies with alumni counts
    const companies = await query(
      `SELECT 
        p.company,
        p.industry,
        COUNT(DISTINCT u.id) as alumni_count,
        ARRAY_AGG(DISTINCT p.city) FILTER (WHERE p.city IS NOT NULL) as locations,
        ARRAY_AGG(DISTINCT p.job_title) FILTER (WHERE p.job_title IS NOT NULL) as job_titles,
        MIN(p.graduation_year) as earliest_year,
        MAX(p.graduation_year) as latest_year
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE ${whereClause}
       GROUP BY p.company, p.industry
       ORDER BY ${sortBy === "name" ? "p.company" : "alumni_count DESC"}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(DISTINCT p.company) as total
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE ${whereClause}`,
      params,
    );

    // Get top companies
    const topCompanies = await query(
      `SELECT 
        p.company,
        COUNT(DISTINCT u.id) as count
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE u.status = 'approved' AND p.company IS NOT NULL
       GROUP BY p.company
       ORDER BY count DESC
       LIMIT 10`,
    );

    // Get industries list
    const industries = await query(
      `SELECT DISTINCT industry FROM profiles 
       WHERE industry IS NOT NULL 
       ORDER BY industry`,
    );

    // Get statistics
    const stats = await query(
      `SELECT 
        COUNT(DISTINCT p.company) as total_companies,
        COUNT(DISTINCT p.industry) as total_industries,
        (SELECT p2.company FROM profiles p2 
         JOIN users u2 ON p2.user_id = u2.id 
         WHERE u2.status = 'approved' AND p2.company IS NOT NULL 
         GROUP BY p2.company 
         ORDER BY COUNT(*) DESC LIMIT 1) as top_company
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE u.status = 'approved' AND p.company IS NOT NULL`,
    );

    const total = parseInt(countResult.rows[0]?.total || 0);

    return NextResponse.json({
      companies: companies.rows.map((c) => ({
        ...c,
        locations: c.locations?.slice(0, 5) || [],
        jobTitles: c.job_titles?.slice(0, 5) || [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      topCompanies: topCompanies.rows,
      industries: industries.rows.map((i) => i.industry),
      stats: stats.rows[0],
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 },
    );
  }
}
