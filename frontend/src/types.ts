export interface IForm {
  _id?: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: JobType;
  employmentType: EmploymentType;
  workSetting: WorkSetting;
  experienceLevel: ExperienceLevel;
  duration: string;
  salaryMin: string;
  salaryMax: string;
  applicationDeadline: string;
  jobDescription: string;
  keyResponsibilities: string[];
  requirements: string[];
  skills: string[];
  benefits: string[];
  status: JobDetailStatus;
  createdAt: string;
  email: string;
  applicationsCount: number;
  profileViews?: number;
}

export type JobCardProps = Pick<
  IForm,
  | "_id"
  | "jobTitle"
  | "companyName"
  | "location"
  | "jobType"
  | "employmentType"
  | "workSetting"
  | "experienceLevel"
  | "duration"
  | "salaryMin"
  | "salaryMax"
  | "applicationDeadline"
  | "createdAt"
>;

export interface IUser {
  email: string;
  password: string;
  userName: string;
}

export interface IApplication {
  _id: string;
  jobId: number;
  fullName: string;
  email: string;
  phone: string;
  linkedIn?: string;
  cvFile?: string;
  coverLetter: string;
  appliedAt: string;
  status: ApplicationStatus;
}

export interface FilterItem {
  id: string;
  label: string;
}

export interface FilterSection {
  id: string;
  title: string;
  items: FilterItem[];
}

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";

export type JobDetailSectionType =
  | "DESCRIPTION"
  | "KEY_RESPONSIBILITIES"
  | "REQUIREMENTS"
  | "SKILLS";

export type JobDetailStatus = "ACTIVE" | "CLOSED" | "EXPIRED" | "";

export type JobType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "";

export type WorkSetting = "on-site" | "remote" | "hybrid" | "";

export type ExperienceLevel = "entry" | "mid" | "senior" | "";

export type EmploymentType = "permanent" | "temporary" | "";

export type NotificationType = "success" | "error" | "info";
