"use client";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface ActivityType {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  totalActivities: number;
  availableActivitiesCount: number;
  media: {
    id: number;
    url: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export default function ActivityTypesGrid() {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/activities/types?showAvailable=true&limit=8")
      .then((response) => response.json())
      .then((data) => {
        const availableTypes = data.items.filter(
          (type) => type.availableActivitiesCount > 0
        );
        setActivityTypes(availableTypes);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching activity types:", error);
        setIsLoading(false);
      });
  }, []);

  const handleTypeClick = (typeId: number) => {
    router.push(`/activities?activityTypeId=${typeId}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {/* Loading state */}
      </div>
    );
  }

  if (!activityTypes.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Activity className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-xl font-medium text-muted-foreground">
          Aucune activité disponible pour le moment
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Revenez plus tard pour découvrir nos nouvelles activités
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {activityTypes.map((type) => (
        <div
          key={type.id}
          className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer group"
          onClick={() => handleTypeClick(type.id)}
        >
          {type.media && type.media.url ? (
            <div
              className="relative bg-cover bg-center h-64 w-64"
              style={{ backgroundImage: `url(${type.media.url})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 w-full p-4 text-white">
                <h2 className="text-lg font-semibold">{type.name}</h2>
                <p className="hidden mt-2 text-sm group-hover:block">
                  {type.availableActivitiesCount} activités disponibles
                </p>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center h-64 w-64 bg-gray-200">
              <p className="text-gray-500">Aucune image disponible</p>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 w-full p-4 text-white ">
                <h2 className="text-lg font-semibold">{type.name}</h2>
                <p className="hidden mt-2 text-sm group-hover:block">
                  {type.availableActivitiesCount} activités disponibles
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
