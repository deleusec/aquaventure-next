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

  // Fetch activities and activity types on mount
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
    <div>
      <h1>Admin Page</h1>
    </div>
  );
}