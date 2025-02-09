import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url, "http://localhost");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  try {
    const whereClause = {
      name: { contains: search },
    };

    const [total, items] = await Promise.all([
      prisma.activityType.count({
        where: whereClause,
      }),
      prisma.activityType.findMany({
        where: whereClause,
        include: {
          activities: {
            where: {
              outdated: false,
              availableSpots: { gt: 0 },
              startDateTime: { gt: new Date() },
            },
          },
          _count: {
            select: {
              activities: true,
            },
          },
          media: true, // Inclure les médias associés
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
    ]);

    const formattedItems = items.map((type) => ({
      ...type,
      totalActivities: type._count.activities,
      availableActivitiesCount: type.activities.length,
      activities: undefined, // Supprimer le tableau d'activités de la réponse
      media: type.media || null, // Inclure les médias dans la réponse
    }));

    return NextResponse.json({
      items: formattedItems,
      total,
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
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
        media: true,
      },
    });
    return NextResponse.json(type);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
  }
}
