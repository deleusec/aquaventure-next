import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {

    const totalUsers = await prisma.user.count();

    const totalActivities = await prisma.activity.count();

    const totalReservations = await prisma.reservation.count();

    const popularActivities = await prisma.activity.findMany({
      orderBy: {
        reservations: { _count: "desc" },
      },
      take: 5,
      select: {
        name: true,
        _count: {
          select: { reservations: true },
        },
      },
    });

    const conversionRate = (await prisma.reservation.count({ where: { status: true } })) / totalReservations * 100;

    const recentActivities = await prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });

    const activeUsers = await prisma.user.count({ where: { reservations: { some: { reservationDate: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } } } });

    const activityTypeDistribution = await prisma.activityType.findMany({ include: { _count: { select: { activities: true } } } });

    const avgReservationsPerUser = totalReservations / totalUsers;

    const upcomingActivities = await prisma.activity.findMany({ where: { startDateTime: { gte: new Date() } }, orderBy: { startDateTime: 'asc' }, take: 5 });

    const responseData = {
      totalUsers,
      totalActivities,
      totalReservations,
      popularActivities,
      conversionRate,
      recentActivities,
      activeUsers,
      activityTypeDistribution,
      avgReservationsPerUser,
      upcomingActivities,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des stats :", error);
    const errorResponse = { error: "Erreur lors de la récupération des statistiques" };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
