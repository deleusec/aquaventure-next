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
  // États
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

  // Nettoyage des états lors de la fermeture ou du démontage
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    };
  }, []);

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

  // Initialisation et nettoyage
  useEffect(() => {
    if (open) {
      fetchActivityTypes();
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
        setPreviewImage(activity.media?.[0]?.url || "/default-activity.png");
      }
    } else {
      // Nettoyage lors de la fermeture
      setTimeout(() => {
        setFormData({
          name: "",
          activityTypeId: "",
          availableSpots: "",
          description: "",
          startDateTime: "",
          duration: "",
        });
        setSelectedImage(null);
        setPreviewImage(null);
        setNewTypeName("");
        setIsNewTypeDialogOpen(false);
        document.body.style.pointerEvents = "";
        document.body.style.overflow = "";
      }, 300);
    }
  }, [open, activity]);

  // Gestionnaires d'événements
  const handleClose = () => {
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    setIsNewTypeDialogOpen(false);
    onOpenChange(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
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
      handleClose();
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
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

      const newType = await res.json();
      setActivityTypes((prev) => [...prev, newType]);
      setFormData((prev) => ({
        ...prev,
        activityTypeId: newType.id.toString(),
      }));
      setIsNewTypeDialogOpen(false);
      setNewTypeName("");
    } catch (error) {
      console.error("Erreur lors de la création du type:", error);
    }
  };

  // Rendu
  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activity ? "Modifier l'activité" : "Créer une activité"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Label>Image</Label>
              <div className="relative rounded-md border">
                {previewImage && (
                  <Image
                    src={previewImage}
                    alt="Activity Image"
                    width={100}
                    height={100}
                    loading="lazy"
                    className="rounded-md w-32 h-32 object-cover"
                  />
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

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
              <Label htmlFor="activityType">Type d&apos;activité</Label>
              <div className="flex gap-2">
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
                className="[&::-webkit-calendar-picker-indicator]:invert"
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
              <Button variant="outline" type="button" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit">{activity ? "Modifier" : "Créer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {isNewTypeDialogOpen && (
        <Dialog
          open={true}
          onOpenChange={(isOpen) => {
            document.body.style.pointerEvents = "";
            if (!isOpen) {
              setIsNewTypeDialogOpen(false);
              setNewTypeName("");
            }
          }}
        >
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
      )}
    </>
  );
}
