import { InterviewType, type IInterview } from "../types";

export const initialInterviewState: IInterview = {
  _id: "",
  applicationId: "",
  type: InterviewType.ONLINE,
  scheduledAt: "",
  meetingLink: "",
  location: "",
  createdAt: "",
};