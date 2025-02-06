"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Info, Trash2, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Reservation } from "@prisma/client";
import { formatDate, formatTime } from "@/lib/utils";

type BookingWithActivity = Reservation & {
  activity: {
    id: number;
    name: string;
    startDateTime: Date | string;
    duration: number;
    activityType: {
      name: string;
    };
  };
};

export default function Bookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<{
    upcoming: BookingWithActivity[];
    past: BookingWithActivity[];
    cancelled: BookingWithActivity[];
  }>({ upcoming: [], past: [], cancelled: [] });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] =
    useState<BookingWithActivity | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const fetchBookings = async () => {
    try {
      const searchParams = new URLSearchParams();
      if (search) searchParams.append("search", search);

      const res = await fetch(`/api/bookings?${searchParams.toString()}`);
      const data = await res.json();

      // Utiliser les réservations catégorisées
      setBookings(data.categorized);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;

    try {
      const res = await fetch("/api/bookings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: cancellingBooking.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'annulation");
      }

      // Mise à jour de la liste des réservations
      await fetchBookings();

      // Fermer la popup de confirmation
      setCancellingBooking(null);
    } catch (error) {
      setCancelError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  // Déclencher la recherche quand le composant monte et quand la recherche change
  useEffect(() => {
    fetchBookings();
  }, [search]);

  const renderBookingCard = (
    booking: BookingWithActivity,
    type: "upcoming" | "past" | "cancelled"
  ) => (
    <Card key={booking.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {booking.activity.name}
          {type === "past" ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : type === "cancelled" ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {booking.activity.activityType.name}
        </p>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            {formatDate(booking.activity.startDateTime)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span className="text-sm">
            {formatTime(booking.activity.startDateTime)} -{" "}
            {booking.activity.duration} min
          </span>
        </div>
      </CardContent>
      {type === "upcoming" && (
        <CardFooter>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setCancellingBooking(booking)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Rechercher une réservation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="upcoming">Réservations à venir</TabsTrigger>
          <TabsTrigger value="past">Réservations passées</TabsTrigger>
          <TabsTrigger value="cancelled">Réservations annulées</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.upcoming.length > 0 ? (
                bookings.upcoming.map((booking) =>
                  renderBookingCard(booking, "upcoming")
                )
              ) : (
                <div>Aucune réservation à venir</div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.past.length > 0 ? (
                bookings.past.map((booking) =>
                  renderBookingCard(booking, "past")
                )
              ) : (
                <div>Aucune réservation passée</div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled">
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.cancelled.length > 0 ? (
                bookings.cancelled.map((booking) =>
                  renderBookingCard(booking, "cancelled")
                )
              ) : (
                <div>Aucune réservation annulée</div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Popup de confirmation d'annulation */}
      <Dialog
        open={!!cancellingBooking}
        onOpenChange={() => setCancellingBooking(null)}
      >
        {cancellingBooking && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Annuler la réservation</DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment annuler la réservation pour{" "}
                <span className="font-medium">
                  {cancellingBooking.activity.name}
                </span>{" "}
                ?
              </DialogDescription>
            </DialogHeader>

            {cancelError && (
              <Alert variant="destructive">
                <AlertDescription>{cancelError}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancellingBooking(null)}
              >
                Retour
              </Button>
              <Button variant="destructive" onClick={handleCancelBooking}>
                Confirmer l'annulation
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
