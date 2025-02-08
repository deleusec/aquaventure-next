"use client";

import { useState, useEffect } from "react";
import { ActivityType } from "@prisma/client";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription } from "../ui/alert";

interface ActivityTypeWithCount extends ActivityType {
  _count?: {
    activities: number;
  };
}

export default function ActivityTypesList() {
  const [types, setTypes] = useState<ActivityTypeWithCount[]>([]);
  const [editingType, setEditingType] = useState<ActivityTypeWithCount | null>(
    null
  );
  const [editTypeName, setEditTypeName] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isNewTypeDialogOpen, setIsNewTypeDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleEditType = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    try {
      const res = await fetch(`/api/activities/types/${editingType?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editTypeName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la modification");
      }

      await fetchTypes();
      setEditingType(null);
      setEditTypeName("");
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setEditError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  useEffect(() => {
    if (editingType) {
      setEditTypeName(editingType.name);
    }
  }, [editingType]);

  useEffect(() => {
    fetchTypes();
  }, [search, page, itemsPerPage]);

  const fetchTypes = async () => {
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: search,
      });

      const res = await fetch(`/api/activities/types?${searchParams}`);
      const data = await res.json();
      setTypes(data.items || []);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error("Erreur:", error);
      setTypes([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      const res = await fetch("/api/activities/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création");
      }

      await fetchTypes();
      setNewTypeName("");
      setIsNewTypeDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setCreateError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  const handleDeleteType = async (id: number) => {
    setDeleteError(null);
    try {
      const res = await fetch(`/api/activities/types/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      await fetchTypes();
      setDeleteId(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="Rechercher un type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsNewTypeDialogOpen(true)}>
          Nouveau Type
        </Button>
      </div>

      <div className="flex flex-1 flex-col rounded-t-lg border overflow-auto relative">
        <Table className="min-w-full border-collapse">
          {/* TableHeader bien fixé en haut */}
          <TableHeader className="sticky top-0 bg-background z-10 shadow-md">
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Nombre d&apos;activités</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types && types.length > 0 ? (
              types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type._count?.activities ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingType(type)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(type.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Aucun type d&apos;activité trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-x border-b bg-background p-4 rounded-t-none rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalItems} type{totalItems > 1 ? "s" : ""} d&apos;activité
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

      <Dialog
        open={editingType !== null}
        onOpenChange={(open) => !open && setEditingType(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le Type d&apos;Activité</DialogTitle>
          </DialogHeader>
          {editError && (
            <Alert variant="destructive">
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleEditType} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Nom du type</Label>
              <Input
                id="editName"
                value={editTypeName}
                onChange={(e) => setEditTypeName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingType(null)}
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour créer un nouveau type */}
      <Dialog open={isNewTypeDialogOpen} onOpenChange={setIsNewTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau Type d&apos;Activité</DialogTitle>
          </DialogHeader>
          {createError && (
            <Alert variant="destructive">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleCreateType} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du type</Label>
              <Input
                id="name"
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

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce type ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteType(deleteId)}
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
