import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";

// Schéma de validation pour les données de la requête PUT
const ActivitySchema = z.object({
  name: z.string(),
  activityTypeId: z.coerce.number(),
  availableSpots: z.coerce.number(),
  description: z.string(),
  startDateTime: z.coerce.date(),
  duration: z.coerce.number(),
  image: z.instanceof(File).nullable(),
});

export async function GET(request: NextRequest, { params }) {
  try {
    const activityId = parseInt(params.id);

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { activityType: true, media: true },
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

export async function PUT(request: NextRequest, { params }) {
  try {
    const activityId = parseInt(params.id);
    const formData = await request.formData();

    const data = {
      name: formData.get("name") as string,
      activityTypeId: parseInt(formData.get("activityTypeId") as string),
      availableSpots: parseInt(formData.get("availableSpots") as string),
      description: formData.get("description") as string,
      startDateTime: new Date(formData.get("startDateTime") as string),
      duration: parseInt(formData.get("duration") as string),
      image: formData.get("image") as File | null,
    };

    // Valider les données avec zod
    const result = ActivitySchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.errors },
        { status: 400 }
      );
    }

    let imageUrl = null;
    if (result.data.image) {
      const buffer = Buffer.from(await result.data.image.arrayBuffer());
      const filePath = path.join(
        process.cwd(),
        "public/uploads",
        `${activityId}-${Date.now()}.jpg`
      );
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${path.basename(filePath)}`;
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        ...result.data,
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
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}
