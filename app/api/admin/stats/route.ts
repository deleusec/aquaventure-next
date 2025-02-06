import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalActivities = await prisma.activity.count();
    const totalReservations = await prisma.reservation.count();

    const popularActivities = await prisma.activity.findMany({
      orderBy: {
        reservations: { _count: "desc" }
      },
      take: 5,
      select: {
        name: true,
        _count: {
          select: { reservations: true }
        }
      }
    });

    // Convertir les BigInt en Number
    const reservationsByMonth = await prisma.$queryRaw<
      { month: string | null; count: number }[]
    >`
      SELECT strftime('%Y-%m', reservationDate) as month, COUNT(*) as count
      FROM Reservation
      GROUP BY month
      ORDER BY month ASC
    `;

    const formattedReservationsByMonth = reservationsByMonth.map((r) => ({
      month: r.month ?? "Inconnu",
      count: Number(r.count)
    }));

    console.log({
      totalUsers,
      totalActivities,
      totalReservations,
      popularActivities,
      reservationsByMonth: formattedReservationsByMonth
    });

    return NextResponse.json(
      {
        totalUsers,
        totalActivities,
        totalReservations,
        popularActivities,
        reservationsByMonth: formattedReservationsByMonth
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des stats :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
