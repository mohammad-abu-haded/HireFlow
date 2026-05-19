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
  const job = await Job.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
    },
    req.body,
    { new: true }
  );

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  res.json(job);
});

// DELETE
app.delete("/:id", authMiddleware, async (req, res) => {
  const job = await Job.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  res.json({ success: true });
});

// GET ONE
app.get("/:id", authMiddleware, async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  res.json(job);
});

// UPDATE STATUS
app.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const job = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      job,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.listen(5002, () => {
  console.log("Job service running on 5002");
});