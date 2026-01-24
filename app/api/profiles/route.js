import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";

const DEMO_PROFILES = [
  {
    id: 1,
    full_name: "Sarah Johnson",
    graduation_year: 2020,
    department: "Computer Science",
    current_company: "Google",
    current_role: "Software Engineer",
    location: "San Francisco, CA",
    bio: "Passionate about web development",
    email: "sarah@demo.com",
  },
  {
    id: 2,
    full_name: "Mike Chen",
    graduation_year: 2019,
    department: "Data Science",
    current_company: "Microsoft",
    current_role: "Data Scientist",
    location: "Seattle, WA",
    bio: "ML enthusiast",
    email: "mike@demo.com",
  },
  {
    id: 3,
    full_name: "Emily Rodriguez",
    graduation_year: 2021,
    department: "Business",
    current_company: "Amazon",
    current_role: "Product Manager",
    location: "New York, NY",
    bio: "Building products",
    email: "emily@demo.com",
  },
  {
    id: 4,
    full_name: "David Kim",
    graduation_year: 2018,
    department: "Engineering",
    current_company: "Tesla",
    current_role: "Engineer",
    location: "Austin, TX",
    bio: "Sustainable energy",
    email: "david@demo.com",
  },
  {
    id: 5,
    full_name: "Lisa Wang",
    graduation_year: 2022,
    department: "Computer Science",
    current_company: "Meta",
    current_role: "Developer",
    location: "Remote",
    bio: "UX enthusiast",
    email: "lisa@demo.com",
  },
  {
    id: 6,
    full_name: "James Brown",
    graduation_year: 2020,
    department: "Marketing",
    current_company: "Salesforce",
    current_role: "Manager",
    location: "Chicago, IL",
    bio: "Marketing pro",
    email: "james@demo.com",
  },
];

export async function GET(request) {
  const DEMO_MODE = process.env.DEMO_MODE === "true";

  if (DEMO_MODE) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const year = searchParams.get("year");
    const company = searchParams.get("company");
    const department = searchParams.get("department");
    const location = searchParams.get("location");

    let filtered = [...DEMO_PROFILES];
    if (search)
      filtered = filtered.filter(
        (p) =>
          p.full_name.toLowerCase().includes(search.toLowerCase()) ||
          p.current_company.toLowerCase().includes(search.toLowerCase())
      );
    if (year) filtered = filtered.filter((p) => p.graduation_year == year);
    if (company)
      filtered = filtered.filter((p) =>
        p.current_company.toLowerCase().includes(company.toLowerCase())
      );
    if (department)
      filtered = filtered.filter((p) =>
        p.department.toLowerCase().includes(department.toLowerCase())
      );
    if (location)
      filtered = filtered.filter((p) =>
        p.location.toLowerCase().includes(location.toLowerCase())
      );

    return NextResponse.json({ profiles: filtered });
  }

  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const year = searchParams.get("year");
    const company = searchParams.get("company");
    const department = searchParams.get("department");
    const location = searchParams.get("location");

    let queryText = `
      SELECT 
        p.*,
        u.email,
        u.role
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.college_id = $1
        AND u.is_active = true
        AND p.profile_visibility = true
    `;
    const params = [session.collegeId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      queryText += ` AND (p.full_name ILIKE $${paramCount} OR p.current_company ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (year) {
      paramCount++;
      queryText += ` AND p.graduation_year = $${paramCount}`;
      params.push(year);
    }

    if (company) {
      paramCount++;
      queryText += ` AND p.current_company ILIKE $${paramCount}`;
      params.push(`%${company}%`);
    }

    if (department) {
      paramCount++;
      queryText += ` AND p.department ILIKE $${paramCount}`;
      params.push(`%${department}%`);
    }

    if (location) {
      paramCount++;
      queryText += ` AND p.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    queryText += " ORDER BY p.full_name ASC";

    const result = await query(queryText, params);

    return NextResponse.json({ profiles: result.rows });
  } catch (error) {
    console.error("Get profiles error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
