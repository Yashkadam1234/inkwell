// routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { getDb } from "../db/init.js";

const router = Router();

// POST /auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "name, email and password are required" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  const db = await getDb();
  try {
    const exists = await db.get("SELECT id FROM users WHERE email = ?", email.toLowerCase());
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const id = "USR_" + nanoid(8);
    await db.run(
      "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
      id, name.trim(), email.toLowerCase(), hashed
    );

    const token = jwt.sign({ id, name: name.trim(), email: email.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id, name: name.trim(), email: email.toLowerCase() } });
  } finally {
    await db.close();
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password are required" });

  const db = await getDb();
  try {
    const user = await db.get("SELECT * FROM users WHERE email = ?", email.toLowerCase());
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } finally {
    await db.close();
  }
});

// GET /auth/me
router.get("/me", (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    res.json({ user: { id: payload.id, name: payload.name, email: payload.email } });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
