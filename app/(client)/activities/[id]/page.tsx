"use client";

import { useState, useEffect } from "react";
import ActivityDetails from "@/components/activities/details";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { ActivityWithType } from "@/lib/type";

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityWithType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        if (id) {
          const res = await fetch(`/api/activities/${id}`);
          if (!res.ok) {
            throw new Error("Erreur lors de la récupération de l'activité");
          }
          const data = await res.json();
          setActivity(data);
        } else {
          throw new Error("ID de l'activité manquant");
        }
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-8">
        <div>Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container py-8">
        <div className="text-red-500">Activité non trouvée</div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <div className="container py-8">
        <ActivityDetails activity={activity} />
      </div>
    </Suspense>
  );
}
