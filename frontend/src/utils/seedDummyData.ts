const AUTH_API = "http://localhost:5000/auth";
const JOBS_API = "http://localhost:5000/jobs";
const APPLICATIONS_API = "http://localhost:5000/applications";

export interface SeedDevAccountsResponse {
  success: boolean;
  message?: string;
  otpExpiresAt?: number;
  accounts?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface SeedApplicationsResponse {
  success: boolean;
  message?: string;
  applicationsCreated?: number;
  [key: string]: unknown;
}

// Application statuses with mixed distribution
type ApplicationStatus = "PENDING" | "INTERVIEW" | "ACCEPTED" | "REJECTED";
type InterviewType = "ONLINE" | "ONSITE";

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "PENDING",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
];

const INTERVIEW_TYPES: InterviewType[] = ["ONLINE", "ONSITE"];

const FULL_NAMES = [
  "John Smith",
  "Emma Johnson",
  "Michael Brown",
  "Sarah Williams",
  "David Lee",
  "Lisa Anderson",
  "James Martinez",
  "Jessica Taylor",
  "Robert Garcia",
  "Emily Davis",
];

const LOCATIONS = [
  "San Francisco, CA",
  "New York, NY",
  "Austin, TX",
  "Seattle, WA",
  "Chicago, IL",
  "Boston, MA",
  "Denver, CO",
  "Los Angeles, CA",
  "Miami, FL",
  "Portland, OR",
];

const PHONE_NUMBERS = [
  "+972592567428",
];

const COVER_LETTERS = [
  "I am very interested in this position and believe my skills align well with your requirements.",
  "This opportunity excites me and I am confident I can contribute significantly to your team.",
  "With my background and experience, I am well-positioned to excel in this role.",
  "I am passionate about this industry and eager to bring my expertise to your organization.",
  "Your company's mission resonates with me and I would love to be part of your team.",
];

const LINKEDIN_PROFILES = [
  "https://www.linkedin.com/in/mohammad-abu-haded",
];

const GITHUB_PROFILES = [
  "https://github.com/mohammad-abu-haded",
];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getScheduledAt = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + getRandomInt(7, 30));
  date.setHours(getRandomInt(9, 17), 0, 0, 0);
  return date.toISOString();
};

const generateApplicationsForUser = async (
  applicantToken: string,
  targetJobs: any[],
  applicantEmail: string,
): Promise<number> => {
  let applicationsCreated = 0;

  if (targetJobs.length === 0) return 0;

  // Determine job count: at least 1, up to 5
  const minJobs = Math.min(1, targetJobs.length);
  const maxJobs = Math.min(5, targetJobs.length);
  const jobsCount = getRandomInt(minJobs, maxJobs);
  const selectedJobs = targetJobs.sort(() => Math.random() - 0.5).slice(0, jobsCount);

  for (const job of selectedJobs) {
    try {
      const fullName = getRandomItem(FULL_NAMES);
      const email = applicantEmail;
      const location = getRandomItem(LOCATIONS);
      const phone = getRandomItem(PHONE_NUMBERS);
      const linkedIn = Math.random() > 0.3 ? getRandomItem(LINKEDIN_PROFILES) : "";
      const github = Math.random() > 0.4 ? getRandomItem(GITHUB_PROFILES) : "";
      const coverLetter = getRandomItem(COVER_LETTERS);

      const formData = new FormData();
      formData.append("jobId", job._id);
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("location", location);
      formData.append("phone", phone);
      formData.append("linkedIn", linkedIn);
      formData.append("github", github);
      formData.append("coverLetter", coverLetter);

      const applyRes = await fetch(`${APPLICATIONS_API}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${applicantToken}`,
        },
        body: formData,
      });

      if (!applyRes.ok) {
        console.error(`Failed to apply for job ${job._id}: ${applyRes.status}`);
        continue;
      }

      const applyData = (await applyRes.json()) as { application?: { _id: string } };
      if (!applyData.application?._id) {
        console.error("No application ID returned");
        continue;
      }

      applicationsCreated++;
      console.debug(`Created application for job ${job._id}`);
    } catch (err) {
      console.error("Error during application process:", err);
    }
  }

  return applicationsCreated;
};

