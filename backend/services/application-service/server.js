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

// ================= MODELS =================

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: String,
    applicantId: String,
    fullName: String,
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

const InterviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["ONLINE", "ONSITE"],
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    meetingLink: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", UserSchema);
const Application = mongoose.model("Application", ApplicationSchema);
const Job = mongoose.model("Job", JobSchema);
const Interview = mongoose.model("Interview", InterviewSchema);

// ================= AUTH =================

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

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

app.get("/applications/:id/cv", authMiddleware, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Not found" });
    }

    const job = await Job.findById(application.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (
      job.userId.toString() !== req.user.id &&
      application.applicantId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!application.cvFile?.path) {
      return res.status(404).json({ message: "No CV found" });
    }

    return res.sendFile(path.join(process.cwd(), application.cvFile.path));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ================= ROUTES =================

// APPLY FOR JOB

app.post(
  "/apply",
  authMiddleware,
  upload.single("cvFile"),
  async (req, res) => {
    try {
      const {
        jobId,
        fullName,
        email,
        location,
        phone,
        linkedIn,
        github,
        coverLetter,
      } = req.body;
      const applicantId = req.user.id;
      if (!jobId || !fullName || !email || !phone || !location) {
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
        location,
        phone,
        linkedIn,
        github,
        coverLetter,
        cvFile: req.file
          ? {
              filename: req.file.filename,
              originalName: req.file.originalname,
              path: req.file.path.replace(/\\/g, "/"),
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

// GET ALL My APPLICATIONS

app.get("/my-applications", authMiddleware, async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit) || 6, 1);
    let page = Math.max(parseInt(req.query.page) || 1, 1);

    const andFilters = [
      {
        applicantId: req.user.id,
      },
    ];

    if (req.query.status) {
      const values = Array.isArray(req.query.status)
        ? req.query.status
        : [req.query.status];

      andFilters.push({
        status: { $in: values },
      });
    }

    const filter =
      andFilters.length === 1 ? andFilters[0] : { $and: andFilters };

    const total = await Application.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    if (page > totalPages) page = totalPages;

    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: applications,
      total,
      page,
      totalPages,
      limit,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.get("/my-interviews", authMiddleware, async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit) || 6, 1);
    let page = Math.max(parseInt(req.query.page) || 1, 1);

    const status = req.query.status;

    const filter = {
      applicantId: req.user.id,
    };

    if (status && (status === "ONLINE" || status === "ONSITE")) {
      filter.type = status;
    }

    const total = await Interview.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    if (page > totalPages) page = totalPages;

    const interviews = await Interview.find(filter)
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const data = interviews.map((i) => ({
      _id: i._id.toString(),
      applicationId: i.applicationId?.toString(),
      applicantId: i.applicantId?.toString(),
      ownerId: i.ownerId?.toString(),
      jobId: i.jobId?.toString(),
      type: i.type,
      scheduledAt: i.scheduledAt,
      meetingLink: i.meetingLink,
      location: i.location,
      createdAt: i.createdAt,
    }));

    res.json({
      data,
      total,
      page,
      totalPages,
      limit,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.get("/my-supervised-interviews", authMiddleware, async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit) || 6, 1);
    let page = Math.max(parseInt(req.query.page) || 1, 1);

    const status = req.query.status || "";
    const search = (req.query.q || "").trim();

    const pipeline = [
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(req.user.id),
        },
      },

      {
        $lookup: {
          from: "applications",
          localField: "applicationId",
          foreignField: "_id",
          as: "application",
        },
      },
      { $unwind: "$application" },

      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
    ];

    // STATUS FILTER
    if (status && ["ONLINE", "ONSITE"].includes(status)) {
      pipeline.push({
        $match: { type: status },
      });
    }

    // SMART SEARCH (AND across words)
    if (search) {
      const words = search.split(/\s+/).filter(Boolean);

      pipeline.push({
        $match: {
          $and: words.map((word) => ({
            $or: [
              // APPLICATION FIELDS
              { "application.fullName": { $regex: word, $options: "i" } },
              { "application.email": { $regex: word, $options: "i" } },
              { "application.location": { $regex: word, $options: "i" } },

              // JOB FIELDS
              { "job.jobTitle": { $regex: word, $options: "i" } },
              { "job.companyName": { $regex: word, $options: "i" } },
              { "job.location": { $regex: word, $options: "i" } },
            ],
          })),
        },
      });
    }

    pipeline.push(
      { $sort: { scheduledAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      }
    );

    const result = await Interview.aggregate(pipeline);

    const data = (result[0]?.data || []).map((i) => ({
      _id: i._id.toString(),
      applicationId: i.applicationId?.toString(),
      applicantId: i.applicantId?.toString(),
      ownerId: i.ownerId?.toString(),
      jobId: i.jobId?.toString(),
      type: i.type,
      scheduledAt: i.scheduledAt,
      meetingLink: i.meetingLink,
      location: i.location,
      createdAt: i.createdAt,
    }));

    const total = result[0]?.totalCount?.[0]?.count || 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    if (page > totalPages) page = totalPages;

    res.json({
      data,
      total,
      page,
      totalPages,
      limit,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET ALL APPLICATIONS FOR MY JOBS

app.get("/", authMiddleware, async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit) || 6, 1);
    let page = Math.max(parseInt(req.query.page) || 1, 1);

    const jobs = await Job.find({
      userId: req.user.id,
    }).select("_id");

    const jobIds = jobs.map((job) => job._id);

    if (!jobIds.length) {
      return res.json({
        data: [],
        total: 0,
        page,
        totalPages: 0,
        limit,
      });
    }

    const andFilters = [
      {
        jobId: { $in: jobIds },
      },
    ];

    if (req.query.q?.trim()) {
      andFilters.push({
        $or: [
          { fullName: { $regex: req.query.q, $options: "i" } },
          { email: { $regex: req.query.q, $options: "i" } },
        ],
      });
    }

    if (req.query.status) {
      const values = Array.isArray(req.query.status)
        ? req.query.status
        : [req.query.status];

      andFilters.push({
        status: { $in: values },
      });
    }

    const filter =
      andFilters.length === 1 ? andFilters[0] : { $and: andFilters };

    const total = await Application.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    if (page > totalPages) page = totalPages;

    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: applications,
      total,
      page,
      totalPages,
      limit,
    });
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
    const { jobId } = req.params;

    const limit = Math.max(parseInt(req.query.limit) || 6, 1);
    let page = Math.max(parseInt(req.query.page) || 1, 1);

    const job = await Job.findOne({
      _id: jobId,
      userId: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const andFilters = [{ jobId }];

    if (req.query.q?.trim()) {
      andFilters.push({
        $or: [
          { fullName: { $regex: req.query.q, $options: "i" } },
          { email: { $regex: req.query.q, $options: "i" } },
        ],
      });
    }

    if (req.query.status) {
      const values = Array.isArray(req.query.status)
        ? req.query.status
        : [req.query.status];

      andFilters.push({
        status: { $in: values },
      });
    }

    const filter =
      andFilters.length === 1 ? andFilters[0] : { $and: andFilters };

    const total = await Application.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    if (page > totalPages) page = totalPages;

    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: applications,
      total,
      page,
      totalPages,
      limit,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// GET TOTAL APPLICATIONS FOR JOB

app.get("/my-jobs/applications/count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const myJobs = await Job.find({ userId }).select("_id");

    const jobIds = myJobs.map((job) => job._id.toString());

    const total = await Application.countDocuments({
      jobId: { $in: jobIds },
    });

    res.json({
      success: true,
      totalApplications: total,
    });
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

// GET TOTAL APPLICATIONS FOR MY JOBS

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
    const { status, interview } = req.body;

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

    const ownerId = job.userId;
    const applicantId = application.applicantId;
    const allowedStatuses = ["PENDING", "INTERVIEW", "ACCEPTED", "REJECTED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    if (status === "INTERVIEW") {
      if (!interview) {
        return res.status(400).json({
          success: false,
          message: "Interview data is required",
        });
      }

      const { type, scheduledAt, meetingLink, location } = interview;

      if (!["ONLINE", "ONSITE"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid interview type",
        });
      }

      if (!scheduledAt) {
        return res.status(400).json({
          success: false,
          message: "Interview date is required",
        });
      }

      const interviewDate = new Date(scheduledAt);

      if (isNaN(interviewDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid interview date",
        });
      }

      if (type === "ONSITE" && !location?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Office location is required",
        });
      }

      if (type === "ONLINE" && !meetingLink?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Meeting Link is required",
        });
      }

      let finalMeetingLink = meetingLink || "";
      let finalLocation = location || "";

      if (type === "ONLINE") {
        finalLocation = "";
      }

      if (type === "ONSITE") {
        finalMeetingLink = "";
      }

      await Interview.findOneAndUpdate(
        { applicationId: application._id },
        {
          applicationId: application._id,
          applicantId,
          jobId: application.jobId,
          ownerId,
          type,
          scheduledAt: interviewDate,
          meetingLink: finalMeetingLink,
          location: finalLocation,
        },
        { upsert: true, new: true },
      );
    } else {
      await Interview.deleteOne({
        applicationId: application._id,
      });
    }

    application.status = status;
    await application.save();

    return res.json({
      success: true,
      application,
    });
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE ALL APPLICATIONS FOR A JOB

app.delete("/job/:jobId/applications", authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({
      _id: jobId,
      userId: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or access denied",
      });
    }

    const result = await Application.deleteMany({
      jobId,
    });

    return res.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.get("/:id/interview", authMiddleware, async (req, res) => {
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

    const interview = await Interview.findOne({
      applicationId: application._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return res.json({
      success: true,
      interview,
    });
  } catch (err) {
    return res.status(500).json({
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

    const job = await Job.findById(application.jobId);

    const isOwner = job && job.userId.toString() === req.user.id;
    const isApplicant = application.applicantId.toString() === req.user.id;

    if (!isOwner && !isApplicant) {
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

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await createApplicationIndexes(mongoose.connection.db);
    const PORT = process.env.PORT;

    app.listen(PORT, () => {
      console.log(`Application service running on ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection error:", err);
  }
};

startServer();
