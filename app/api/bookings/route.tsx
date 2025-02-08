import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const activityTypeId = searchParams.get("activityTypeId")
    ? parseInt(searchParams.get("activityTypeId") as string)
    : undefined;

  const skip = (page - 1) * limit;

  const now = new Date();

  // Mettre à jour les activités outdated
  await prisma.activity.updateMany({
    where: {
      startDateTime: {
        lt: now,
      },
      outdated: false,
    },
    data: {
      outdated: true,
    },
  });

  try {
    const whereCondition = {
      userId: Number(session.id),
      status: true,
      activity: {
        ...(activityTypeId && { activityTypeId }),
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            activityType: {
              name: {
                contains: search,
              },
            },
          },
        ],
      },
    };

    const [total, items] = await Promise.all([
      prisma.reservation.count({
        where: whereCondition,
      }),
      prisma.reservation.findMany({
        where: whereCondition,
        include: {
          activity: {
            include: {
              activityType: true,
            },
          },
        },
        orderBy: {
          activity: {
            startDateTime: "desc",
          },
        },
        skip,
        take: limit,
      }),
    ]);

    // Catégoriser les réservations
    const categorizedBookings = items.reduce(
      (acc, booking) => {
        if (!booking.activity.outdated) {
          acc.upcoming.push(booking);
        } else {
          acc.past.push(booking);
        }

        return acc;
      },
      {
        upcoming: [],
        past: [],
      }
    );

    return NextResponse.json({
      items,
      total,
      categorized: categorizedBookings,
    });
  } catch (error) {
    console.error("Erreur de récupération:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const activityId = data.activityId;

    if (!activityId) {
      return NextResponse.json(
        { error: "L'identifiant de l'activité est requis" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id: Number(activityId) },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activité non trouvée" },
        { status: 404 }
      );
    }

    if (activity.availableSpots <= 0) {
      return NextResponse.json(
        { error: "Aucune place disponible" },
        { status: 400 }
      );
    }

    const existingBooking = await prisma.reservation.findFirst({
      where: {
        userId: Number(session.id),
        activityId: Number(activityId),
        status: true,
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Vous avez déjà réservé cette activité" },
        { status: 400 }
      );
    }

    const booking = await prisma.reservation.create({
      data: {
        userId: Number(session.id),
        activityId: Number(activityId),
        status: true,
        reservationDate: new Date(),
      },
    });

    await prisma.activity.update({
      where: { id: Number(activityId) },
      data: { availableSpots: { decrement: 1 } },
    });

    // Envoyer un email de confirmation
    await sendMail(
      session.email,
      "Confirmation de réservation",
      `Votre réservation pour l'activité ${activity.name} a été confirmée.`
    );

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Erreur lors de la création de la réservation :", error);
    return NextResponse.json(
      {
        error: "Impossible de créer la réservation",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { bookingId } = await request.json();

    const existingBooking = await prisma.reservation.findUnique({
      where: {
        id: Number(bookingId),
        userId: Number(session.id),
      },
      include: {
        activity: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    const cancelledBooking = await prisma.reservation.update({
      where: { id: Number(bookingId) },
      data: {
        status: false,
      },
    });

    await prisma.activity.update({
      where: { id: existingBooking.activityId },
      data: {
        availableSpots: { increment: 1 },
      },
    });

    // Envoyer un email d'annulation
    await sendMail(
      session.email,
      "Annulation de réservation",
      `Votre réservation pour l'activité ${existingBooking.activity.name} a été annulée.`
    );

    return NextResponse.json(cancelledBooking);
  } catch (error) {
    console.error("Erreur lors de l'annulation de la réservation:", error);
    return NextResponse.json(
      { error: "Impossible d'annuler la réservation" },
      { status: 500 }
    );
  }
}