const updateApplicationStatusesForJobOwner = async (
  ownerToken: string,
  ownJobs: any[],
  isCurrentUser: boolean,
  currentUserAppStatuses: Set<string>,
  currentUserInterviewTypes: Set<string>,
  currentUserEmail: string | null,
  currentUserApplicationStatuses: Set<string>,
): Promise<number> => {
  let statusUpdatesCreated = 0;

  const ALL_STATUSES = ["PENDING", "INTERVIEW", "ACCEPTED", "REJECTED"];
  const ALL_INTERVIEW_TYPES = ["ONLINE", "ONSITE"];

  for (const job of ownJobs) {
    try {
      // Fetch applications for this job
      const applicationsRes = await fetch(
        `${APPLICATIONS_API}/job/${job._id}?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
        },
      );

      if (!applicationsRes.ok) {
        console.warn(`Failed to fetch applications for job ${job._id}`);
        continue;
      }

      const applicationsData = (await applicationsRes.json()) as { data?: any[] };
      if (!applicationsData.data || applicationsData.data.length === 0) continue;

      const applications = applicationsData.data;
      const updatedIndices = new Set<number>();

      // If current user is job owner, ensure they receive all application statuses
      if (isCurrentUser) {
        // Ensure all application statuses received
        for (const status of ALL_STATUSES) {
          if (currentUserAppStatuses.has(status)) continue;
          if (updatedIndices.size >= applications.length) break;

          let appIndex = -1;
          for (let i = 0; i < applications.length; i++) {
            if (!updatedIndices.has(i)) {
              appIndex = i;
              break;
            }
          }

          if (appIndex === -1) break;

          const application = applications[appIndex];

          if (status === "INTERVIEW") {
            // Ensure all interview types
            for (const interviewType of ALL_INTERVIEW_TYPES) {
              if (currentUserInterviewTypes.has(interviewType)) continue;
              if (updatedIndices.size >= applications.length) break;

              let intAppIndex = -1;
              for (let i = 0; i < applications.length; i++) {
                if (!updatedIndices.has(i)) {
                  intAppIndex = i;
                  break;
                }
              }

              if (intAppIndex === -1) break;

              const intApplication = applications[intAppIndex];
              const scheduledAt = getScheduledAt();
              const meetingLink =
                interviewType === "ONLINE"
                  ? `https://meet.google.com/xxx-xxxx-xxx-${Math.random().toString(36).substr(2, 9)}`
                  : "";
              const location = interviewType === "ONSITE" ? getRandomItem(LOCATIONS) : "";

              const statusRes = await fetch(
                `${APPLICATIONS_API}/${intApplication._id}/status`,
                {
                  method: "PATCH",
                  headers: {
                    Authorization: `Bearer ${ownerToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    status: "INTERVIEW",
                    interview: {
                      type: interviewType,
                      scheduledAt,
                      meetingLink,
                      location,
                    },
                  }),
                },
              );

              if (statusRes.ok) {
                currentUserInterviewTypes.add(interviewType);
                statusUpdatesCreated++;
                updatedIndices.add(intAppIndex);
                console.debug(
                  `Created ${interviewType} interview for current user on job ${job._id}`,
                );
              }
            }
          } else {
            // Other statuses (PENDING, ACCEPTED, REJECTED)
            const statusRes = await fetch(
              `${APPLICATIONS_API}/${application._id}/status`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${ownerToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
              },
            );

            if (statusRes.ok) {
              currentUserAppStatuses.add(status);
              statusUpdatesCreated++;
              updatedIndices.add(appIndex);
              console.debug(`Created ${status} application for current user on job ${job._id}`);
            }
          }
        }
      } else if (currentUserEmail) {
        // Ensure current user's applications get all statuses
        const currentUserAppIndices: number[] = [];
        for (let i = 0; i < applications.length; i++) {
          const app = applications[i];
          if (app.email && app.email.includes("applicant-")) {
            currentUserAppIndices.push(i);
          }
        }

        const applicationsForCurrentUser = currentUserAppIndices.slice(0, 4);
        
        for (let idx = 0; idx < applicationsForCurrentUser.length; idx++) {
          if (idx >= ALL_STATUSES.length) break;
          
          const status = ALL_STATUSES[idx];
          if (currentUserApplicationStatuses.has(status)) continue;

          const appIndex = applicationsForCurrentUser[idx];
          const application = applications[appIndex];

          if (status === "INTERVIEW") {
            const interviewType = idx === 0 ? "ONLINE" : "ONSITE";
            const scheduledAt = getScheduledAt();
            const meetingLink =
              interviewType === "ONLINE"
                ? `https://meet.google.com/xxx-xxxx-xxx-${Math.random().toString(36).substr(2, 9)}`
                : "";
            const location = interviewType === "ONSITE" ? getRandomItem(LOCATIONS) : "";

            const statusRes = await fetch(
              `${APPLICATIONS_API}/${application._id}/status`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${ownerToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status: "INTERVIEW",
                  interview: {
                    type: interviewType,
                    scheduledAt,
                    meetingLink,
                    location,
                  },
                }),
              },
            );

            if (statusRes.ok) {
              currentUserApplicationStatuses.add(status);
              statusUpdatesCreated++;
              updatedIndices.add(appIndex);
              console.debug(`Created ${interviewType} interview for current user application`);
            }
          } else {
            const statusRes = await fetch(
              `${APPLICATIONS_API}/${application._id}/status`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${ownerToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
              },
            );

            if (statusRes.ok) {
              currentUserApplicationStatuses.add(status);
              statusUpdatesCreated++;
              updatedIndices.add(appIndex);
              console.debug(`Created ${status} status for current user application`);
            }
          }
        }
      }

      // Original logic for other users
      if (!isCurrentUser) {
        let hasOnlineInterview = false;
        let hasOnsiteInterview = false;

        if (!hasOnlineInterview && applications.length > updatedIndices.size) {
          let onlineIndex = getRandomInt(0, applications.length - 1);
          while (updatedIndices.has(onlineIndex) && applications.length > updatedIndices.size) {
            onlineIndex = getRandomInt(0, applications.length - 1);
          }
          const application = applications[onlineIndex];
          
          const scheduledAt = getScheduledAt();
          const meetingLink = `https://meet.google.com/xxx-xxxx-xxx-${Math.random().toString(36).substr(2, 9)}`;

          const statusRes = await fetch(
            `${APPLICATIONS_API}/${application._id}/status`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${ownerToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "INTERVIEW",
                interview: {
                  type: "ONLINE",
                  scheduledAt,
                  meetingLink,
                  location: "",
                },
              }),
            },
          );

          if (statusRes.ok) {
            hasOnlineInterview = true;
            statusUpdatesCreated++;
            updatedIndices.add(onlineIndex);
            console.debug(`Created ONLINE interview for job ${job._id}`);
          }
        }

        if (!hasOnsiteInterview && applications.length > updatedIndices.size) {
          let onsiteIndex = getRandomInt(0, applications.length - 1);
          while (updatedIndices.has(onsiteIndex) && applications.length > updatedIndices.size) {
            onsiteIndex = getRandomInt(0, applications.length - 1);
          }
          const application = applications[onsiteIndex];
          
          const scheduledAt = getScheduledAt();
          const location = getRandomItem(LOCATIONS);

          const statusRes = await fetch(
            `${APPLICATIONS_API}/${application._id}/status`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${ownerToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "INTERVIEW",
                interview: {
                  type: "ONSITE",
                  scheduledAt,
                  meetingLink: "",
                  location,
                },
              }),
            },
          );

          if (statusRes.ok) {
            hasOnsiteInterview = true;
            statusUpdatesCreated++;
            updatedIndices.add(onsiteIndex);
            console.debug(`Created ONSITE interview for job ${job._id}`);
          }
        }
      }

      // Update remaining applications randomly
      const remainingApplications = applications.filter((_, idx) => !updatedIndices.has(idx));
      const applicationsToUpdateRandom = remainingApplications
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.max(1, Math.floor(remainingApplications.length / 2)));

      for (const application of applicationsToUpdateRandom) {
        try {
          const status = getRandomItem(APPLICATION_STATUSES);
          const statusUpdateBody: Record<string, unknown> = { status };

          if (status === "INTERVIEW") {
            const interviewType = getRandomItem(INTERVIEW_TYPES);
            const scheduledAt = getScheduledAt();
            const meetingLink =
              interviewType === "ONLINE"
                ? `https://meet.google.com/xxx-xxxx-xxx-${Math.random().toString(36).substr(2, 9)}`
                : "";
            const location = interviewType === "ONSITE" ? getRandomItem(LOCATIONS) : "";

            statusUpdateBody.interview = {
              type: interviewType,
              scheduledAt,
              meetingLink,
              location,
            };
          }

          const statusRes = await fetch(
            `${APPLICATIONS_API}/${application._id}/status`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${ownerToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(statusUpdateBody),
            },
          );

          if (statusRes.ok) {
            statusUpdatesCreated++;
          }
        } catch (err) {
          console.debug("Error updating application status:", err);
        }
      }
    } catch (err) {
      console.error("Error processing job applications:", err);
    }
  }

  return statusUpdatesCreated;
};

