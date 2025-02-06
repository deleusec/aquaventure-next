// app/api/activities/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Utiliser await sur params
    const { id } = await Promise.resolve(params);
    const activityId = parseInt(id);

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        activityType: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activité non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Erreur de récupération:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const activityId = parseInt(id);
    const data = await request.json();

    const activity = await prisma.activity.update({
      where: { id: activityId },
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
      { error: "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const activityId = parseInt(id);

    await prisma.activity.delete({ where: { id: activityId } });
    return NextResponse.json({ message: "Activité supprimée" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
