"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, ActivityType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type ActivityWithType = Activity & {
  activityType: ActivityType;
};

export default function ActivitiesAdmin() {
  const [activities, setActivities] = useState<ActivityWithType[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editActivity, setEditActivity] = useState<ActivityWithType | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    name: "",
    activityTypeId: "",
    availableSpots: "",
    description: "",
    startDateTime: "",
    duration: "",
  });

  useEffect(() => {
    fetchActivities();
    fetchActivityTypes();
  }, [search]);

  useEffect(() => {
    if (editActivity) {
      setEditFormData({
        name: editActivity.name,
        activityTypeId: editActivity.activityTypeId.toString(),
        availableSpots: editActivity.availableSpots.toString(),
        description: editActivity.description || "",
        startDateTime: new Date(editActivity.startDateTime)
          .toISOString()
          .slice(0, 16),
        duration: editActivity.duration.toString(),
      });
    }
  }, [editActivity]);

  const fetchActivities = async () => {
    try {
      const searchParams = new URLSearchParams();
      if (search) searchParams.append("search", search);
      const res = await fetch(`/api/activities?${searchParams.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityTypes = async () => {
    try {
      const res = await fetch("/api/activities/types");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActivityTypes(data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      fetchActivities();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
    setDeleteId(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editActivity) return;

    try {
      const res = await fetch(`/api/activities/${editActivity.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) throw new Error();

      fetchActivities();
      setEditActivity(null);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activités</h1>
        <Button asChild>
          <Link href="/admin/activities/">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Activité
          </Link>
        </Button>
      </div>

      <div>
        <Input
          placeholder="Rechercher une activité..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Places</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.name}</TableCell>
                <TableCell>{activity.activityType.name}</TableCell>
                <TableCell>{formatDate(activity.startDateTime)}</TableCell>
                <TableCell>{activity.availableSpots}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditActivity(activity)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(activity.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal d'édition */}
      <Dialog
        open={editActivity !== null}
        onOpenChange={() => setEditActivity(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'activité</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityType">Type d'activité</Label>
              <Select
                value={editFormData.activityTypeId}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, activityTypeId: value })
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableSpots">Places disponibles</Label>
              <Input
                id="availableSpots"
                type="number"
                min="1"
                value={editFormData.availableSpots}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    availableSpots: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDateTime">Date et heure de début</Label>
              <Input
                id="startDateTime"
                type="datetime-local"
                value={editFormData.startDateTime}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    startDateTime: e.target.value,
                  })
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
                value={editFormData.duration}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, duration: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setEditActivity(null)}
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette activité ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
