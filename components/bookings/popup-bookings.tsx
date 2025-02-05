"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Activity, ActivityType } from "@prisma/client";
import { formatDate, formatTime } from "@/lib/utils";

export type ActivityWithType = Activity & {
  activityType: ActivityType;
};

interface ReservationDialogProps {
  activity: ActivityWithType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PopupBookings({
  activity,
  open,
  onOpenChange,
}: ReservationDialogProps) {
  const handleReservation = async () => {
    // TODO: Implémenter la logique de réservation
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la réservation</DialogTitle>
          <DialogDescription>
            Voulez-vous réserver une place pour {activity.name} ?
          </DialogDescription>
          <div className="mt-2 text-sm">
            <p>
              Le {formatDate(activity.startDateTime)} à{" "}
              {formatTime(activity.startDateTime)}
            </p>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleReservation}>Confirmer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
