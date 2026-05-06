require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// DB
mongoose.connect(process.env.MONGO_URI);

// Redis
const redis = new Redis(process.env.REDIS_URL);

// User Model
const UserSchema = new mongoose.Schema({
  userName: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", UserSchema);

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  const { userName, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: "Email exists" });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await User.create({
    userName,
    email,
    password: hashed,
  });

  res.json({
    success: true,
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
  });
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ success: false, message: "Wrong password" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  await redis.set(`token:${user._id}`, token, "EX", 86400);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
  });
});

// ================= LOGOUT =================
app.post("/logout", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  await redis.del(`token:${decoded.id}`);

  res.json({ success: true });
});

// ================= ME =================
app.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password");

  res.json({ success: true, user });
});

app.listen(5001, () => {
  console.log("Auth service running on 5001");
});