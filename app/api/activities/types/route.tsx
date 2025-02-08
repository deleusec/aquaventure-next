// app/api/activities/types/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// app/api/activities/types/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showAvailable = searchParams.get("showAvailable") === "true";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  try {
    // Condition pour filtrer les types selon disponibilité
    const whereClause = {
      name: { contains: search },
      ...(showAvailable && {
        activities: {
          some: {
            AND: [
              { outdated: false },
              { availableSpots: { gt: 0 } },
              { startDateTime: { gt: new Date() } }
            ]
          }
        }
      })
    };

    const [total, items] = await Promise.all([
      prisma.activityType.count({
        where: whereClause
      }),
      prisma.activityType.findMany({
        where: whereClause,
        ...(showAvailable && {
          include: {
            _count: {
              select: {
                activities: {
                  where: {
                    outdated: false,
                    availableSpots: { gt: 0 },
                    startDateTime: { gt: new Date() }
                  }
                }
              }
            }
          }
        }),
        orderBy: { name: "asc" },
        skip,
        take: limit
      })
    ]);

    const formattedItems = showAvailable 
      ? items.map(type => ({
          ...type,
          availableActivitiesCount: type._count.activities
        }))
      : items;

    return NextResponse.json({ 
      items: formattedItems,
      total 
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
      },
    });
    return NextResponse.json(type);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
  }
}
