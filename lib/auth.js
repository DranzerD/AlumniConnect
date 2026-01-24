import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticate(email, password) {
  const result = await query(
    "SELECT u.*, c.name as college_name FROM users u JOIN colleges c ON u.college_id = c.id WHERE u.email = $1 AND u.is_active = true",
    [email]
  );

  if (result.rows.length === 0) {
    return { success: false, error: "Invalid credentials" };
  }

  const user = result.rows[0];
  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    return { success: false, error: "Invalid credentials" };
  }

  const token = generateToken({
    userId: user.id,
    collegeId: user.college_id,
    role: user.role,
  });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      collegeId: user.college_id,
      collegeName: user.college_name,
      mustResetPassword: user.must_reset_password,
    },
  };
}

export async function getUserFromToken(token) {
  const payload = verifyToken(token);
  if (!payload) return null;

  const result = await query(
    "SELECT u.*, c.name as college_name FROM users u JOIN colleges c ON u.college_id = c.id WHERE u.id = $1 AND u.is_active = true",
    [payload.userId]
  );

  if (result.rows.length === 0) return null;

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    collegeId: user.college_id,
    collegeName: user.college_name,
  };
}
