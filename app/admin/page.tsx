"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Trophy, Calendar, Medal, ChartLine, Activity, Users } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalActivities: number;
  totalReservations: number;
  popularActivities: { name: string; _count: { reservations: number } }[];
  conversionRate: number | null;
  recentActivities: { name: string; startDateTime: string }[];
  activeUsers: number;
  activityTypeDistribution: { name: string; _count: { activities: number } }[];
  avgReservationsPerUser: number | null;
  upcomingActivities: { name: string; startDateTime: string }[];
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ChartLine className="w-6 h-6 mr-2" />
              Taux de Conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats?.conversionRate !== null ? `${stats.conversionRate.toFixed(2)}%` : 'N/A'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Utilisateurs Actifs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats?.activeUsers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="w-6 h-6 mr-2" />
              Réservations par Utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats?.avgReservationsPerUser !== null ? stats.avgReservationsPerUser.toFixed(2) : 'N/A'}
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.popularActivities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <Tooltip />
              <Legend />
              <Bar dataKey="_count.reservations" fill="#8884d8" animationBegin={600} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique de la répartition des types d'activités */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ChartLine className="w-6 h-6 mr-2" />
            Répartition des Types d&apos;Activités
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats?.activityTypeDistribution} dataKey="_count.activities" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {stats?.activityTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique des activités récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="w-6 h-6 mr-2" />
            Activités Récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.recentActivities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="startDateTime" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique des activités à venir */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Activités à Venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.upcomingActivities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="startDateTime" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
