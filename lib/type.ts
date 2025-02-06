
import { Activity, ActivityType } from "@prisma/client";

export type ActivityWithType = Activity & {
  activityType: ActivityType;
  startDateTime: Date | string;
};
