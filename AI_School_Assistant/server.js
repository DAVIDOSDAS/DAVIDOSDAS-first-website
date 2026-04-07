require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "communityboard",
  password: process.env.DB_PASSWORD || "interesting_lol",
  port: process.env.DB_PORT || 5432,
});

const JWT_SECRET = process.env.JWT_SECRET || "replace_with_a_long_random_secret";

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// --- REGISTER ---
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hash, "guest"]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === "23505") return res.status(409).json({ error: "Email already in use" });
    res.status(500).json({ error: "Server error" });
  }
});

// --- LOGIN ---
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- GET ALL POSTS ---
app.get("/posts", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.id, posts.type, posts.text, posts.image_url, posts.created_at,
             users.name AS author_name, users.role AS author_role
      FROM posts
      LEFT JOIN users ON posts.author_id = users.id
      ORDER BY posts.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- GET SINGLE POST ---
app.get("/posts/:id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.id, posts.type, posts.text, posts.image_url, posts.created_at,
             users.name AS author_name, users.role AS author_role
      FROM posts
      LEFT JOIN users ON posts.author_id = users.id
      WHERE posts.id = $1
    `, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Post not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get post error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- CREATE POST (auth required) ---
app.post("/posts", authMiddleware, async (req, res) => {
  const { type, text, image_url } = req.body;
  const { id: authorId, role } = req.user;
  if (!text) return res.status(400).json({ error: "Text is required" });
  if (!["comment", "news", "photo"].includes(type)) return res.status(400).json({ error: "Invalid post type" });
  if ((type === "news" || type === "photo") && role !== "worker" && role !== "admin") {
    return res.status(403).json({ error: "Only workers can post news or photos" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO posts (author_id, type, text, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [authorId, type, text, image_url || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- DELETE POST (admin or own post) ---
app.delete("/posts/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    const post = result.rows[0];
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (req.user.role !== "admin" && post.author_id !== req.user.id) {
      return res.status(403).json({ error: "Not allowed" });
    }
    await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- GET ALL USERS (admin only) ---
app.get("/admin/users", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admins only" });
  try {
    const result = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- UPDATE USER ROLE (admin only) ---
app.patch("/admin/users/:id/role", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admins only" });
  const { role } = req.body;
  if (!["guest", "worker"].includes(role)) return res.status(400).json({ error: "Invalid role" });
  try {
    const result = await pool.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, name, email, role",
      [role, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
