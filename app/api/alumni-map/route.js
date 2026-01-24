"use server";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/alumni-map - Get alumni locations for map visualization
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const graduationYear = searchParams.get("year") || "";
    const company = searchParams.get("company") || "";
    const industry = searchParams.get("industry") || "";

    let whereConditions = ["u.status = $1", "p.location IS NOT NULL"];
    let params = ["approved"];
    let paramIndex = 2;

    if (graduationYear) {
      whereConditions.push(`p.graduation_year = $${paramIndex}`);
      params.push(graduationYear);
      paramIndex++;
    }

    if (company) {
      whereConditions.push(`p.company ILIKE $${paramIndex}`);
      params.push(`%${company}%`);
      paramIndex++;
    }

    if (industry) {
      whereConditions.push(`p.industry = $${paramIndex}`);
      params.push(industry);
      paramIndex++;
    }

    const whereClause = whereConditions.join(" AND ");

    // Get alumni with locations
    const result = await query(
      `SELECT 
        u.id,
        u.name,
        p.location,
        p.city,
        p.country,
        p.latitude,
        p.longitude,
        p.company,
        p.job_title,
        p.industry,
        p.graduation_year,
        p.photo
       FROM users u
       JOIN profiles p ON u.id = p.user_id
       WHERE ${whereClause}
       ORDER BY p.graduation_year DESC`,
      params,
    );

    // Group by location for clustering
    const locationGroups = result.rows.reduce((acc, alumni) => {
      const key = alumni.city || alumni.location || "Unknown";
      if (!acc[key]) {
        acc[key] = {
          location: key,
          country: alumni.country,
          latitude: alumni.latitude,
          longitude: alumni.longitude,
          count: 0,
          alumni: [],
        };
      }
      acc[key].count++;
      acc[key].alumni.push({
        id: alumni.id,
        name: alumni.name,
        company: alumni.company,
        jobTitle: alumni.job_title,
        graduationYear: alumni.graduation_year,
        photo: alumni.photo,
      });
      return acc;
    }, {});

    // Get statistics
    const stats = await query(`
      SELECT 
        COUNT(DISTINCT u.id) as total_alumni,
        COUNT(DISTINCT p.city) as cities,
        COUNT(DISTINCT p.country) as countries,
        (SELECT p2.city FROM profiles p2 
         JOIN users u2 ON p2.user_id = u2.id 
         WHERE u2.status = 'approved' AND p2.city IS NOT NULL 
         GROUP BY p2.city 
         ORDER BY COUNT(*) DESC LIMIT 1) as top_city
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      WHERE u.status = 'approved' AND p.location IS NOT NULL
    `);

    // Get top locations
    const topLocations = await query(`
      SELECT 
        p.city,
        p.country,
        COUNT(*) as alumni_count
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.status = 'approved' AND p.city IS NOT NULL
      GROUP BY p.city, p.country
      ORDER BY alumni_count DESC
      LIMIT 10
    `);

    // Get companies by location
    const companiesByLocation = await query(`
      SELECT 
        p.city,
        p.company,
        COUNT(*) as count
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.status = 'approved' AND p.city IS NOT NULL AND p.company IS NOT NULL
      GROUP BY p.city, p.company
      HAVING COUNT(*) >= 2
      ORDER BY count DESC
      LIMIT 20
    `);

    return NextResponse.json({
      locations: Object.values(locationGroups),
      stats: stats.rows[0],
      topLocations: topLocations.rows,
      companiesByLocation: companiesByLocation.rows,
      filters: {
        years: await getGraduationYears(),
        industries: await getIndustries(),
        companies: await getTopCompanies(),
      },
    });
  } catch (error) {
    console.error("Error fetching alumni map data:", error);
    return NextResponse.json(
      { error: "Failed to fetch map data" },
      { status: 500 },
    );
  }
}

async function getGraduationYears() {
  const result = await query(`
    SELECT DISTINCT graduation_year 
    FROM profiles 
    WHERE graduation_year IS NOT NULL 
    ORDER BY graduation_year DESC
  `);
  return result.rows.map((r) => r.graduation_year);
}

async function getIndustries() {
  const result = await query(`
    SELECT DISTINCT industry 
    FROM profiles 
    WHERE industry IS NOT NULL 
    ORDER BY industry
  `);
  return result.rows.map((r) => r.industry);
}

async function getTopCompanies() {
  const result = await query(`
    SELECT company, COUNT(*) as count 
    FROM profiles 
    WHERE company IS NOT NULL 
    GROUP BY company 
    ORDER BY count DESC 
    LIMIT 20
  `);
  return result.rows.map((r) => r.company);
}
