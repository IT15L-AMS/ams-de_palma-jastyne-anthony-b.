const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: "academic_management",
});

const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET_KEY_1234567890";

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, message: "Access Denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ success: false, message: "Invalid Token" });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

// Register
app.post("/auth/register", async (req, res) => {
  const { firstname, middlename, lastname, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO accounts (firstname, middlename, lastname, email, password, role) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(
      sql,
      [firstname, middlename, lastname, email, hashedPassword, role],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return res
              .status(400)
              .json({ success: false, message: "Email already exists" });
          return res.status(500).json(err);
        }
        res
          .status(201)
          .json({ success: true, message: "Account created successfully" });
      },
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM accounts WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const account = results[0];
    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: account.accountid, email: account.email, role: account.role },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      success: true,
      token,
      user: {
        name: `${account.firstname} ${account.lastname}`,
        role: account.role,
      },
    });
  });
});

app.get("/auth/profile", authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
