// app/api/activities/types/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET() {
  try {
    // On récupère uniquement les types qui ont des activités actives et disponibles
    const activityTypes = await prisma.activityType.findMany({
      where: {
        activities: {
          some: {
            AND: [
              { outdated: false },
              { availableSpots: { gt: 0 } },
              { startDateTime: { gt: new Date() } }
            ]
          }
        }
      },
      include: {
        // On inclut le count des activités disponibles pour chaque type
        activities: {
          where: {
            AND: [
              { outdated: false },
              { availableSpots: { gt: 0 } },
              { startDateTime: { gt: new Date() } }
            ]
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });

    // On formate la réponse pour inclure le nombre d'activités disponibles
    const formattedTypes = activityTypes.map(type => ({
      id: type.id,
      name: type.name,
      availableActivitiesCount: type.activities.length
    }));

    return NextResponse.json(formattedTypes);
  } catch (error) {
    console.error("Erreur de récupération des types:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des types" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const type = await prisma.activityType.create({
      data: { name: data.name },
      include: {
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });
    return NextResponse.json(type);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
  }
}
