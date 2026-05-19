export interface IForm {
  _id?: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  workSetting: string;
  experienceLevel: string;
  employmentType: string;
  duration: string;
  salaryMin: string;
  salaryMax: string;
  applicationDeadline: string;
  jobDescription: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  keyResponsibilities: string[];
  status: "ACTIVE" | "CLOSED" | "EXPIRED" | "";
  createdAt: string;
  email: string;
  applicationsCount: number;
  profileViews?: number;
}

export interface IUser {
  email: string;
  password: string;
  userName: string;
}

export interface IApplication {
  id: string;
  jobId: number;
  fullName: string;
  email: string;
  phone: string;
  linkedIn?: string;
  cvFile?: string;
  coverLetter: string;
  appliedAt: string;
}