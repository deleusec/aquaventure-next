"use client"
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/activities/types?limit=8")
      .then((response) => response.json())
      .then((data) => {
        setActivityTypes(data.items);
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
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {activityTypes && activityTypes.length > 0 ? (
        activityTypes.map((type) => (
          <Card
            key={type.id}
            className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary"
            onClick={() => handleTypeClick(type.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {type.name}
                </CardTitle>
                <Activity className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                Activités disponibles dans cette catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm">
                  {type._count?.activities || 0} activité
                  {(type._count?.activities || 0) > 1 ? "s" : ""}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group-hover:translate-x-1 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTypeClick(type.id);
                  }}
                >
                  Explorer <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-xl font-medium text-muted-foreground">
            Aucun type d&apos;activité trouvé.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Les types d&apos;activités apparaîtront ici une fois créés
          </p>
        </div>
      )}
    </div>
  );
}