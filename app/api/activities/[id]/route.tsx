import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = parseInt(params.id);

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { activityType: true, media: true },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activité non trouvée" }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Erreur de récupération:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = parseInt(params.id);
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const activityTypeId = parseInt(formData.get("activityTypeId") as string);
    const availableSpots = parseInt(formData.get("availableSpots") as string);
    const description = formData.get("description") as string;
    const startDateTime = new Date(formData.get("startDateTime") as string);
    const duration = parseInt(formData.get("duration") as string);
    const imageFile = formData.get("image") as File | null;

    let imageUrl = null;

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filePath = path.join(process.cwd(), "public/uploads", `${activityId}-${Date.now()}.jpg`);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${path.basename(filePath)}`;
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        name,
        activityTypeId,
        availableSpots,
        description,
        startDateTime,
        duration,
        media: imageUrl
          ? {
              upsert: {
                where: { activityId },
                create: { url: imageUrl, type: "ACTIVITY" },
                update: { url: imageUrl },
              },
            }
          : undefined,
      },
      include: { media: true },
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("Erreur de modification:", error);
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
  }
}
