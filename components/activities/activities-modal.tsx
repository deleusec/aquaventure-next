"use client";

import { useState, useEffect } from "react";
import { ActivityType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NewActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function NewActivityModal({
  open,
  onOpenChange,
  onSuccess,
}: NewActivityModalProps) {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    activityTypeId: "",
    availableSpots: "",
    description: "",
    startDateTime: "",
    duration: "",
  });
  const [error, setError] = useState("");
  const [isNewTypeDialogOpen, setIsNewTypeDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  const fetchActivityTypes = async () => {
    try {
      const res = await fetch("/api/activities/types");
      if (!res.ok) throw new Error();
      const data = await res.json();
      // S'assurer que data.items existe, sinon utiliser un tableau vide
      setActivityTypes(data.items || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      onSuccess?.();
      onOpenChange(false);
      // Réinitialiser le formulaire
      setFormData({
        name: "",
        activityTypeId: "",
        availableSpots: "",
        description: "",
        startDateTime: "",
        duration: "",
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/activities/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName }),
      });

      if (!res.ok) throw new Error();

      await fetchActivityTypes();
      setNewTypeName("");
      setIsNewTypeDialogOpen(false);
    } catch (error) {
      setError("Erreur lors de la création du type");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle Activité</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
            <div className="flex gap-2">
              <Select
                value={formData.activityTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, activityTypeId: value })
                }
              >
                <SelectTrigger className="flex-1">
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
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsNewTypeDialogOpen(true)}
              >
                + Type
              </Button>
            </div>
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
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </DialogContent>

      <Dialog open={isNewTypeDialogOpen} onOpenChange={setIsNewTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau Type d'Activité</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateType} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typeName">Nom du type</Label>
              <Input
                id="typeName"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewTypeDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}