const getJobsForUser = async (token: string): Promise<any[]> => {
  try {
    const res = await fetch(`${JOBS_API}/range?page=1&limit=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch jobs:", res.status);
      return [];
    }
    const data = (await res.json()) as { data?: any[] };
    return data.data || [];
  } catch (err) {
    console.error("Error fetching user jobs:", err);
    return [];
  }
};

export async function seedDevAccounts(
  currentUserEmail?: string,
): Promise<SeedDevAccountsResponse> {
  const body = currentUserEmail ? { email: currentUserEmail } : undefined;

  const res = await fetch(`${AUTH_API}/dev/seed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json()) as SeedDevAccountsResponse;

  if (!res.ok) {
    throw new Error(data.message || "Failed to seed development accounts.");
  }

  return data;
}

export async function seedApplications(currentUserEmail?: string): Promise<SeedApplicationsResponse> {
  const TEST_USERS = [
    { email: "test1@domain.com", password: "12345678" },
    { email: "test2@domain.com", password: "12345678" },
    { email: "test3@domain.com", password: "12345678" },
    { email: "test4@domain.com", password: "12345678" },
    { email: "test5@domain.com", password: "12345678" },
  ];

  let totalApplicationsCreated = 0;
  let totalInterviewsCreated = 0;

  try {

    // Collect all users (test users + current user if provided) and seed applications
    const allUsersToSeed = [...TEST_USERS];
    const currentUserExists = currentUserEmail && !TEST_USERS.some((u) => u.email === currentUserEmail);

    if (currentUserExists) {
      allUsersToSeed.push({ email: currentUserEmail, password: "" });
    }

    // Phase 1: Login and collect all jobs from all users
    const userJobsMap = new Map<string, { token: string; jobs: any[] }>();

    for (const user of allUsersToSeed) {
      try {
        let token = "";

        if (user.email === currentUserEmail) {
          token = localStorage.getItem("token") || "";
        } else {
          const loginRes = await fetch(`${AUTH_API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              password: user.password,
            }),
          });

          if (!loginRes.ok) {
            console.error(`Failed to login as ${user.email}`);
            continue;
          }

          const loginData = (await loginRes.json()) as { token?: string };
          token = loginData.token || "";
        }

        if (!token) {
          console.warn(`No token obtained for ${user.email}`);
          continue;
        }

        const jobs = await getJobsForUser(token);
        userJobsMap.set(user.email, { token, jobs });
      } catch (err) {
        console.error(`Error processing user ${user.email}:`, err);
      }
    }

    if (userJobsMap.size === 0) {
      return {
        success: false,
        message: "No users with jobs found to seed applications.",
      };
    }

    // Track statuses for current user (as recipient and as applicant)
    const currentUserAppStatuses = new Set<string>();
    const currentUserInterviewTypes = new Set<string>();
    const currentUserApplicationStatuses = new Set<string>();

    // Phase 2: For each user, have all other users apply to their jobs and update statuses
    for (const [ownerEmail, ownerData] of userJobsMap) {
      if (ownerData.jobs.length === 0) continue;

      // All other users apply to this job owner's jobs
      for (const [applicantUserEmail, applicantData] of userJobsMap) {
        if (applicantUserEmail === ownerEmail) continue;


        const applicationsCount = await generateApplicationsForUser(
          applicantData.token,
          ownerData.jobs,
          applicantUserEmail,
        );
        totalApplicationsCreated += applicationsCount;
      }

      // Update applications with different statuses
      const isCurrentUserOwner = ownerEmail === currentUserEmail;
      const hasCurrentUserApplications = currentUserEmail && ownerEmail !== currentUserEmail;

      const statusUpdates = await updateApplicationStatusesForJobOwner(
        ownerData.token,
        ownerData.jobs,
        isCurrentUserOwner,
        currentUserAppStatuses,
        currentUserInterviewTypes,
        hasCurrentUserApplications ? currentUserEmail : null,
        currentUserApplicationStatuses,
      );
      totalInterviewsCreated += statusUpdates;
    }

    return {
      success: true,
      message: `Successfully created ${totalApplicationsCreated} applications with ${totalInterviewsCreated} status updates.`,
      applicationsCreated: totalApplicationsCreated,
    };
  } catch (err) {
    console.error("seedApplications error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to seed applications.",
    };
  }
}
