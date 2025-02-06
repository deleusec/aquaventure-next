"use client";

import { Button } from "@/components/ui/button";

interface ActivityCardProps {
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

export default function ActivityCard({ activity }: { activity: ActivityCardProps }) {
  const startDate = new Date(activity.startDateTime).toLocaleDateString();
  const startTime = new Date(activity.startDateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition duration-300 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold text-primary mb-2">{activity.name}</h2>
        <p className="text-sm text-gray-600 mb-4">{activity.description}</p>

        <div className="text-sm text-gray-500 space-y-1">
          <p>
            <strong>Type:</strong> {activity.activityType.name}
          </p>
          <p>
            <strong>Date:</strong> {startDate} at {startTime}
          </p>
          <p>
            <strong>Duration:</strong> {activity.duration} mins
          </p>
          <p>
            <strong>Available Spots:</strong> {activity.availableSpots}
          </p>
        </div>
      </div>

      <Button variant="primary" size="sm" className="mt-4 w-full">
        Book Now
      </Button>
    </div>
  );
}
