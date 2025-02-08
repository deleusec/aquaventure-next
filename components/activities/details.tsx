"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReservationDialog from "@/components/bookings/popup-bookings";
import { Activity, ActivityType } from "@prisma/client";
import { formatDate, formatTime } from "@/lib/utils";

export type ActivityWithType = Activity & {
  activityType: ActivityType;
};

export default function ActivityDetails({
  activity,
}: {
  activity: ActivityWithType;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm px-2 py-1 bg-secondary rounded-md">
            {activity.activityType.name}
          </span>
        </div>
        <CardTitle className="text-3xl mb-2">{activity.name}</CardTitle>
        {activity.description && (
          <p className="text-muted-foreground">{activity.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-muted-foreground">
                  {formatDate(activity.startDateTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <div>
                <p className="font-medium">Horaire</p>
                <p className="text-muted-foreground">
                  {formatTime(activity.startDateTime)} ({activity.duration}{" "}
                  minutes)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <div>
                <p className="font-medium">Places disponibles</p>
                <p className="text-muted-foreground">
                  {activity.availableSpots} place
                  {activity.availableSpots > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between space-x-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Retour
        </Button>
        <Button
          className="flex-1"
          onClick={() => setIsDialogOpen(true)}
          disabled={activity.availableSpots === 0}
        >
          {activity.availableSpots === 0 ? "Complet" : "Réserver"}
        </Button>
      </CardFooter>

      <ReservationDialog
        activity={activity}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </Card>
  );
}
