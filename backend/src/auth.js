import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, getUserById } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'trustscore-super-secret-key-2026';

// In-memory fallback if Postgres is temporarily unreachable during local dev
const memoryUsers = new Map();

export async function signupUser({ name, email, password, role }) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const cleanEmail = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, 10);
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;

  try {
    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    const user = await createUser({
      name: name?.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      passwordHash,
      role: role || 'Recruiter',
      avatar
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return { user, token };
  } catch (err) {
    if (err.message.includes('already exists')) throw err;
    // Fallback to in-memory store
    if (memoryUsers.has(cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const user = {
      id: `mem-${Date.now()}`,
      name: name?.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      password_hash: passwordHash,
      role: role || 'Recruiter',
      avatar,
      created_at: new Date().toISOString()
    };
    memoryUsers.set(cleanEmail, user);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    return { user: safeUser, token };
  }
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const cleanEmail = email.toLowerCase().trim();
  let user = null;

  try {
    user = await getUserByEmail(cleanEmail);
  } catch (err) {
    user = memoryUsers.get(cleanEmail) || null;
  }

  if (!user && memoryUsers.has(cleanEmail)) {
    user = memoryUsers.get(cleanEmail);
  }

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function getMeFromToken(token) {
  if (!token) throw new Error('No authentication token provided.');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = null;
    try {
      user = await getUserById(decoded.id);
    } catch {
      user = memoryUsers.get(decoded.email) || null;
    }
    if (!user) {
      user = memoryUsers.get(decoded.email) || null;
    }
    if (!user) throw new Error('User not found.');
    const { password_hash, ...safeUser } = user;
    return safeUser;
  } catch (err) {
    throw new Error('Invalid or expired token.');
  }
}
