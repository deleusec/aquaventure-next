import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { z } from "zod";

// Schéma de validation pour les données de la requête PUT
const ActivitySchema = z.object({
  name: z.string(),
  activityTypeId: z.coerce.number(),
  availableSpots: z.coerce.number(),
  description: z.string(),
  startDateTime: z.coerce.date(),
  duration: z.coerce.number(),
});

export async function GET(request, { params }) {
  try {
    const activityId = parseInt((await params).id);

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

export async function PUT(request, { params }) {
  try {
    const activityId = parseInt((await params).id);
    const formData = await request.formData();

    // Séparer les données du fichier
    const imageFile = formData.get("image") as Blob | null;
    const data = {
      name: formData.get("name") as string,
      activityTypeId: parseInt(formData.get("activityTypeId") as string),
      availableSpots: parseInt(formData.get("availableSpots") as string),
      description: formData.get("description") as string,
      startDateTime: new Date(formData.get("startDateTime") as string),
      duration: parseInt(formData.get("duration") as string),
    };

    // Valider les données sans le fichier
    const result = ActivitySchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.errors },
        { status: 400 }
      );
    }

    let imageUrl = null;
    if (imageFile) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const fileName = `${activityId}-${Date.now()}.jpg`;

        // Enregistrer la nouvelle image sur Vercel Blob
        const { url } = await put(`uploads/${fileName}`, buffer, { access: 'public' });
        imageUrl = url;
        console.log("Image uploaded successfully:", imageUrl);
      } catch (error) {
        console.error("Failed to upload image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
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

export async function DELETE(request, { params }) {
  try {
    const activityId = parseInt((await params).id);

    // Vérifier si l'activité existe avec ses réservations
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        reservations: true,
        media: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activité non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des réservations actives
    const activeReservations = activity.reservations.filter(
      (res) => res.status === true
    );
    if (activeReservations.length > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer une activité qui a des réservations actives",
        },
        { status: 400 }
      );
    }

    // Utiliser une transaction pour s'assurer que toutes les opérations sont effectuées
    await prisma.$transaction(async (tx) => {
      // Supprimer d'abord toutes les réservations associées
      await tx.reservation.deleteMany({
        where: { activityId },
      });

      // Supprimer les médias associés
      await tx.media.deleteMany({
        where: { activityId },
      });

      // Enfin, supprimer l'activité
      await tx.activity.delete({
        where: { id: activityId },
      });
    });

    return NextResponse.json({
      message:
        "Activité et toutes ses données associées supprimées avec succès",
    });
  } catch (error) {
    console.error("Erreur de suppression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
