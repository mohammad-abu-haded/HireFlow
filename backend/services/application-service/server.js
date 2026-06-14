require("dotenv").config();

const { createApplicationIndexes } = require("./db/indexes");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await createApplicationIndexes(mongoose.connection.db);

    app.listen(5002, () => {
      console.log("Application service running on 5002");
    });
  } catch (err) {
    console.error("DB connection error:", err);
  }
};

startServer();

// ================= MULTER =================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC and DOCX files are allowed"));
    }
  },
});

app.use("/uploads", express.static("uploads"));

// ================= MODELS =================

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
  { strict: false },
);

const Application = mongoose.model("Application", ApplicationSchema);

const Job = mongoose.model("Job", JobSchema);

// ================= AUTH =================

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

// ================= ROUTES =================

// APPLY FOR JOB

app.post(
  "/apply",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      const {
        jobId,
        fullName,
        email,
        phoneNumber,
        linkedinProfile,
        coverLetter,
      } = req.body;
      const applicantId = req.user.id;
      if (!jobId || !fullName || !email || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const application = await Application.create({
        jobId,
        applicantId,
        fullName,
        email,
        phoneNumber,
        linkedinProfile,
        coverLetter,
        resume: req.file
          ? {
              filename: req.file.filename,
              originalName: req.file.originalname,
              path: req.file.path,
              mimetype: req.file.mimetype,
              size: req.file.size,
            }
          : null,
        status: "PENDING",
      });
      await Job.findByIdAndUpdate(jobId, {
        $inc: {
          applicationsCount: 1,
        },
      });

      res.status(201).json({
        success: true,
        application,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

// GET ALL APPLICATIONS FOR MY JOBS

app.get("/", authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find({
      userId: req.user.id,
    }).select("_id");

    const jobIds = jobs.map((job) => job._id.toString());

    const applications = await Application.find({
      jobId: { $in: jobIds },
    }).sort({
      createdAt: -1,
    });

    res.json(applications);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET APPLICATIONS FOR SPECIFIC JOB

app.get("/job/:jobId", authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      userId: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const applications = await Application.find({
      jobId: req.params.jobId,
    }).sort({
      createdAt: -1,
    });

    res.json(applications);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET TOTAL APPLICATIONS SUBMITTED BY USER

app.get("/my/applications/count", authMiddleware, async (req, res) => {
  try {
    const count = await Application.countDocuments({
      applicantId: req.user.id,
    });

    res.json({
      success: true,
      totalApplications: count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET TOTAL APPLICATIONS FOR JOB

app.get("/jobs/:jobId/applications/count", async (req, res) => {
  try {
    const count = await Application.countDocuments({
      jobId: req.params.jobId,
    });

    res.json({
      success: true,
      jobId: req.params.jobId,
      totalApplications: count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET ONE APPLICATION

app.get("/:id", authMiddleware, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const job = await Job.findOne({
      _id: application.jobId,
      userId: req.user.id,
    });

    if (!job) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET APPLICATION STATISTICS (THIS WEEK VS LAST WEEK)

app.get("/stats/applications", authMiddleware, async (req, res) => {
  try {
    const now = new Date();

    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - 7);

    const startOfLastWeek = new Date(now);
    startOfLastWeek.setDate(now.getDate() - 14);

    const thisWeek = await Application.countDocuments({
      createdAt: {
        $gte: startOfThisWeek,
      },
    });

    const lastWeek = await Application.countDocuments({
      createdAt: {
        $gte: startOfLastWeek,
        $lt: startOfThisWeek,
      },
    });

    const totalApplications = await Application.countDocuments();

    const difference = thisWeek - lastWeek;

    const percentage = lastWeek === 0 ? 100 : (difference / lastWeek) * 100;

    res.json({
      totalApplications,
      thisWeek,
      lastWeek,
      difference,
      percentage: Number(percentage.toFixed(1)),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// UPDATE APPLICATION STATUS

app.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const job = await Job.findOne({
      _id: application.jobId,
      userId: req.user.id,
    });

    if (!job) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    application.status = req.body.status;

    await application.save();

    res.json({
      success: true,
      application,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE ALL APPLICATIONS FOR A JOB

app.delete("/job/:jobId/applications", async (req, res) => {
  try {
    const result = await Application.deleteMany({
      jobId: req.params.jobId,
    });

    res.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.listen(process.env.PORT || 5003, () => {
  console.log(`Application service running on ${process.env.PORT || 5003}`);
});
