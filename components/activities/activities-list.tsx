// app/admin/activities/components/activities-list.tsx
"use client";

import { useState, useEffect } from "react";
import { Activity, ActivityType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import NewActivityModal from "@/components/activities/activities-modal";
import EditActivityModal from "@/components/activities/edit-activities";


type ActivityWithType = Activity & {
  activityType: ActivityType;
};

export default function ActivitiesList() {
  // États
  const [activities, setActivities] = useState<ActivityWithType[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<ActivityWithType | null>(
    null
  );

  // Récupération des activités
  const fetchActivities = async () => {
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: search,
      });

      const res = await fetch(
        `/api/activities?showOutdated=true&${searchParams.toString()}`
      );
      if (!res.ok) throw new Error("Erreur de chargement");

      const data = await res.json();
      // Vérification et initialisation avec des valeurs par défaut
      setActivities(data.items || []);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error("Erreur:", error);
      setActivities([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [search, page, itemsPerPage]);

  // Gestion de la suppression
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await fetchActivities();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
    setDeleteId(null);
  };

  // Formatage de la date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // État de chargement
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="Rechercher une activité..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsNewActivityModalOpen(true)}>
          Nouvelle Activité
        </Button>
      </div>

      <div className="flex flex-1 flex-col rounded-t-lg border overflow-auto relative">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-md">
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date et heure</TableHead>
              <TableHead>Places</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(activities) && activities.length > 0 ? (
              activities.map((activity) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Aucune activité trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-x border-b bg-background p-4 rounded-t-none rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalItems} activité{totalItems > 1 ? "s" : ""}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Lignes par page</p>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setPage(1);
                  setItemsPerPage(parseInt(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {page} sur {Math.ceil(totalItems / itemsPerPage)}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(totalItems / itemsPerPage)}
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <NewActivityModal
        open={isNewActivityModalOpen}
        onOpenChange={setIsNewActivityModalOpen}
        onSuccess={fetchActivities}
      />

      <EditActivityModal
        activity={editActivity}
        open={editActivity !== null}
        onOpenChange={(open) => !open && setEditActivity(null)}
        onSuccess={fetchActivities}
      />

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
