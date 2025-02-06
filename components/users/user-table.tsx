"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  media: { url: string }[];
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "USER",
  });

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    if (editUser) {
      setEditFormData({
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        role: editUser.role,
      });

      setPreviewImage(editUser.media?.[0]?.url || "/default-avatar.png");
    }
  }, [editUser]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/users`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(
        data.filter((user: User) =>
          `${user.firstName} ${user.lastName} ${user.email}`
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      );
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
    setDeleteId(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      const formData = new FormData();
      formData.append("firstName", editFormData.firstName);
      formData.append("lastName", editFormData.lastName);
      formData.append("email", editFormData.email);
      formData.append("role", editFormData.role);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PUT",
        body: formData, // ✅ Envoi en FormData
      });

      if (!res.ok) throw new Error();

      fetchUsers();
      setEditUser(null);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Image
                    src={user.media?.[0]?.url || "/default-avatar.png"}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={32}
                    height={32}
                    className="object-cover h-8 w-8 rounded-full"
                  />
                </TableCell>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditUser(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(user.id)}
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
      <Dialog open={editUser !== null} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;Utilisateur</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={previewImage || "/default-avatar.png"}
                    width={48}
                    height={48}
                    alt="Avatar"
                    className="object-cover h-12 w-12 rounded-full"
                  />
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={editFormData.firstName}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    firstName: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={editFormData.lastName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, lastName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Utilisateur</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditUser(null)}>
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
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
