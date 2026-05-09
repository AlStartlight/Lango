import type { User } from '@/lib/schemas';

// ── Types ─────────────────────────────────────────────────────────────────────

type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
};

// ── In-memory "database" ──────────────────────────────────────────────────────

const DB: StoredUser[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'demo@langopulse.dev',
    passwordHash: 'password123',
    name: 'Demo User',
    createdAt: new Date().toISOString(),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapToUser(stored: StoredUser): User {
  return {
    id: stored.id,
    email: stored.email,
    name: stored.name,
    avatarUrl: null,
    nativeLanguage: null,
    learningLanguage: null,
    dailyGoalMinutes: 10,
    streakDays: 0,
    createdAt: stored.createdAt,
  };
}

function makeTokens() {
  return {
    accessToken: `mock-access-${crypto.randomUUID()}`,
    refreshToken: `mock-refresh-${crypto.randomUUID()}`,
    expiresIn: 3600,
  };
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export function mockLogin(email: string, password: string) {
  const user = DB.find((u) => u.email === email && u.passwordHash === password);
  if (!user) {
    return null;
  }
  return {
    user: mapToUser(user),
    token: makeTokens(),
  };
}

export function mockRegister(
  name: string,
  email: string,
  password: string,
) {
  if (DB.find((u) => u.email === email)) {
    return { error: 'Email already in use' };
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    email,
    passwordHash: password,
    name,
    createdAt: new Date().toISOString(),
  };
  DB.push(newUser);

  return {
    user: mapToUser(newUser),
    token: makeTokens(),
  };
}
