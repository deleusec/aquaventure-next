"use client";

import { useEffect, useState } from "react";
import ActivityCard from "./activity-card";

interface Activity {
  id: string;
  name: string;
  description: string;
  availableSpots: number;
  activityTypeId: number;
  startDateTime: string;
  duration: number;
  activityType: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function ActivitiesGrid() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetch("/api/activities?limit=8")
      .then((response) => response.json())
      .then((data) => setActivities(data.items)) // ✅ Correction : on accède à data.items
      .catch((error) => console.error("Error fetching activities:", error));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {activities.length > 0 ? (
        activities.map((activity : Activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))
      ) : (
        <p className="text-center col-span-full text-gray-500">
          No activities found.
        </p>
      )}
    </div>
  );
}
