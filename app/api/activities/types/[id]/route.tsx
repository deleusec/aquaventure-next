// app/api/activities/types/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Vérifier s'il y a des activités liées
    const type = await prisma.activityType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });

    if (type?._count?.activities && type._count.activities > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer un type utilisé par des activités" },
        { status: 400 }
      );
    }

    await prisma.activityType.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Type supprimé avec succès" });
  } catch (error) {
    console.error("Erreur de suppression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const typeId = parseInt(params.id);
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl = null;

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filePath = path.join(process.cwd(), "public/uploads", `${typeId}-${Date.now()}.jpg`);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${path.basename(filePath)}`;
    }

    const updatedType = await prisma.activityType.update({
      where: { id: typeId },
      data: {
        name,
        media: imageUrl
          ? {
              upsert: {
                where: { activityTypeId: typeId },
                create: { url: imageUrl, type: "ACTIVITY_TYPE" },
                update: { url: imageUrl },
              },
            }
          : undefined,
      },
      include: { media: true },
    });

    return NextResponse.json(updatedType);
  } catch (error) {
    console.error("Erreur de modification:", error);
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
  }
}