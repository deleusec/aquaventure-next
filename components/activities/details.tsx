"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReservationDialog from "@/components/bookings/popup-bookings";
import { Activity, ActivityType } from "@prisma/client";
import { formatDate, formatTime } from "@/lib/utils";

export type ActivityWithType = Activity & {
  activityType: ActivityType;
  media: { url: string }[];
};

export default function ActivityDetails({
  activity,
}: {
  activity: ActivityWithType;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Partie gauche avec l'image */}
        <div className="md:w-1/2">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux activités
          </Button>

          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={activity.media?.[0]?.url || "/default-activity.jpg"}
              alt={activity.name}
              layout="fill"
              loading="lazy"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Partie droite avec les informations */}
        <div className="md:w-1/2 space-y-6">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-2">
              {activity.activityType.name}
            </Badge>
            <h1 className="text-3xl font-bold">{activity.name}</h1>
          </div>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {formatDate(activity.startDateTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horaire</p>
                <p className="font-medium">
                  {formatTime(activity.startDateTime)} • {activity.duration} min
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Places disponibles
                </p>
                <Badge variant="outline" className="mt-1">
                  {activity.availableSpots} place
                  {activity.availableSpots > 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>

          {activity.description && (
            <>
              <Separator />
              <div>
                <h2 className="font-semibold mb-2">
                  À propos de cette activité
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={() => setIsDialogOpen(true)}
            disabled={activity.availableSpots === 0}
          >
            {activity.availableSpots === 0 ? "Complet" : "Réserver maintenant"}
          </Button>
        </div>
      </div>

      <ReservationDialog
        activity={activity}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
