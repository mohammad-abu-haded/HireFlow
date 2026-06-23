import { InterviewType, type IInterview } from "../types";

export const initialInterviewState: IInterview = {
  _id: "",
  applicationId: "",
  applicantId: "",
  jobId: "",
  ownerId: "",
  type: InterviewType.ONLINE,
  scheduledAt: "",
  meetingLink: "",
  location: "",
  createdAt: "",
};