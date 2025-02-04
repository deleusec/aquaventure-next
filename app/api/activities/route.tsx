import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (
      !data.name ||
      !data.activityTypeId ||
      !data.availableSpots ||
      !data.startDateTime ||
      !data.duration
    ) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        name: data.name,
        activityTypeId: parseInt(data.activityTypeId),
        availableSpots: parseInt(data.availableSpots),
        description: data.description,
        startDateTime: new Date(data.startDateTime),
        duration: parseInt(data.duration),
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  try {
    const activities = await prisma.activity.findMany({
      where: {
        ...(search && {
          name: {
            contains: search
          }
        })
      },
      include: {
        activityType: true
      },
      orderBy: {
        startDateTime: 'asc'
      }
    });
    
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}