require("dotenv").config();

const { createJobIndexes } = require("./db/indexes");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: String,
    applicantId: String,
    status: {
      type: String,
      default: "PENDING",
    },
  },
  { strict: false, timestamps: true },
);

const JobSchema = new mongoose.Schema(
  {
    userId: String,
  },
  { strict: false, timestamps: true },
);

const Job = mongoose.model("Job", JobSchema);
const Application = mongoose.model("Application", ApplicationSchema);

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

// RANGE (pagination)
app.get("/range", authMiddleware, async (req, res) => {
  try {
    await updateExpiredJobs(req.user.id);

    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    let page = Math.max(parseInt(req.query.page) || 1, 1);

    const baseFilter = buildFilter(
      req.user.id,
      req.query.q || "",
      req.query.status || "",
    );

    const total = await Job.countDocuments(baseFilter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    if (page > totalPages) page = totalPages;

    const allIds = await Job.find(baseFilter)
      .sort({ createdAt: -1, _id: -1 })
      .select("_id");

    const start = (page - 1) * limit;
    const pageIds = allIds.slice(start, start + limit).map((j) => j._id);

    const jobs = await Job.find({
      _id: { $in: pageIds },
    }).sort({ createdAt: -1, _id: -1 });

    const activeCount = await Job.countDocuments({
      userId: req.user.id,
      status: "ACTIVE",
    });

    res.json({
      data: jobs,
      total,
      activeCount,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET jobs names + ids
app.get("/list", authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find(
      { userId: req.user.id },
      {
        _id: 1,
        jobTitle: 1,
      },
    ).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }

  next();
};

app.get("/jobs", optionalAuthMiddleware, async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    let page = Math.max(parseInt(req.query.page) || 1, 1);

    const andFilters = [
      {
        status: "ACTIVE",
      },
    ];

    if (req.user?.id) {
      andFilters.push({
        userId: { $ne: req.user.id },
      });
    }

    // Search
    if (req.query.q?.trim()) {
      andFilters.push({
        $or: [
          { jobTitle: { $regex: req.query.q, $options: "i" } },
          { companyName: { $regex: req.query.q, $options: "i" } },
          { location: { $regex: req.query.q, $options: "i" } },
        ],
      });
    }

    // Job Type
    if (req.query.job_type) {
      const values = Array.isArray(req.query.job_type)
        ? req.query.job_type
        : [req.query.job_type];

      andFilters.push({
        jobType: { $in: values },
      });
    }

    // Experience
    if (req.query.experience) {
      const values = Array.isArray(req.query.experience)
        ? req.query.experience
        : [req.query.experience];

      andFilters.push({
        experienceLevel: { $in: values },
      });
    }

    // Salary Range
    if (req.query.salary_range) {
      const values = Array.isArray(req.query.salary_range)
        ? req.query.salary_range
        : [req.query.salary_range];

      const salaryConditions = [];

      values.forEach((v) => {
        if (v === "50k-80k") {
          salaryConditions.push({
            $expr: {
              $and: [
                { $gte: [{ $toInt: "$salaryMin" }, 50000] },
                { $lte: [{ $toInt: "$salaryMax" }, 80000] },
              ],
            },
          });
        }

        if (v === "80k-120k") {
          salaryConditions.push({
            $expr: {
              $and: [
                { $gte: [{ $toInt: "$salaryMin" }, 80000] },
                { $lte: [{ $toInt: "$salaryMax" }, 120000] },
              ],
            },
          });
        }

        if (v === "120k-160k") {
          salaryConditions.push({
            $expr: {
              $and: [
                { $gte: [{ $toInt: "$salaryMin" }, 120000] },
                { $lte: [{ $toInt: "$salaryMax" }, 160000] },
              ],
            },
          });
        }

        if (v === "160k+") {
          salaryConditions.push({
            $expr: {
              $gte: [{ $toInt: "$salaryMin" }, 160000],
            },
          });
        }
      });

      if (salaryConditions.length) {
        andFilters.push({
          $or: salaryConditions,
        });
      }
    }

    // Date Posted
    if (req.query.date_posted) {
      const values = Array.isArray(req.query.date_posted)
        ? req.query.date_posted
        : [req.query.date_posted];

      const dateConditions = [];
      const now = new Date();

      values.forEach((v) => {
        if (v === "24h") {
          const d = new Date(now);
          d.setHours(d.getHours() - 24);

          dateConditions.push({
            createdAt: { $gte: d },
          });
        }

        if (v === "7d") {
          const d = new Date(now);
          d.setDate(d.getDate() - 7);

          dateConditions.push({
            createdAt: { $gte: d },
          });
        }
      });

      if (dateConditions.length) {
        andFilters.push({
          $or: dateConditions,
        });
      }
    }

    const filter =
      andFilters.length === 1
        ? andFilters[0]
        : {
            $and: andFilters,
          };

    const total = await Job.countDocuments(filter);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    if (page > totalPages) {
      page = totalPages;
    }

    const jobs = await Job.find(filter)
      .select(
        "createdAt jobTitle companyName location jobType employmentType workSetting experienceLevel duration salaryMin salaryMax applicationDeadline skills",
      )
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: jobs,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

app.get("/public/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      status: "ACTIVE",
    }).select("-applicationsCount -profileViews");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.get("/:id/ownership", authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const isOwner = job.userId === req.user.id;

    res.json({
      success: true,
      jobId: job._id,
      ownerId: job.userId,
      isOwner,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET JOB TITLE ONLY
app.get("/:id/title", authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOne(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        jobTitle: 1,
        _id: 0,
      },
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      jobTitle: job.jobTitle,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
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
  try {
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

    await Application.deleteMany({
      jobId: req.params.id,
    });

    await Job.deleteOne({
      _id: req.params.id,
    });

    return res.json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
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

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await createJobIndexes(mongoose.connection.db);

    const PORT = process.env.PORT;

    app.listen(PORT, () => {
      console.log(`Job service running on ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup error:", err);
  }
};

startServer();
