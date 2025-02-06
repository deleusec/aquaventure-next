"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActivityType {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    activities: number;
  };
}

export default function ActivityTypesGrid() {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/activities/types?limit=8")
      .then((response) => response.json())
      .then((data) => setActivityTypes(data.items))
      .catch((error) => console.error("Error fetching activity types:", error));
  }, []);

  const handleTypeClick = (typeId: number) => {
    // Naviguer vers la page des activités avec un filtre par type
    router.push(`/activities?activityTypeId=${typeId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {activityTypes && activityTypes.length > 0 ? (
        activityTypes.map((type) => (
          <Card
            key={type.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleTypeClick(type.id)}
          >
            <CardHeader>
              <CardTitle>{type.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Activités disponibles
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTypeClick(type.id);
                  }}
                >
                  Voir les activités
                </Button>
              </div>
              <div className="mt-2 text-sm font-medium">
                {type._count?.activities || 0} activité
                {(type._count?.activities || 0) > 1 ? "s" : ""}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center col-span-full text-gray-500">
          Aucun type d'activité trouvé.
        </p>
      )}
    </div>
  );
}
