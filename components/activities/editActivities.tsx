// app/admin/activities/components/edit-activity-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Activity, ActivityType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityWithType extends Activity {
  activityType: ActivityType;
}

interface EditActivityModalProps {
  activity: ActivityWithType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditActivityModal({
  activity,
  open,
  onOpenChange,
  onSuccess,
}: EditActivityModalProps) {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    activityTypeId: "",
    availableSpots: "",
    description: "",
    startDateTime: "",
    duration: "",
  });

  const fetchActivityTypes = async () => {
    try {
      const res = await fetch("/api/activities/types");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActivityTypes(data.items || []); // Assurez-vous d'utiliser data.items
    } catch (error) {
      console.error("Erreur lors du chargement des types:", error);
      setActivityTypes([]); // Initialiser avec un tableau vide en cas d'erreur
    }
  };

  useEffect(() => {
    if (open) {
      fetchActivityTypes();
    }
  }, [open]);

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name,
        activityTypeId: activity.activityTypeId.toString(),
        availableSpots: activity.availableSpots.toString(),
        description: activity.description || "",
        startDateTime: new Date(activity.startDateTime)
          .toISOString()
          .slice(0, 16),
        duration: activity.duration.toString(),
      });
    }
  }, [activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'activité</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityType">Type d'activité</Label>
            <Select
              value={formData.activityTypeId}
              onValueChange={(value) =>
                setFormData({ ...formData, activityTypeId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(activityTypes) &&
                  activityTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availableSpots">Places disponibles</Label>
            <Input
              id="availableSpots"
              type="number"
              min="1"
              value={formData.availableSpots}
              onChange={(e) =>
                setFormData({ ...formData, availableSpots: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDateTime">Date et heure de début</Label>
            <Input
              id="startDateTime"
              type="datetime-local"
              value={formData.startDateTime}
              onChange={(e) =>
                setFormData({ ...formData, startDateTime: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée (en minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
