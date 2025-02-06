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
import { useSearchParams } from "next/navigation";
import { MultiSelect } from "@/components/activities/multi-select";

type ActivityWithType = Activity & {
  activityType: ActivityType;
  startDateTime: Date | string;
};
type ActivityTypeOption = {
  value: string;
  label: string;
};
export default function Activities() {
  const [activities, setActivities] = useState<ActivityWithType[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityTypeOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const searchParams = useSearchParams();

  // Fetch activity types
  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const res = await fetch("/api/activities/types");
        const data = await res.json();

        if (data && data.items) {
            const transformedTypes = data.items.map((type: ActivityType) => ({
              value: type.id.toString(),
              label: type.name,
            }));
            setActivityTypes(transformedTypes);
        }else {
          setActivityTypes([]);
        }
      } catch (error) {
        console.error("Erreur de récupération des types:", error);
      }
    };

    fetchActivityTypes();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [search, selectedTypes]);

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();

      // Log pour déboguer
      console.log("Search:", search);
      console.log("Selected Types:", selectedTypes);

      // Ajouter la recherche si présente
      if (search) params.append("search", search);

      // Ajouter les types sélectionnés
      if (selectedTypes.length > 0) {
        selectedTypes.forEach((typeId) => {
          console.log("Appending activityTypeIds:", typeId);
          params.append("activityTypeIds", typeId);
        });
      }

      // Log de l'URL complète
      const fullUrl = `/api/activities?${params.toString()}`;
      console.log("Fetch URL:", fullUrl);

      // Faire la requête
      const res = await fetch(fullUrl);
      const data = await res.json();

      console.log("Fetched data:", data);
      setActivities(data.items);
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
      <div className="mb-8 flex gap-4">
        <Input
          type="text"
          placeholder="Rechercher une activité..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md flex-grow"
        />

        <MultiSelect
          options={activityTypes}
          onValueChange={setSelectedTypes}
          defaultValue={selectedTypes}
          placeholder="Filtrer par type"
          variant="inverted"
          animation={0.5}
          maxCount={3}
        />
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(activities) && activities.length > 0 ? (
            activities.map((activity) => (
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
            ))
          ) : (
            <div>Aucune activité trouvée</div>
          )}
        </div>
      )}
    </div>
  );
}
