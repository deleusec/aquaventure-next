// app/activities/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, ActivityType } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";

type ActivityWithType = Activity & {
  activityType: ActivityType;
  startDateTime: Date | string;
};

export default function Activities() {
  const [activities, setActivities] = useState<ActivityWithType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [search]);

  const fetchActivities = async () => {
    try {
      const searchParams = new URLSearchParams();
      if (search) searchParams.append("search", search);
      const res = await fetch(`/api/activities?${searchParams.toString()}`);
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

    const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    };

    const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
    };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Rechercher une activité..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card
              key={activity.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle>{activity.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {activity.activityType.name}
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {formatDate(activity.startDateTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {formatTime(activity.startDateTime)} - {activity.duration}
                    min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    {activity.availableSpots} places disponibles
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/activities/${activity.id}`}>
                    Voir les détails
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
