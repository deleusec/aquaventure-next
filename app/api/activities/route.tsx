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
