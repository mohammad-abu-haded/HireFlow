const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  { userId: String },
  { strict: false, timestamps: true },
);

const getJobModel = () => {
  try {
    return mongoose.model("Job");
  } catch {
    return mongoose.model("Job", JobSchema);
  }
};

const needsDuration = ({ jobType, employmentType }) =>
  employmentType === "temporary" ||
  jobType === "contract" ||
  jobType === "internship";

const needsEmploymentType = ({ jobType }) =>
  jobType === "full-time" || jobType === "part-time";

const shuffleArray = (items) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getDeadline = (index) => {
  const deadline = new Date();

  if (index % 5 === 0) {
    deadline.setDate(deadline.getDate() - (3 + index));
  } else {
    deadline.setDate(deadline.getDate() + 20 + index * 2);
  }

  return deadline;
};

const JOB_CONFIGS = [
  {
    jobType: "full-time",
    employmentType: "permanent",
    workSetting: "on-site",
    experienceLevel: "entry",
  },
  {
    jobType: "full-time",
    employmentType: "permanent",
    workSetting: "remote",
    experienceLevel: "mid",
  },
  {
    jobType: "full-time",
    employmentType: "permanent",
    workSetting: "hybrid",
    experienceLevel: "senior",
  },
  {
    jobType: "full-time",
    employmentType: "temporary",
    workSetting: "on-site",
    experienceLevel: "mid",
    duration: "6",
    durationUnit: "Months",
  },
  {
    jobType: "full-time",
    employmentType: "temporary",
    workSetting: "remote",
    experienceLevel: "entry",
    duration: "1",
    durationUnit: "Years",
  },
  {
    jobType: "part-time",
    employmentType: "permanent",
    workSetting: "hybrid",
    experienceLevel: "entry",
  },
  {
    jobType: "part-time",
    employmentType: "permanent",
    workSetting: "on-site",
    experienceLevel: "senior",
  },
  {
    jobType: "part-time",
    employmentType: "temporary",
    workSetting: "remote",
    experienceLevel: "mid",
    duration: "3",
    durationUnit: "Months",
  },
  {
    jobType: "part-time",
    employmentType: "temporary",
    workSetting: "hybrid",
    experienceLevel: "senior",
    duration: "20",
    durationUnit: "Hours",
  },
  {
    jobType: "contract",
    workSetting: "remote",
    experienceLevel: "senior",
    duration: "12",
    durationUnit: "Months",
  },
  {
    jobType: "contract",
    workSetting: "on-site",
    experienceLevel: "entry",
    duration: "2",
    durationUnit: "Years",
  },
  {
    jobType: "contract",
    workSetting: "hybrid",
    experienceLevel: "mid",
    duration: "90",
    durationUnit: "Day",
  },
  {
    jobType: "internship",
    workSetting: "on-site",
    experienceLevel: "entry",
    duration: "3",
    durationUnit: "Months",
  },
  {
    jobType: "internship",
    workSetting: "remote",
    experienceLevel: "mid",
    duration: "6",
    durationUnit: "Months",
  },
  {
    jobType: "internship",
    workSetting: "hybrid",
    experienceLevel: "senior",
    duration: "4",
    durationUnit: "Months",
  },
];

const JOB_TITLES = [
  "Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Data Analyst",
  "QA Engineer",
  "Mobile Developer",
  "Cloud Architect",
  "Security Engineer",
  "Technical Writer",
  "Scrum Master",
  "Machine Learning Engineer",
  "Business Analyst",
];

const LOCATIONS = [
  "San Francisco, CA",
  "New York, NY",
  "Austin, TX",
  "Seattle, WA",
  "Chicago, IL",
  "Boston, MA",
  "Denver, CO",
  "Remote - US",
  "Los Angeles, CA",
  "Miami, FL",
  "Portland, OR",
  "Atlanta, GA",
  "Dallas, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
];

const getCreatedAt = (index) => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 365 + index * 2);
  const createdAt = new Date(now);
  createdAt.setDate(createdAt.getDate() - daysAgo);
  return createdAt;
};

