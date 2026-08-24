// Mock authentication for the demo. Passwords are stored in plain text in
// localStorage — fine for a prototype, NOT how real auth should work.
// Replace with a real backend (hashed passwords, sessions/JWTs, etc.)
// before this goes anywhere near production.

export const SEED_USERS = [
  { id: "u1", name: "Marín Osei", email: "marin@lanternfic.app", password: "password123", isAdmin: true },
  { id: "u2", name: "Kofi Boateng", email: "kofi@lanternfic.app", password: "password123", isAdmin: false },
];

export function findUserByEmail(users, email) {
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}
