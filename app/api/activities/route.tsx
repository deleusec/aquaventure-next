import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { put } from '@vercel/blob';
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const activityTypeId = formData.get("activityTypeId") as string;
    const availableSpots = formData.get("availableSpots") as string;
    const description = formData.get("description") as string;
    const startDateTime = formData.get("startDateTime") as string;
    const duration = formData.get("duration") as string;
    const imageFile = formData.get("image") as File | null;

    // Vérification des données requises
    if (!name || !activityTypeId || !availableSpots || !startDateTime || !duration) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    let imageUrl = null;

    // Enregistrement de l'image si elle existe
    if (imageFile) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
    
        const webpBuffer = await sharp(buffer)
          .resize({ width: 512 }) 
          .webp({ quality: 80 })
          .toBuffer();
    
        const safeName = name.replace(/[^a-z0-9]/gi, "_").toLowerCase(); 
        const fileName = `${safeName}-${Date.now()}.webp`;
    
        const { url } = await put(`uploads/${fileName}`, webpBuffer, {
          access: "public",
          contentType: "image/webp",
        });
    
        imageUrl = url;
        console.log("Image uploaded successfully:", imageUrl);
      } catch (error) {
        console.error("Failed to upload image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
    }


    // Création de l'activité
    const activity = await prisma.activity.create({
      data: {
        name,
        activityTypeId: parseInt(activityTypeId),
        availableSpots: parseInt(availableSpots),
        description,
        startDateTime: new Date(startDateTime),
        duration: parseInt(duration),
      },
    });

    // Enregistrement de l'image en base de données si elle existe
    if (imageUrl) {
      await prisma.media.create({
        data: {
          url: imageUrl,
          type: "ACTIVITY",
          activityId: activity.id,
        },
      });
    }

    return NextResponse.json({ message: "Activité créée", activity });
  } catch (error) {
    console.error("Erreur de création:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const showOutdated = searchParams.get("showOutdated") === "true";
  const activityTypeIds = searchParams
    .getAll("activityTypeIds")
    .map((id) => parseInt(id))
    .filter((id) => !isNaN(id));

  const skip = (page - 1) * limit;
  const now = new Date();

  // Mise à jour des activités expirées
  await prisma.activity.updateMany({
    where: {
      startDateTime: { lt: now },
      outdated: false,
    },
    data: { outdated: true },
  });

  try {
    const whereClause = {
      name: { contains: search },
      ...(showOutdated ? {} : { outdated: false, availableSpots: { gt: 0 } }),
      ...(activityTypeIds.length > 0 && {
        activityTypeId: { in: activityTypeIds },
      }),
    };

    const [total, items] = await Promise.all([
      prisma.activity.count({ where: whereClause }),
      prisma.activity.findMany({
        where: whereClause,
        include: {
          activityType: true,
          media: true,
        },
        orderBy: {
          startDateTime: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}