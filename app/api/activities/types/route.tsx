// app/api/activities/types/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  try {
    // Récupère le total et les items paginés en parallèle
    const [total, items] = await Promise.all([
      prisma.activityType.count({
        where: {
          name: {
            contains: search,
          },
        },
      }),
      prisma.activityType.findMany({
        where: {
          name: {
            contains: search,
          },
        },
        include: {
          _count: {
            select: {
              activities: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      items,
      total,
    });
  } catch (error) {
    console.error("Erreur de récupération:", error);
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
    return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
  }
}
