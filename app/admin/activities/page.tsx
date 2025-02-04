"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function NewActivity() {
  const router = useRouter();
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    activityTypeId: "",
    availableSpots: "",
    description: "",
    startDateTime: "",
    duration: "",
  });
  const [activityError, setActivityError] = useState("");
  const [typeError, setTypeError] = useState("");

  const fetchActivityTypes = async () => {
    try {
      const res = await fetch("/api/activities/types");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActivityTypes(data);
    } catch (error) {
      setTypeError("Erreur lors du chargement des types d'activités");
    }
  };

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivityError("");

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

      router.push("/admin/activities");
    } catch (error) {
      setActivityError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    setTypeError("");

    try {
      const res = await fetch("/api/activities/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName }),
      });
      
      if (!res.ok) throw new Error();

      await fetchActivityTypes();
      setNewTypeName("");
      setIsDialogOpen(false);
    } catch (error) {
      setTypeError("Erreur lors de la création du type");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-6">Nouvelle Activité</h1>

      {activityError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{activityError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl w-full">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                {activityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setTypeError("");
              }}
            >
              <DialogTrigger asChild>
                <Button variant="secondary">+ Type</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau Type d'Activité</DialogTitle>
                </DialogHeader>
                {typeError && (
                  <Alert variant="destructive">
                    <AlertDescription>{typeError}</AlertDescription>
                  </Alert>
                )}
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
                  <Button type="submit" className="w-full">
                    Créer le type
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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

        <div className="pt-4">
          <Button type="submit" className="w-full">
            Créer l'activité
          </Button>
        </div>
      </form>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <Button type="submit" className="w-full">
              Créer le type
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
