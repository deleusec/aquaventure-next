import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";

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
          media: true,
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
      activities: undefined,
      media: type.media || null,
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
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const data = { name, image: formData.get("image") as File };

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const type = await prisma.activityType.create({
      data: { name },
      include: {
        _count: {
          select: {
            activities: true,
          },
        },
        media: true,
      },
    });

    if (data.image) {
      try {
        const buffer = Buffer.from(await data.image.arrayBuffer());
        const fileName = `${type.id}-${Date.now()}.jpg`;
        const { url } = await put(`uploads/${fileName}`, buffer, { access: 'public' });
        console.log("Image uploaded successfully:", url);

        await prisma.activityType.update({
          where: { id: type.id },
          data: {
            name: data.name,
            media: {
              upsert: {
                where: { activityTypeId: type.id },
                create: { url: url, type: "ACTIVITY_TYPE" },
                update: { url: url },
              },
            },
          },
        });
      } catch (error) {
        console.error("Failed to upload image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
    }

    return NextResponse.json(type);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
  }
}
