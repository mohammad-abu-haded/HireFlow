require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

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
        path.extname(file.originalname)
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
      cb(
        new Error(
          "Only PDF, DOC and DOCX files are allowed"
        )
      );
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
  { strict: false, timestamps: true }
);

const JobSchema = new mongoose.Schema(
  {
    userId: String,
  },
  { strict: false }
);

const Application = mongoose.model(
  "Application",
  ApplicationSchema
);

const Job = mongoose.model("Job", JobSchema);

// ================= AUTH =================

const authMiddleware = (
  req,
  res,
  next
) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

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
  upload.single("resume"),
  async (req, res) => {
    try {
      const {
        jobId,
        applicantId,
        fullName,
        email,
        phoneNumber,
        linkedinProfile,
        coverLetter,
      } = req.body;

      if (
        !jobId ||
        !fullName ||
        !email ||
        !phoneNumber
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const application =
        await Application.create({
          jobId,
          applicantId,
          fullName,
          email,
          phoneNumber,
          linkedinProfile,
          coverLetter,
          resume: req.file
            ? {
                filename:
                  req.file.filename,
                originalName:
                  req.file.originalname,
                path: req.file.path,
                mimetype:
                  req.file.mimetype,
                size: req.file.size,
              }
            : null,
          status: "PENDING",
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
  }
);

// GET ALL APPLICATIONS FOR MY JOBS

app.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const jobs = await Job.find({
        userId: req.user.id,
      }).select("_id");

      const jobIds = jobs.map((job) =>
        job._id.toString()
      );

      const applications =
        await Application.find({
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
  }
);

// GET APPLICATIONS FOR SPECIFIC JOB

app.get(
  "/job/:jobId",
  authMiddleware,
  async (req, res) => {
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

      const applications =
        await Application.find({
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
  }
);

// GET ONE APPLICATION

app.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const application =
        await Application.findById(
          req.params.id
        );

      if (!application) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found",
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
  }
);

// UPDATE APPLICATION STATUS

app.patch(
  "/:id/status",
  authMiddleware,
  async (req, res) => {
    try {
      const application =
        await Application.findById(
          req.params.id
        );

      if (!application) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found",
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

      application.status =
        req.body.status;

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
  }
);

app.listen(
  process.env.PORT || 5003,
  () => {
    console.log(
      `Application service running on ${
        process.env.PORT || 5003
      }`
    );
  }
);