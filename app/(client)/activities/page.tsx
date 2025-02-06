"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activities, setActivities] = useState<ActivityWithType[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityTypeOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const updateUrlWithTypes = (newTypes: string[]) => {
    const current = new URLSearchParams(window.location.search);
    current.delete("activityTypeId");
    newTypes.forEach((typeId) => {
      current.append("activityTypeId", typeId);
    });
    const search = current.toString();
    const newUrl = `${window.location.pathname}${search ? `?${search}` : ""}`;
    router.push(newUrl);
  };

  const handleTypeChange = (newTypes: string[]) => {
    setSelectedTypes(newTypes);
    if (newTypes.length === 0 || newTypes.length === activityTypes.length) {
      const current = new URLSearchParams(window.location.search);
      current.delete("activityTypeId");
      const newUrl = `${window.location.pathname}${
        current.toString() ? `?${current.toString()}` : ""
      }`;
      router.push(newUrl);
    } else {
      updateUrlWithTypes(newTypes);
    }
  };

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

          // Réinitialiser la sélection après le chargement des types
          const typeIds = searchParams.getAll("activityTypeId");
          if (typeIds.length > 0) {
            setSelectedTypes([...typeIds]);
          }
        } else {
          setActivityTypes([]);
        }
      } catch (error) {
        console.error("Erreur de récupération des types:", error);
        setActivityTypes([]);
      }
    };

    fetchActivityTypes();
  }, []); // Une seule fois au montage

  useEffect(() => {
    console.log("selectedTypes", selectedTypes);
    fetchActivities();
  }, [search, selectedTypes, page]);

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (search) {
        params.append("search", search);
      }
      console.log("jsute avant", selectedTypes);
      if (
        selectedTypes.length > 0 &&
        selectedTypes.length !== activityTypes.length
      ) {
        selectedTypes.forEach((typeId) => {
          params.append("activityTypeIds", typeId);
        });
      }

      const res = await fetch(`/api/activities?${params.toString()}`);
      const data = await res.json();

      setActivities(data.items);
      setTotalItems(data.total);
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
    <div className="container py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="shrink-0 mb-8 flex gap-4">
        <Input
          type="text"
          placeholder="Rechercher une activité..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md flex-grow"
        />

        <MultiSelect
          options={activityTypes}
          onValueChange={handleTypeChange}
          value={selectedTypes}
          placeholder="Filtrer par type"
          variant="inverted"
          animation={0.5}
          maxCount={3}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {loading ? (
          <div>Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
                        {formatTime(activity.startDateTime)} -{" "}
                        {activity.duration}
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
              <div className="col-span-full text-center">
                Aucune activité trouvée
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 pt-4 border-t mt-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalItems} activité{totalItems !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm">
                Page {page} sur {totalPages || 1}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
