"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartConfig } from "../../components/ui/chart";
import { Calendar, ChartLine, Medal, Trophy, User } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalActivities: number;
  totalReservations: number;
  popularActivities: { name: string; _count: { reservations: number } }[];
  reservationsByMonth: { month: string; count: number }[];
}
export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb",
    },
    mobile: {
      label: "Mobile",
      color: "#60a5fa",
    },
  } satisfies ChartConfig;

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Administrateur</h1>

      {/* Cartes des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <User className="w-6 h-6 mr-2" />
              Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats?.totalUsers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              Activités
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats?.totalActivities}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Réservations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats?.totalReservations}
          </CardContent>
        </Card>
      </div>

      {/* Graphique des activités populaires */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Medal className="w-6 h-6 mr-2" />
            Activités les plus populaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
            <BarChart data={stats?.popularActivities}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Bar
                dataKey="_count.reservations"
                fill="var(--chart-1)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Graphique des réservations par mois */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ChartLine className="w-6 h-6 mr-2" />
            Réservations par mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
            <BarChart data={stats?.reservationsByMonth}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey="count" fill="var(--chart-2)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
