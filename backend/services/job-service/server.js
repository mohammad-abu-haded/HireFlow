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
  { strict: false, timestamps: true },
);

const Job = mongoose.model("Job", JobSchema);

// ================= AUTH =================
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

// ================= HELPERS =================

// Expire jobs (lightweight)
const updateExpiredJobs = async (userId) => {
  const now = new Date();

  // 1. ACTIVE → EXPIRED
  await Job.updateMany(
    {
      userId,
      status: "ACTIVE",
      applicationDeadline: { $lt: now },
    },
    {
      $set: { status: "EXPIRED" },
    },
  );

  // 2. EXPIRED → ACTIVE (if deadline extended)
  await Job.updateMany(
    {
      userId,
      status: "EXPIRED",
      applicationDeadline: { $gte: now },
    },
    {
      $set: { status: "ACTIVE" },
    },
  );
};

// reusable filter builder
const buildFilter = (userId, q, status) => {
  const filter = { userId };

  // status filter (ignore EXPIRED from frontend logic)
  if (status && status !== "ALL") {
    filter.status = status.trim().toUpperCase();
  }

  // search filter
  if (q) {
    const tokens = q.trim().split(/\s+/);

    filter.$and = tokens.map((token) => ({
      $or: [
        { jobTitle: { $regex: token, $options: "i" } },
        { companyName: { $regex: token, $options: "i" } },
        { location: { $regex: token, $options: "i" } },
        { jobType: { $regex: token, $options: "i" } },
        { workSetting: { $regex: token, $options: "i" } },
        { experienceLevel: { $regex: token, $options: "i" } },
        { salaryMin: { $regex: token, $options: "i" } },
        { salaryMax: { $regex: token, $options: "i" } },
      ],
    }));
  }

  return filter;
};

// ================= ROUTES =================

// GET ALL (NO pagination)
app.get("/", authMiddleware, async (req, res) => {
  await updateExpiredJobs(req.user.id);

  const jobs = await Job.find(
    buildFilter(req.user.id, req.query.q, req.query.status),
  ).sort({ createdAt: -1 });

  res.json(jobs);
});

// CREATE
app.post("/", authMiddleware, async (req, res) => {
  const job = await Job.create({
    ...req.body,
    applicationDeadline: req.body.applicationDeadline
      ? new Date(req.body.applicationDeadline)
      : null,
    userId: req.user.id,
  });

  res.json(job);
});

// COUNT (for pagination)
app.get("/count", authMiddleware, async (req, res) => {
  try {
    await updateExpiredJobs(req.user.id);

    const count = await Job.countDocuments(
      buildFilter(req.user.id, req.query.q, req.query.status),
    );

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// RANGE (pagination)
app.get("/range", authMiddleware, async (req, res) => {
  try {
    await updateExpiredJobs(req.user.id);

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const skip = (page - 1) * limit;

    const filter = buildFilter(req.user.id, req.query.q, req.query.status);

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    res.json({
      data: jobs,
      total,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// GET ONE
app.get("/:id", authMiddleware, async (req, res) => {
  await updateExpiredJobs(req.user.id);

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

// UPDATE
app.put("/:id", authMiddleware, async (req, res) => {
  const updateData = {
    ...req.body,
  };

  if (req.body.applicationDeadline) {
    updateData.applicationDeadline = new Date(req.body.applicationDeadline);
  }

  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    updateData,
    { new: true },
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

// UPDATE STATUS manually
app.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true },
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    res.json({ success: true, job });
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
