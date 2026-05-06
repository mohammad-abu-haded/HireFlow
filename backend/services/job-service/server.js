require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const JobSchema = new mongoose.Schema(
  {
    userId: String,
  },
  { strict: false, timestamps: true }
);

const Job = mongoose.model("Job", JobSchema);

// AUTH middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ===== JOBS =====

// GET ALL
app.get("/", authMiddleware, async (req, res) => {
  const jobs = await Job.find({ userId: req.user.id });
  res.json(jobs);
});

// CREATE
app.post("/", authMiddleware, async (req, res) => {
  const job = await Job.create({
    ...req.body,
    userId: req.user.id,
  });

  res.json(job);
});

// UPDATE
app.put("/:id", authMiddleware, async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(job);
});

// DELETE
app.delete("/:id", authMiddleware, async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// GET ONE
app.get("/:id", authMiddleware, async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  res.json(job);
});

app.listen(5002, () => {
  console.log("Job service running on 5002");
});