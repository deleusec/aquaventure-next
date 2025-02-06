"use client";

import { useState, useEffect } from "react";
import { Activity, ActivityType, Media } from "@prisma/client";
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
import Image from "next/image";

interface ActivityWithType extends Activity {
  activityType: ActivityType;
  media?: Media;
}

interface ActivityModalProps {
  activity?: ActivityWithType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ActivityModal({
  activity,
  open,
  onOpenChange,
  onSuccess,
}: ActivityModalProps) {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    activityTypeId: "",
    availableSpots: "",
    description: "",
    startDateTime: "",
    duration: "",
  });
  const [isNewTypeDialogOpen, setIsNewTypeDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  // Récupération des types d'activités
  const fetchActivityTypes = async () => {
    try {
      const res = await fetch("/api/activities/types");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActivityTypes(data.items || []);
    } catch (error) {
      console.error("Erreur lors du chargement des types:", error);
      setActivityTypes([]);
    }
  };

  useEffect(() => {
    if (open) {
      fetchActivityTypes();
    }
  }, [open]);

  // Pré-remplissage du formulaire si une activité est passée en prop
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

      setPreviewImage(activity.media?.url || "/default-activity.png");
    } else {
      setFormData({
        name: "",
        activityTypeId: "",
        availableSpots: "",
        description: "",
        startDateTime: "",
        duration: "",
      });
      setPreviewImage(null);
    }
  }, [activity]);

  // Gestion du changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("activityTypeId", formData.activityTypeId);
      formDataToSend.append("availableSpots", formData.availableSpots);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("startDateTime", formData.startDateTime);
      formDataToSend.append("duration", formData.duration);
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      const url = activity
        ? `/api/activities/${activity.id}`
        : `/api/activities`;

      const method = activity ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!res.ok) throw new Error();

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
    }
  };

  // Création d'un nouveau type d'activité avec sélection automatique
  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/activities/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName }),
      });

      if (!res.ok) throw new Error();

      const newType = await res.json();

      // Mise à jour de la liste et sélection automatique du type créé
      setActivityTypes((prev) => [...prev, newType]);
      setFormData((prev) => ({ ...prev, activityTypeId: newType.id.toString() }));

      setIsNewTypeDialogOpen(false);
      setNewTypeName("");
    } catch (error) {
      console.error("Erreur lors de la création du type:", error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity ? "Modifier l'activité" : "Créer une activité"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Preview */}
          <div className="flex flex-col items-center gap-2">
            <Label>Image</Label>
            <div className="relative w-32 h-32 rounded-md border">
              <Image
                src={previewImage || "/default-activity.png"}
                alt="Activity Image"
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* Nom */}
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

          {/* Type d'activité */}
          <div className="space-y-2">
          <Label htmlFor="activityType">Type d&apos;activité</Label>
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
                {activityTypes.map((type) => (
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

          {/* Places disponibles */}
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

          {/* Description */}
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

          {/* Date et durée */}
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
            <Button type="submit">{activity ? "Modifier" : "Créer"}</Button>
          </div>
        </form>
      </DialogContent>

      <Dialog open={isNewTypeDialogOpen} onOpenChange={setIsNewTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau Type d&apos;Activité</DialogTitle>
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
