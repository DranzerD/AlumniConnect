import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth";
import { get } from "./db";
import { HttpError } from "./http";

// Resolves the signed-in user from the session cookie. The JWT only proves who
// the caller is; role and active status are always re-read from the database so
// deactivation and role changes take effect immediately.
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;

  const user = get(
    `SELECT u.id, u.email, u.role, u.college_id AS collegeId, c.name AS collegeName,
            p.full_name AS fullName
       FROM users u
       LEFT JOIN colleges c ON c.id = u.college_id
       LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = ? AND u.is_active = 1
        AND (u.role = 'superadmin' OR c.is_active = 1)`,
    session.userId,
  );
  return user ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Authentication required");
  return user;
}

export async function requireRole(...roles) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new HttpError(403, "You do not have permission to do that");
  }
  return user;
}
