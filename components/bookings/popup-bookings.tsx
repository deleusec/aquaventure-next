"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActivityWithType } from "@/lib/type";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate, formatTime } from "@/lib/utils";

interface BookingDialogProps {
  activity: ActivityWithType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookingDialog({
  activity,
  open,
  onOpenChange,
}: BookingDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBooking = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId: activity.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la réservation");
      }

      // Succès
      router.push("/bookings");
      onOpenChange(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la réservation</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{activity.name}</span>
          </DialogDescription>
          <div className="mt-2 text-sm">
            Le {formatDate(activity.startDateTime)} à{" "}
            {formatTime(activity.startDateTime)}
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleBooking}
            disabled={loading || activity.availableSpots === 0}
          >
            {loading ? "En cours..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