const buildJobDocument = (config, user, index, title, location) => {
  const showEmploymentType = needsEmploymentType(config);
  const showDuration = needsDuration(config);
  const deadline = getDeadline(index);
  const status = deadline < new Date()
    ? "EXPIRED"
    : index % 4 === 0
    ? "CLOSED"
    : "ACTIVE";

  const salaryBase = 50000 + index * 5000;

  return {
    userId: String(user._id),
    jobTitle: title,
    companyName: `${user.userName} Corp`,
    location,
    jobType: config.jobType,
    workSetting: config.workSetting,
    experienceLevel: config.experienceLevel,
    employmentType: showEmploymentType ? config.employmentType : "",
    duration: showDuration ? config.duration : "",
    durationUnit: showDuration ? config.durationUnit : "",
    salaryMin: String(salaryBase),
    salaryMax: String(salaryBase + 30000),
    applicationDeadline: deadline,
    jobDescription: `We are looking for a talented ${title} to join our growing team. This is a ${config.jobType} ${config.workSetting} role at ${config.experienceLevel} level.`,
    keyResponsibilities: [
      "Collaborate with cross-functional teams",
      "Deliver high-quality work on schedule",
      "Participate in code reviews and planning",
    ],
    requirements: [
      `${config.experienceLevel}-level experience in the field`,
      "Strong communication skills",
      "Ability to work independently and in a team",
    ],
    skills: ["JavaScript", "TypeScript", "React", "Node.js"],
    benefits: ["Health insurance", "Flexible hours", "Remote stipend"],
    status,
    createdAt: getCreatedAt(index),
    email: user.email,
    applicationsCount: 0,
  };
};

const createDummyJobsForUser = async (user) => {
  const Job = getJobModel();
  const configs = shuffleArray(JOB_CONFIGS);
  const titles = shuffleArray(JOB_TITLES);
  const locations = shuffleArray(LOCATIONS);

  const jobs = configs.map((config, index) =>
    buildJobDocument(config, user, index, titles[index], locations[index]),
  );

  return Job.insertMany(jobs);
};

const SEED_PASSWORD = "12345678";
const SEED_USER_COUNT = 5;

const seedDummyAccountsAndJobs = async (User, currentUserEmail) => {
  const hashed = await bcrypt.hash(SEED_PASSWORD, 12);
  const results = [];
  const currentEmail = currentUserEmail?.toLowerCase().trim();

  for (let i = 1; i <= SEED_USER_COUNT; i++) {
    const email = `test${i}@domain.com`;
    const userName = `Test User ${i}`;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ userName, email, password: hashed });
    }

    const Job = getJobModel();
    const existingJobs = await Job.countDocuments({ userId: String(user._id) });

    let jobsCreated = 0;
    if (existingJobs === 0) {
      const jobs = await createDummyJobsForUser(user);
      jobsCreated = jobs.length;
    }

    results.push({
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
      password: SEED_PASSWORD,
      jobsCreated,
      skipped: existingJobs > 0,
    });
  }

  if (currentEmail) {
    const existingSeed = results.find(
      (item) =>
        item.user && item.user.email &&
        String(item.user.email).toLowerCase() === currentEmail,
    );

    if (!existingSeed) {
      const currentUser = await User.findOne({ email: currentEmail });
      if (currentUser) {
        const Job = getJobModel();
        const existingJobs = await Job.countDocuments({
          userId: String(currentUser._id),
        });

        let jobsCreated = 0;
        if (existingJobs === 0) {
          const jobs = await createDummyJobsForUser(currentUser);
          jobsCreated = jobs.length;
        }

        results.push({
          user: {
            id: currentUser._id,
            userName: currentUser.userName,
            email: currentUser.email,
          },
          jobsCreated,
          skipped: existingJobs > 0,
          currentUser: true,
        });
      } else {
        results.push({
          email: currentEmail,
          message: "Current user not found",
        });
      }
    }
  }

  return results;
};

module.exports = {
  seedDummyAccountsAndJobs,
  createDummyJobsForUser,
  JOB_CONFIGS,
};
