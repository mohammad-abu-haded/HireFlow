import type { IForm } from "../types";

export  const getStatus = (job: IForm | undefined): IForm["status"] => {
  if(!job) {
    return ''
  }
    if (job.status === "CLOSED") return "CLOSED";

    if (new Date() > new Date(job.applicationDeadline)) {
      return "EXPIRED";
    }

    return "ACTIVE";
  };