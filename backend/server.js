const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/jobsDB");

const JobSchema = new mongoose.Schema(
  {},
  { strict: false, timestamps: true },
);
const Job = mongoose.model("Job", JobSchema, "jobs");

app.get("/api/jobs", async (req, res) => {
  const { email } = req.query;

  const jobs = await Job.find(email ? { email } : {})
    .sort({ createdAt: -1 });

  res.json(jobs);
});

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/jobs", async (req, res) => {
  try {
    const newJob = await Job.create(req.body);
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/jobs/:id", async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/jobs/:id", async (req, res) => {
  try {
    console.log("DELETE ID:", req.params.id);

    const job = await Job.findById(req.params.id);
    console.log("FOUND BEFORE DELETE:", job);

    const deletedJob = await Job.findByIdAndDelete(req.params.id);

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
